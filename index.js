import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http'; //
import { Server } from 'socket.io'; //
import WebSocket from 'ws'; // Cliente para Finnhub
import authRoutes from './routes/auth.routes.js';
import stockRoutes from './routes/stock.routes.js';
import Asset from './models/Asset.js';
import History from './models/History.js';
import cron from 'node-cron';
dotenv.config();

const app = express();
const httpServer = createServer(app); // Creamos el servidor HTTP

// Configuración de Socket.io para el Frontend
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
    credentials: true
  }
});

// Middlewares
app.use(cors({
  origin: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);

// --- LÓGICA DE WEBSOCKETS (FINNHUB RELAY) ---
const finnhubWs = new WebSocket(`wss://ws.finnhub.io?token=${process.env.FINNHUB_API_KEY}`);

cron.schedule('0 0 * * *', async () => {
  console.log("🕛 Media noche UTC: Actualizando precios de apertura...");
  
  try {
    const assets = await Asset.find();
    
    for (const asset of assets) {
      // 1. Buscamos el último precio guardado en nuestro historial
      const lastPrice = await History.findOne({ symbol: asset.symbol })
                                     .sort({ timestamp: -1 });

      if (lastPrice) {
        // 2. Este precio de 'cierre' de ayer es la 'apertura' de hoy
        asset.openPrice = lastPrice.price;
        asset.lastUpdated = new Date();
        await asset.save();
      }
    }
    
    // 3. Avisamos a todos los usuarios conectados que el % cambió
    const updatedAssets = await Asset.find();
    io.emit('initial-prices', updatedAssets);
    
    console.log("✅ Precios de apertura sincronizados para el nuevo día.");
  } catch (err) {
    console.error("❌ Fallo al actualizar precios diarios:", err);
  }
}, {
  timezone: "UTC"
});

cron.schedule('30 9 * * 1-5', async () => {
  console.log("🔔 Apertura de Wall Street: Reseteando precios de Acciones...");
  try {
    const stocks = await Asset.find({ type: 'stock' });
    for (const stock of stocks) {
      const lastTrade = await History.findOne({ symbol: stock.symbol })
                                     .sort({ timestamp: -1 });
      if (lastTrade) {
        stock.openPrice = lastTrade.price;
        await stock.save();
      }
    }
    const updatedAssets = await Asset.find();
    io.emit('initial-prices', updatedAssets);
  } catch (err) {
    console.error("❌ Error en cron de Acciones:", err);
  }
}, { timezone: "America/New_York" });

finnhubWs.on('open', async () => {
  try {
    // 1. Buscamos todas las monedas que tienes registradas en tu DB
    const assets = await Asset.find({});
    
    if (assets.length === 0) {
      console.log("⚠️ No hay símbolos en la DB para suscribirse.");
      return;
    }

    // 2. Nos suscribimos dinámicamente a cada una
    assets.forEach(asset => {
      // Usamos el símbolo original (ej: BINANCE:BTCUSDT)
      finnhubWs.send(JSON.stringify({ type: 'subscribe', symbol: asset.symbol }));
    });
    
    console.log(`✅ Suscrito exitosamente a ${assets.length} activos.`);
  } catch (error) {
    console.error("❌ Error en la suscripción dinámica:", error);
  }
});

io.on('connection', async (socket) => {
  try {
    const savedAssets = await Asset.find();
    
    // Mapeamos los assets para asegurar que el símbolo esté "limpio" (ej: BTCUSDT)
    const cleanAssets = savedAssets.map(asset => ({
      ...asset._doc,
      symbol: asset.symbol.includes(':') ? asset.symbol.split(':')[1] : asset.symbol
    }));

    if (cleanAssets.length > 0) {
      socket.emit('initial-prices', cleanAssets);
    }
  } catch (error) {
    console.error("❌ Error al obtener assets de MongoDB:", error);
  }
});

const lastSavedPrices = {}; // Para controlar el tiempo de guardado por moneda

finnhubWs.on('message', async (data) => {
  const message = JSON.parse(data);
  
  if (message.type === 'trade') {
    const trades = message.data;
    io.emit('market-data', trades); // Seguimos enviando tiempo real al frontend

    // --- LÓGICA DE PERSISTENCIA ---
    for (const trade of trades) {
      const symbol = trade.s.includes(':') ? trade.s.split(':')[1] : trade.s;
      const now = Date.now();

      // Solo guardamos en Mongo si han pasado 5 minutos (300,000 ms)
      if (!lastSavedPrices[symbol] || now - lastSavedPrices[symbol] > 300000) {
        try {
          await History.create({
            symbol: symbol,
            price: trade.p,
            timestamp: new Date(now)
          });
          lastSavedPrices[symbol] = now;
          console.log(`💾 Historial persistido para ${symbol}`);
        } catch (err) {
          console.error("❌ Error guardando historial:", err);
        }
      }
    }
  }
});
// --------------------------------------------

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("🚀 Backend conectado a MongoDB Atlas"))
  .catch((err) => console.error("❌ Error de conexión:", err));

app.get('/api/health', (req, res) => {
  res.json({ status: "Servidor funcionando correctamente" });
});

const PORT = process.env.PORT || 3001;

// IMPORTANTE: Ahora usamos httpServer.listen en lugar de app.listen
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;