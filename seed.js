import mongoose from 'mongoose';
import Asset from './models/Asset.js'; 
import dotenv from 'dotenv';

dotenv.config();

const assetsData = [
  { symbol: "BINANCE:BTCUSDT", openPrice: 66207.35, name: "Bitcoin", type: "crypto" },
  { symbol: "BINANCE:ETHUSDT", openPrice: 2062.21, name: "Ethereum", type: "crypto" },
  { symbol: "BINANCE:SOLUSDT", openPrice: 88.71, name: "Solana", type: "crypto" },
  { symbol: "BINANCE:BNBUSDT", openPrice: 663.06, name: "BNB", type: "crypto" },
  { symbol: "BINANCE:XRPUSDT", openPrice: 1.47, name: "XRP", type: "crypto" },
  { symbol: "BINANCE:ADAUSDT", openPrice: 0.27, name: "Cardano", type: "crypto" },
  { symbol: "BINANCE:LINKUSDT", openPrice: 8.88, name: "Chainlink", type: "crypto" },
  { symbol: "BINANCE:DOGEUSDT", openPrice: 0.09, name: "Dogecoin", type: "crypto" },
  { symbol: "BINANCE:AVAXUSDT", openPrice: 9.22, name: "Avalanche", type: "crypto" },
  { symbol: "BINANCE:DOTUSDT", openPrice: 4.15, name: "Polkadot", type: "crypto" },
  { symbol: "BINANCE:MATICUSDT", openPrice: 0.09, name: "Polygon", type: "crypto" },
  { symbol: "BINANCE:NEARUSDT", openPrice: 3.12, name: "Near Protocol", type: "crypto" },
  { symbol: "BINANCE:LTCUSDT", openPrice: 55.14, name: "Litecoin", type: "crypto" },
  { symbol: "BINANCE:UNIUSDT", openPrice: 6.45, name: "Uniswap", type: "crypto" },
  { symbol: "BINANCE:SHIBUSDT", openPrice: 0.000014, name: "Shiba Inu", type: "crypto" },
  { symbol: "BINANCE:BCHUSDT", openPrice: 503.33, name: "Bitcoin Cash", type: "crypto" },
  { symbol: "BINANCE:TIAUSDT", openPrice: 4.25, name: "Celestia", type: "crypto" },
  { symbol: "BINANCE:APTUSDT", openPrice: 6.80, name: "Aptos", type: "crypto" },
  { symbol: "BINANCE:INJUSDT", openPrice: 16.40, name: "Injective", type: "crypto" },
  { symbol: "BINANCE:OPUSDT", openPrice: 1.25, name: "Optimism", type: "crypto" },
  { symbol: "BINANCE:ARBUSDT", openPrice: 0.52, name: "Arbitrum", type: "crypto" },
  { symbol: "BINANCE:RNDRUSDT", openPrice: 4.10, name: "Render", type: "crypto" },
  { symbol: "BINANCE:XLMUSDT", openPrice: 0.16, name: "Stellar", type: "crypto" },
  { symbol: "BINANCE:ATOMUSDT", openPrice: 3.85, name: "Cosmos", type: "crypto" },
  { symbol: "BINANCE:ICPUSDT", openPrice: 7.10, name: "Internet Computer", type: "crypto" },
  { symbol: "BINANCE:FILUSDT", openPrice: 3.20, name: "Filecoin", type: "crypto" },
  { symbol: "BINANCE:HBARUSDT", openPrice: 0.09, name: "Hedera", type: "crypto" },
  { symbol: "BINANCE:ETCUSDT", openPrice: 8.77, name: "Ethereum Classic", type: "crypto" },
  { symbol: "BINANCE:STXUSDT", openPrice: 1.05, name: "Stacks", type: "crypto" },
  { symbol: "BINANCE:SUIUSDT", openPrice: 0.96, name: "Sui", type: "crypto" },
  { symbol: "BINANCE:GRTUSDT", openPrice: 0.14, name: "The Graph", type: "crypto" },
  { symbol: "BINANCE:AAVEUSDT", openPrice: 122.00, name: "Aave", type: "crypto" },
  { symbol: "BINANCE:IMXUSDT", openPrice: 1.15, name: "Immutable", type: "crypto" },
  { symbol: "BINANCE:SEIUSDT", openPrice: 0.38, name: "Sei", type: "crypto" },
  { symbol: "BINANCE:ORDIUSDT", openPrice: 22.50, name: "ORDI", type: "crypto" },
  { symbol: "BINANCE:VETUSDT", openPrice: 0.02, name: "VeChain", type: "crypto" },
  { symbol: "BINANCE:MNTUSDT", openPrice: 0.65, name: "Mantle", type: "crypto" },
  { symbol: "BINANCE:MKRUSDT", openPrice: 1450.00, name: "Maker", type: "crypto" },
  { symbol: "BINANCE:EGLDUSDT", openPrice: 24.80, name: "MultiversX", type: "crypto" },
  { symbol: "BINANCE:ALGOUSDT", openPrice: 0.11, name: "Algorand", type: "crypto" }
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