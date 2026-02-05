import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  symbol: { type: String, required: true, index: true },
  price: { type: Number, required: true },
  timestamp: { type: Date, required: true, default: Date.now }
});

// MAGIA: Esto crea un índice que borra el documento automáticamente 
// después de 86400 segundos (24 horas)
historySchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.model('History', historySchema);