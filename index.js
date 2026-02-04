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

dotenv.config();

const app = express();
const httpServer = createServer(app); // Creamos el servidor HTTP

// Configuración de Socket.io para el Frontend
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});

// Middlewares
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);

// --- LÓGICA DE WEBSOCKETS (FINNHUB RELAY) ---
const finnhubWs = new WebSocket(`wss://ws.finnhub.io?token=${process.env.FINNHUB_API_KEY}`);

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