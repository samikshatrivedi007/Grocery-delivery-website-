import express from 'express';
import {
    placeOrder,
    getAllOrders,
    getOrderById,
    cancelOrder,
} from '../controllers/orderController';
import {authMiddleware} from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, placeOrder);
router.get('/', authMiddleware, getAllOrders);
router.get('/:id', authMiddleware, getOrderById);
router.put('/:id/cancel', authMiddleware, cancelOrder);

export default router;
