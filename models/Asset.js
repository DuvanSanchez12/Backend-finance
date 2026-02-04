import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  openPrice: { type: Number, required: true },
  name: { type: String },
  type: { type: String, enum: ['crypto', 'stock'], required: true }, // Esto es vital
  lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model('Asset', assetSchema);