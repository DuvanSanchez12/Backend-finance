import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const PortfolioSchema = new Schema({
  // Relacionamos la compra con un usuario de nuestra colección 'User'
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // El símbolo de la acción (ej: AAPL, TSLA, AMZN)
  symbol: { 
    type: String, 
    required: true,
    uppercase: true, // Siempre se guarda en mayúsculas
    trim: true 
  },
  // Cantidad de acciones compradas
  quantity: { 
    type: Number, 
    required: true,
    min: [0, 'La cantidad no puede ser negativa']
  },
  // Precio al que se compró (importante para calcular ganancias/pérdidas luego)
  averagePrice: { 
    type: Number, 
    required: true 
  },
  // Fecha de la transacción
  date: { 
    type: Date, 
    default: Date.now 
  }
});

// Evitamos errores de re-declaración en desarrollo
const Portfolio = models.Portfolio || model('Portfolio', PortfolioSchema);

export default Portfolio;