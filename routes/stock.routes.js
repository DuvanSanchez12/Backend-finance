import express from 'express';
import { getStockQuote, getHistory } from '../controllers/stock.controller.js';
import { buyStock, getPortfolio } from '../controllers/portfolio.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/quote/:symbol', getStockQuote);
router.post('/buy', protect, buyStock);
router.get('/portfolio', protect, getPortfolio);
router.get('/history/:symbol', getHistory);

export default router;