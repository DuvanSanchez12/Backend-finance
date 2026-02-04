import mongoose from 'mongoose';
import Asset from './models/Asset.js'; 
import dotenv from 'dotenv';

dotenv.config();

const assetsData = [
  // --- CRIPTOMONEDAS (24) ---
  { symbol: "BINANCE:BTCUSDT", openPrice: 95500.00, name: "Bitcoin", type: "crypto" },
  { symbol: "BINANCE:ETHUSDT", openPrice: 2650.00, name: "Ethereum", type: "crypto" },
  { symbol: "BINANCE:SOLUSDT", openPrice: 185.20, name: "Solana", type: "crypto" },
  { symbol: "BINANCE:BNBUSDT", openPrice: 615.40, name: "BNB", type: "crypto" },
  { symbol: "BINANCE:XRPUSDT", openPrice: 2.55, name: "XRP", type: "crypto" },
  { symbol: "BINANCE:ADAUSDT", openPrice: 0.95, name: "Cardano", type: "crypto" },
  { symbol: "BINANCE:LINKUSDT", openPrice: 22.10, name: "Chainlink", type: "crypto" },
  { symbol: "BINANCE:DOGEUSDT", openPrice: 0.38, name: "Dogecoin", type: "crypto" },
  { symbol: "BINANCE:AVAXUSDT", openPrice: 35.60, name: "Avalanche", type: "crypto" },
  { symbol: "BINANCE:DOTUSDT", openPrice: 8.20, name: "Polkadot", type: "crypto" },
  { symbol: "BINANCE:MATICUSDT", openPrice: 0.65, name: "Polygon", type: "crypto" },
  { symbol: "BINANCE:NEARUSDT", openPrice: 5.80, name: "Near Protocol", type: "crypto" },
  { symbol: "BINANCE:LTCUSDT", openPrice: 112.00, name: "Litecoin", type: "crypto" },
  { symbol: "BINANCE:UNIUSDT", openPrice: 12.40, name: "Uniswap", type: "crypto" },
  { symbol: "BINANCE:SHIBUSDT", openPrice: 0.000028, name: "Shiba Inu", type: "crypto" },
  { symbol: "BINANCE:BCHUSDT", openPrice: 480.00, name: "Bitcoin Cash", type: "crypto" },
  { symbol: "BINANCE:TIAUSDT", openPrice: 9.20, name: "Celestia", type: "crypto" },
  { symbol: "BINANCE:APTUSDT", openPrice: 11.50, name: "Aptos", type: "crypto" },
  { symbol: "BINANCE:INJUSDT", openPrice: 28.30, name: "Injective", type: "crypto" },
  { symbol: "BINANCE:OPUSDT", openPrice: 3.15, name: "Optimism", type: "crypto" },
  { symbol: "BINANCE:ARBUSDT", openPrice: 1.05, name: "Arbitrum", type: "crypto" },
  { symbol: "BINANCE:RNDRUSDT", openPrice: 8.90, name: "Render", type: "crypto" },
  { symbol: "BINANCE:XLMUSDT", openPrice: 0.42, name: "Stellar", type: "crypto" },
  { symbol: "BINANCE:ATOMUSDT", openPrice: 7.80, name: "Cosmos", type: "crypto" },

  // --- EMPRESAS / STOCKS (24) ---
  { symbol: "AAPL", openPrice: 232.50, name: "Apple Inc.", type: "stock" },
  { symbol: "NVDA", openPrice: 135.20, name: "NVIDIA", type: "stock" },
  { symbol: "MSFT", openPrice: 415.10, name: "Microsoft", type: "stock" },
  { symbol: "TSLA", openPrice: 320.00, name: "Tesla", type: "stock" },
  { symbol: "GOOGL", openPrice: 185.40, name: "Alphabet (Google)", type: "stock" },
  { symbol: "AMZN", openPrice: 198.30, name: "Amazon", type: "stock" },
  { symbol: "META", openPrice: 560.20, name: "Meta (Facebook)", type: "stock" },
  { symbol: "NFLX", openPrice: 810.00, name: "Netflix", type: "stock" },
  { symbol: "AMD", openPrice: 155.40, name: "AMD", type: "stock" },
  { symbol: "INTC", openPrice: 24.20, name: "Intel", type: "stock" },
  { symbol: "BABA", openPrice: 105.30, name: "Alibaba", type: "stock" },
  { symbol: "PYPL", openPrice: 82.50, name: "PayPal", type: "stock" },
  { symbol: "ADBE", openPrice: 520.00, name: "Adobe", type: "stock" },
  { symbol: "CRM", openPrice: 310.40, name: "Salesforce", type: "stock" },
  { symbol: "V", openPrice: 305.10, name: "Visa", type: "stock" },
  { symbol: "MA", openPrice: 510.30, name: "Mastercard", type: "stock" },
  { symbol: "DIS", openPrice: 112.50, name: "Disney", type: "stock" },
  { symbol: "NKE", openPrice: 78.40, name: "Nike", type: "stock" },
  { symbol: "JPM", openPrice: 235.00, name: "JPMorgan Chase", type: "stock" },
  { symbol: "GS", openPrice: 580.00, name: "Goldman Sachs", type: "stock" },
  { symbol: "WMT", openPrice: 85.20, name: "Walmart", type: "stock" },
  { symbol: "KO", openPrice: 62.40, name: "Coca-Cola", type: "stock" },
  { symbol: "PEP", openPrice: 165.30, name: "PepsiCo", type: "stock" },
  { symbol: "PFE", openPrice: 28.50, name: "Pfizer", type: "stock" }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🚀 Conectado a MongoDB Atlas...");
    
    // Limpiamos la colección para evitar duplicados
    await Asset.deleteMany({});
    console.log("🗑️ Colección antigua borrada.");

    // Insertamos los 48 nuevos con su categoría
    await Asset.insertMany(assetsData);
    
    console.log("✅ 48 Activos (Cryptos y Stocks) sembrados correctamente.");
    process.exit();
  } catch (err) {
    console.error("❌ Error en el proceso de seed:", err);
    process.exit(1);
  }
};

seedDB();