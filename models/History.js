import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  symbol: { type: String, required: true, index: true },
  price: { type: Number, required: true },
  timestamp: { type: Date, required: true }
}, { 
  // Si usas MongoDB 5.0+, habilita esto para máxima velocidad
  timeseries: {
    timeField: 'timestamp',
    metaField: 'symbol',
    granularity: 'minutes'
  }
});

export default mongoose.model('History', historySchema);