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

finnhubWs.on('open', () => {
  // Suscríbete a los símbolos que necesitas para tu canal "Código Lógico"
  const symbols = [
  "BINANCE:BTCUSDT", 
  "BINANCE:ETHUSDT", 
  "BINANCE:BNBUSDC", 
  "BINANCE:XRPUSDT", 
  "BINANCE:ADAUSDT"
];
  symbols.forEach(s => {
    finnhubWs.send(JSON.stringify({ type: 'subscribe', symbol: s }));
  });
});

io.on('connection', async (socket) => {
  try {
    // Buscamos los precios base en Atlas
    const savedAssets = await Asset.find();
    
    // Si tienes datos, se los enviamos al frontend
    if (savedAssets.length > 0) {
      socket.emit('initial-prices', savedAssets);
    }
    console.log(`👤 Cliente conectado: ${socket.id}`);
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