import axios from 'axios';
import History from '../models/History.js';
export const getStockQuote = async (req, res) => {
  try {
    const { symbol } = req.params; // Ejemplo: AAPL
    const apiKey = process.env.FINNHUB_API_KEY;

    const response = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
    );

    // Finnhub responde con c: precio actual, d: cambio, dp: cambio porcentual
    res.status(200).json({
      symbol: symbol.toUpperCase(),
      currentPrice: response.data.c,
      change: response.data.d,
      percentChange: response.data.dp,
      high: response.data.h,
      low: response.data.l
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener datos de la bolsa", error: error.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    const { symbol } = req.params;
    // Buscamos los registros de las últimas 24h directamente
    const history = await History.find({ 
      symbol: symbol.toUpperCase() 
    })
    .sort({ timestamp: 1 }) // Orden cronológico para la gráfica
    .select('price timestamp -_id'); // Solo lo necesario para que pese menos

    if (!history.length) {
      return res.status(404).json({ message: "No hay datos para este símbolo" });
    }

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener historial", error: error.message });
  }
};