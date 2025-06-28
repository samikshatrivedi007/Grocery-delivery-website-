import { Request, Response } from "express";
import Cart from "../models/cart.model";
import Product from "../models/product.model";

export const getCart = async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    res.json(cart || { user: userId, items: [] });
};

export const addToCart = async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ user: userId });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (!cart) {
        cart = await Cart.create({
            user: userId,
            items: [{ product: productId, quantity }],
        });
    } else {
        const index = cart.items.findIndex((item) => item.product.toString() === productId);
        if (index > -1) {
            cart.items[index].quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }
        await cart.save();
    }

    res.status(200).json(cart);
};

export const updateCartItem = async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const index = cart.items.findIndex((item) => item.product.toString() === productId);
    if (index > -1) {
        cart.items[index].quantity = quantity;
        await cart.save();
        return res.json(cart);
    }

    res.status(404).json({ message: "Product not in cart" });
};

export const removeCartItem = async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    await cart.save();

    res.json(cart);
};

export const clearCart = async (req: Request, res: Response) => {
    const userId = req.user?._id;
    await Cart.findOneAndDelete({ user: userId });
    res.json({ message: "Cart cleared" });
};
