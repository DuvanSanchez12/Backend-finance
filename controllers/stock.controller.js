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
    // Buscamos los registros del último año agrupados por día
    const history = await History.aggregate([
      { $match: { symbol: symbol.toUpperCase() } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          price: { $last: "$price" } // Tomamos el último precio registrado ese día
      }},
      { $sort: { "_id": 1 } }
    ]);
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener historial", error: error.message });
  }
};