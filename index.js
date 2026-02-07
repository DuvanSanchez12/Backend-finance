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

// --- CONFIGURACIÓN DE SEGURIDAD ---
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

app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/stocks", stockRoutes);

// --- CACHE DE PRECIOS EN TIEMPO REAL ---
const currentPrices = {}; // Aquí guardamos el último precio recibido de cada moneda

// --- LÓGICA DE WEBSOCKETS (FINNHUB) ---
let finnhubWs;

function connectFinnhub() {
  console.log("🔄 Conectando a Finnhub...");
  finnhubWs = new WebSocket(`wss://ws.finnhub.io?token=${process.env.FINNHUB_API_KEY}`);

  finnhubWs.on('open', async () => {
    console.log("🔌 WebSocket de Finnhub Activo");
    try {
      const assets = await Asset.find({});
      assets.forEach(asset => {
        finnhubWs.send(JSON.stringify({ type: 'subscribe', symbol: asset.symbol }));
        // Inicializamos el cache con el openPrice para evitar nulos
        const symbol = asset.symbol.includes(':') ? asset.symbol.split(':')[1] : asset.symbol;
        currentPrices[symbol] = asset.openPrice;
      });
    } catch (error) { console.error("❌ Error en suscripción:", error); }
  });

  finnhubWs.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      if (message.type === 'trade') {
        const trades = message.data;
        io.emit('market-data', trades); // Envío inmediato al frontend para el parpadeo

        // Actualizamos el cache con el precio más reciente
        trades.forEach(trade => {
          const symbol = trade.s.includes(':') ? trade.s.split(':')[1] : trade.s;
          currentPrices[symbol] = trade.p;
        });
      }
    } catch (err) { console.error("❌ Error procesando mensaje:", err); }
  });

  finnhubWs.on('close', () => {
    console.log("⚠️ Conexión cerrada. Reintentando...");
    setTimeout(connectFinnhub, 5000);
  });
}

connectFinnhub();

// --- TAREA PROGRAMADA: GUARDADO FORZADO CADA MINUTO ---
// Esto garantiza que las 40 monedas tengan registro, haya trades o no.
cron.schedule("* * * * *", async () => {
  console.log("⏱️ Persistiendo minuto exacto para los 40 activos...");
  try {
    const assets = await Asset.find();
    const now = new Date();

    const historyPromises = assets.map(async (asset) => {
      const symbol = asset.symbol.includes(':') ? asset.symbol.split(':')[1] : asset.symbol;
      
      // Si no hubo trades en el último minuto, usamos el último precio conocido del cache
      const priceToSave = currentPrices[symbol] || asset.openPrice;

      return History.create({
        symbol: symbol,
        price: priceToSave,
        timestamp: now
      });
    });

    await Promise.all(historyPromises);
    console.log(`✅ Historial completado para ${assets.length} activos.`);
  } catch (err) {
    console.error("❌ Error en guardado de historial:", err);
  }
});

// --- CRON JOB: ACTUALIZACIÓN DE APERTURA (00:00 UTC) ---
cron.schedule("0 0 * * *", async () => {
  console.log("🕛 Media noche: Sincronizando precio de apertura con el registro de las 00:00...");
  try {
    const assets = await Asset.find();
    for (const asset of assets) {
      const cleanSymbol = asset.symbol.includes(':') ? asset.symbol.split(':')[1] : asset.symbol;
      
      // Buscamos el registro que el cron de arriba acaba de guardar exactamente a las 00:00
      const openRecord = await History.findOne({ symbol: cleanSymbol }).sort({ timestamp: -1 });
      
      if (openRecord) {
        asset.openPrice = openRecord.price;
        asset.lastUpdated = new Date();
        await asset.save();
      }
    }
    // Notificamos al frontend del nuevo precio base del día
    const updatedAssets = await Asset.find();
    io.emit("initial-prices", updatedAssets.map(a => ({
      ...a._doc,
      symbol: a.symbol.includes(':') ? a.symbol.split(':')[1] : a.symbol
    })));
    console.log("✅ openPrice reescrito para el nuevo ciclo de 24h.");
  } catch (err) {
    console.error("❌ Error en sincronización diaria:", err);
  }
}, { timezone: "UTC" });
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
// --- CONEXIÓN Y ARRANQUE ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("🚀 Backend conectado a MongoDB Atlas"))
  .catch((err) => console.error("❌ Error de conexión MongoDB:", err));

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;