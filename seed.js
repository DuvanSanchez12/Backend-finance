import mongoose from 'mongoose';
import Asset from './models/Asset.js'; 
import dotenv from 'dotenv';

dotenv.config();

const assetsData = [
  // --- TOP 24 (Principales) ---
  { symbol: "BINANCE:BTCUSDT", openPrice: 103450.00, name: "Bitcoin", type: "crypto" },
  { symbol: "BINANCE:ETHUSDT", openPrice: 2820.00, name: "Ethereum", type: "crypto" },
  { symbol: "BINANCE:SOLUSDT", openPrice: 215.50, name: "Solana", type: "crypto" },
  { symbol: "BINANCE:BNBUSDT", openPrice: 685.00, name: "BNB", type: "crypto" },
  { symbol: "BINANCE:XRPUSDT", openPrice: 3.10, name: "XRP", type: "crypto" },
  { symbol: "BINANCE:ADAUSDT", openPrice: 1.05, name: "Cardano", type: "crypto" },
  { symbol: "BINANCE:LINKUSDT", openPrice: 24.10, name: "Chainlink", type: "crypto" },
  { symbol: "BINANCE:DOGEUSDT", openPrice: 0.40, name: "Dogecoin", type: "crypto" },
  { symbol: "BINANCE:AVAXUSDT", openPrice: 38.20, name: "Avalanche", type: "crypto" },
  { symbol: "BINANCE:DOTUSDT", openPrice: 8.90, name: "Polkadot", type: "crypto" },
  { symbol: "BINANCE:MATICUSDT", openPrice: 0.70, name: "Polygon", type: "crypto" },
  { symbol: "BINANCE:NEARUSDT", openPrice: 6.20, name: "Near Protocol", type: "crypto" },
  { symbol: "BINANCE:LTCUSDT", openPrice: 115.00, name: "Litecoin", type: "crypto" },
  { symbol: "BINANCE:UNIUSDT", openPrice: 12.80, name: "Uniswap", type: "crypto" },
  { symbol: "BINANCE:SHIBUSDT", openPrice: 0.000030, name: "Shiba Inu", type: "crypto" },
  { symbol: "BINANCE:BCHUSDT", openPrice: 505.00, name: "Bitcoin Cash", type: "crypto" },
  { symbol: "BINANCE:TIAUSDT", openPrice: 9.80, name: "Celestia", type: "crypto" },
  { symbol: "BINANCE:APTUSDT", openPrice: 12.40, name: "Aptos", type: "crypto" },
  { symbol: "BINANCE:INJUSDT", openPrice: 30.50, name: "Injective", type: "crypto" },
  { symbol: "BINANCE:OPUSDT", openPrice: 3.30, name: "Optimism", type: "crypto" },
  { symbol: "BINANCE:ARBUSDT", openPrice: 1.12, name: "Arbitrum", type: "crypto" },
  { symbol: "BINANCE:RNDRUSDT", openPrice: 9.40, name: "Render", type: "crypto" },
  { symbol: "BINANCE:XLMUSDT", openPrice: 0.45, name: "Stellar", type: "crypto" },
  { symbol: "BINANCE:ATOMUSDT", openPrice: 8.20, name: "Cosmos", type: "crypto" },

  // --- TOP 25-48 (Altcoins adicionales) ---
  { symbol: "BINANCE:ICPUSDT", openPrice: 11.20, name: "Internet Computer", type: "crypto" },
  { symbol: "BINANCE:FILUSDT", openPrice: 5.80, name: "Filecoin", type: "crypto" },
  { symbol: "BINANCE:HBARUSDT", openPrice: 0.15, name: "Hedera", type: "crypto" },
  { symbol: "BINANCE:ETCUSDT", openPrice: 28.50, name: "Ethereum Classic", type: "crypto" },
  { symbol: "BINANCE:STXUSDT", openPrice: 2.10, name: "Stacks", type: "crypto" },
  { symbol: "BINANCE:SUIUSDT", openPrice: 1.85, name: "Sui", type: "crypto" },
  { symbol: "BINANCE:GRTUSDT", openPrice: 0.32, name: "The Graph", type: "crypto" },
  { symbol: "BINANCE:AAVEUSDT", openPrice: 155.00, name: "Aave", type: "crypto" },
  { symbol: "BINANCE:IMXUSDT", openPrice: 2.40, name: "Immutable", type: "crypto" },
  { symbol: "BINANCE:SEIUSDT", openPrice: 0.78, name: "Sei", type: "crypto" },
  { symbol: "BINANCE:ORDIUSDT", openPrice: 42.00, name: "ORDI", type: "crypto" },
  { symbol: "BINANCE:VETUSDT", openPrice: 0.042, name: "VeChain", type: "crypto" },
  { symbol: "BINANCE:MNTUSDT", openPrice: 1.15, name: "Mantle", type: "crypto" },
  { symbol: "BINANCE:MKRUSDT", openPrice: 1980.00, name: "Maker", type: "crypto" },
  { symbol: "BINANCE:EGLDUSDT", openPrice: 48.20, name: "MultiversX", type: "crypto" },
  { symbol: "BINANCE:ALGOUSDT", openPrice: 0.22, name: "Algorand", type: "crypto" },
  { symbol: "BINANCE:THETAUSDT", openPrice: 1.95, name: "Theta Network", type: "crypto" },
  { symbol: "BINANCE:FLOWUSDT", openPrice: 1.05, name: "Flow", type: "crypto" },
  { symbol: "BINANCE:QNTUSDT", openPrice: 92.40, name: "Quant", type: "crypto" },
  { symbol: "BINANCE:AXSUSDT", openPrice: 7.80, name: "Axie Infinity", type: "crypto" },
  { symbol: "BINANCE:FTMUSDT", openPrice: 0.85, name: "Fantom", type: "crypto" },
  { symbol: "BINANCE:SANDUSDT", openPrice: 0.65, name: "The Sandbox", type: "crypto" },
  { symbol: "BINANCE:MANAUSDT", openPrice: 0.58, name: "Decentraland", type: "crypto" },
  { symbol: "BINANCE:PEPEUSDT", openPrice: 0.000018, name: "Pepe", type: "crypto" }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🚀 Conectado a MongoDB Atlas...");
    
    await Asset.deleteMany({});
    console.log("🗑️ Colección limpiada.");

    await Asset.insertMany(assetsData);
    
    console.log("✅ 48 Criptomonedas sembradas correctamente.");
    process.exit();
  } catch (err) {
    console.error("❌ Error en el seed:", err);
    process.exit(1);
  }
};

seedDB();