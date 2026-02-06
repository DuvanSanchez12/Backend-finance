import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import WebSocket from "ws";
import authRoutes from "./routes/auth.routes.js";
import stockRoutes from "./routes/stock.routes.js";
import Asset from "./models/Asset.js";
import History from "./models/History.js";
import cron from "node-cron";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// --- CONFIGURACIÓN DE SEGURIDAD (CORS) ---
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://finance-next-js-websockets.vercel.app",
];

const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- RUTAS ---
app.use("/api/auth", authRoutes);
app.use("/api/stocks", stockRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "Servidor funcionando correctamente",
    timestamp: new Date(),
  });
});

// --- LÓGICA DE WEBSOCKETS CON RECONEXIÓN (FINNHUB) ---
let finnhubWs;
const lastSavedPrices = {}; // Control de persistencia (5 min)

function connectFinnhub() {
  let retryDelay = 5000; // Empezamos con 5 segundos

  function connectFinnhub() {
    finnhubWs = new WebSocket(
      `wss://ws.finnhub.io?token=${process.env.FINNHUB_API_KEY}`,
    );

    finnhubWs.on("open", () => {
      console.log("🔌 Conectado a Finnhub");
      retryDelay = 5000; // Resetear el delay si la conexión es exitosa
      // ... resto de tu lógica de suscripción
    });

    finnhubWs.on("error", (err) => {
      if (err.message.includes("429")) {
        console.error(
          "⚠️ Límite de Finnhub alcanzado (429). Esperando más tiempo para reintentar...",
        );
        retryDelay = Math.min(retryDelay * 2, 60000); // Duplicar espera hasta un máximo de 1 minuto
      } else {
        console.error("❌ Error en WebSocket:", err.message);
      }
    });

    finnhubWs.on("close", () => {
      console.log(
        `⚠️ Conexión perdida. Reintentando en ${retryDelay / 1000}s...`,
      );
      setTimeout(connectFinnhub, retryDelay);
    });
  }

  finnhubWs.on("message", async (data) => {
    const message = JSON.parse(data);

    if (message.type === "trade") {
      const trades = message.data;

      // Enviamos datos en tiempo real al frontend
      io.emit("market-data", trades);

      // --- LÓGICA DE PERSISTENCIA (Cada 5 minutos) ---
      for (const trade of trades) {
        const symbol = trade.s.includes(":") ? trade.s.split(":")[1] : trade.s;
        const now = Date.now();

        if (
          !lastSavedPrices[symbol] ||
          now - lastSavedPrices[symbol] > 300000
        ) {
          try {
            await History.create({
              symbol: symbol,
              price: trade.p,
              timestamp: new Date(now),
            });
            lastSavedPrices[symbol] = now;
            console.log(
              `💾 Historial persistido para ${symbol} a las ${new Date(now).toLocaleTimeString()}`,
            );
          } catch (err) {
            console.error(`❌ Error guardando historial para ${symbol}:`, err);
          }
        }
      }
    }
  });

  finnhubWs.on("error", (err) => {
    console.error("❌ Error en WebSocket de Finnhub:", err.message);
  });

  finnhubWs.on("close", () => {
    console.log(
      "⚠️ Conexión con Finnhub perdida. Reintentando en 5 segundos...",
    );
    setTimeout(connectFinnhub, 5000); // Intento de reconexión
  });
}

// Iniciar conexión Finnhub
connectFinnhub();

// --- SOCKET.IO (CLIENTES FRONTEND) ---
io.on("connection", async (socket) => {
  try {
    const savedAssets = await Asset.find();
    const cleanAssets = savedAssets.map((asset) => ({
      ...asset._doc,
      symbol: asset.symbol.includes(":")
        ? asset.symbol.split(":")[1]
        : asset.symbol,
    }));

    if (cleanAssets.length > 0) {
      socket.emit("initial-prices", cleanAssets);
    }
  } catch (error) {
    console.error("❌ Error al enviar precios iniciales:", error);
  }
});

// --- CRON JOBS (Sincronización de Precios) ---

// 1. Media noche UTC: Sincronizar precio de apertura diario
cron.schedule(
  "0 0 * * *",
  async () => {
    console.log("🕛 Media noche UTC: Actualizando precios de apertura...");
    try {
      const assets = await Asset.find();
      for (const asset of assets) {
        const lastPrice = await History.findOne({ symbol: asset.symbol }).sort({
          timestamp: -1,
        });
        if (lastPrice) {
          asset.openPrice = lastPrice.price;
          asset.lastUpdated = new Date();
          await asset.save();
        }
      }
      const updatedAssets = await Asset.find();
      io.emit("initial-prices", updatedAssets);
      console.log("✅ Precios de apertura sincronizados.");
    } catch (err) {
      console.error("❌ Error en cron diario:", err);
    }
  },
  { timezone: "UTC" },
);

// 2. Apertura Wall Street (Acciones)
cron.schedule(
  "30 9 * * 1-5",
  async () => {
    console.log(
      "🔔 Apertura de Wall Street: Reseteando precios de Acciones...",
    );
    try {
      const stocks = await Asset.find({ type: "stock" });
      for (const stock of stocks) {
        const lastTrade = await History.findOne({ symbol: stock.symbol }).sort({
          timestamp: -1,
        });
        if (lastTrade) {
          stock.openPrice = lastTrade.price;
          await stock.save();
        }
      }
      const updatedAssets = await Asset.find();
      io.emit("initial-prices", updatedAssets);
    } catch (err) {
      console.error("❌ Error en cron de Wall Street:", err);
    }
  },
  { timezone: "America/New_York" },
);

// --- CONEXIÓN BASE DE DATOS Y ARRANQUE ---
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("🚀 Backend conectado a MongoDB Atlas"))
  .catch((err) => console.error("❌ Error de conexión MongoDB:", err));

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
