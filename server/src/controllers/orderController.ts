import { Request, Response } from 'express';
import Order from '../models/order.model';
import Product from '../models/product.model';
import Cart from '../models/cart.model';

export const placeOrder = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { address } = req.body;

    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
    }

    const orderItems = cart.items.map(item => {
        const product = item.product as any;

        return {
            product: product._id,
            name: product.name,
            price: product.price,
            quantity: item.quantity,
            image: product.image,
        };
    });

    const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newOrder = await Order.create({
        userId,
        items: orderItems,
        totalAmount,
        address,
    });

    await Cart.findOneAndDelete({ userId });

    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
};

export const getAllOrders = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const orders = await Order.find({ userId }).sort({ orderedAt: -1 });
    res.status(200).json(orders);
};

export const getOrderById = async (req: Request, res: Response) => {
    const orderId = req.params.id;
    const userId = req.user?.id;

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.status(200).json(order);
};

export const cancelOrder = async (req: Request, res: Response) => {
    const orderId = req.params.id;
    const userId = req.user?.id;

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status !== 'Pending') {
        return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    order.status = 'Cancelled';
    await order.save();

    res.status(200).json({ message: 'Order cancelled', order });
};
