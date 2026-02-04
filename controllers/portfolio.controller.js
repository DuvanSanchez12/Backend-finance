import Portfolio from '../models/Portfolio.js';

export const buyStock = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "El cuerpo de la petición está vacío" });
    }
    const { symbol, quantity, averagePrice } = req.body;
    const userId = req.user.id; // Obtenido automáticamente por el middleware 'protect'

    const newPurchase = await Portfolio.create({
      userId,
      symbol: symbol.toUpperCase(),
      quantity,
      averagePrice
    });

    res.status(201).json({ message: "Compra guardada en el portafolio", data: newPurchase });
  } catch (error) {
    res.status(500).json({ message: "Error al guardar la compra", error: error.message });
  }
};
export const getPortfolio = async (req, res) => {
  try {
    const userId = req.user.id; // Obtenemos el ID del token

    // Buscamos todas las acciones que pertenezcan a este usuario
    const portfolio = await Portfolio.find({ userId });

    res.status(200).json(portfolio);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el portafolio", error: error.message });
  }
};