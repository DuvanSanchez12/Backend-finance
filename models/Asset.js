import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  openPrice: { type: Number, required: true }, // Precio al inicio del día
  lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model('Asset', assetSchema);