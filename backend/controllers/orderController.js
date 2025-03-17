import orderModel from './../models/orderModel.js';
import userModel from './../models/userModel.js';
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const FRONTEND_URL = 'https://food-del-7hph.onrender.com/';

const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;

        // Create new order
        const newOrder = new orderModel({ userId, items, amount, address });
        await newOrder.save();

        // Clear user's cart after placing order
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        // Prepare line items for Stripe Checkout
        const line_items = items.map((item) => ({
            price_data: {
                currency: "inr",
                product_data: { name: item.name },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }));

        // Add delivery charges
        line_items.push({
            price_data: {
                currency: "inr",
                product_data: { name: "Delivery Charges" },
                unit_amount: 20 * 100
            },
            quantity: 1
        });

        // Create Stripe session
        const session = await stripe.checkout.sessions.create({
            line_items,
            mode: 'payment',
            success_url: `${FRONTEND_URL}`,
            cancel_url: `${FRONTEND_URL}`
        });

        res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.error("Error in placeOrder:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const verifyOrder = async (req, res) => {
    try {
        const { orderId, success } = req.body;

        if (!orderId) {
            return res.status(400).json({ success: false, message: "Order ID is required" });
        }

        if (success === 'true') {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            return res.json({ success: true, message: "Payment Successful" });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            return res.json({ success: false, message: "Payment Failed, Order Deleted" });
        }
    } catch (error) {
        console.error("Error in verifyOrder:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const userOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }
        const orders = await orderModel.find({ userId });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error("Error in userOrders:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error("Error in listOrders:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        if (!orderId || !status) {
            return res.status(400).json({ success: false, message: "Order ID and Status are required" });
        }

        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.status(200).json({ success: true, message: "Status Updated", order: updatedOrder });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
