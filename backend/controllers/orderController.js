import orderModel from './../models/orderModel.js';
import userModel from './../models/userModel.js';
import Stripe from "stripe";
import { v4 as uuidv4 } from 'uuid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Temporary storage for orders until payment verification
const pendingOrders = {};

/**
 * Initiates the order process.
 * Instead of creating the order in DB immediately, store details in pendingOrders.
 * The unique orderToken is sent in the success/cancel URLs.
 */
const placeOrder = async (req, res) => {
    const frontend_url = 'https://food-del-7hph.onrender.com';
    try {
        // Generate a unique token for the pending order
        const orderToken = uuidv4();

        // Save order details temporarily
        pendingOrders[orderToken] = {
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address
        };

        // Prepare line items for Stripe checkout
        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: "inr",  // Currency is set to INR
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }));

        // Add delivery charges as a line item
        line_items.push({
            price_data: {
                currency: "inr",
                product_data: {
                    name: "Delivery Charges"
                },
                unit_amount: 20 * 100
            },
            quantity: 1
        });

        // Create the Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: 'payment',
            // Both success and cancel URL point to the same endpoint,
            // Differentiated only by the success query parameter.
            success_url: `${frontend_url}/varify?success=true&orderId=${orderToken}`,
            cancel_url: `${frontend_url}/varify?success=false&orderId=${orderToken}`
        });

        res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error" });
    }
};

/**
 * Verifies the payment and then either creates the order or discards it.
 * Expects a JSON body with { orderId, success }.
 */
const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        const pendingOrder = pendingOrders[orderId];
        if (!pendingOrder) {
            return res.json({ success: false, message: "Order not found" });
        }

        if (success === 'true') {
            // Payment succeeded: create order in the database
            const newOrder = new orderModel({
                userId: pendingOrder.userId,
                items: pendingOrder.items,
                amount: pendingOrder.amount,
                address: pendingOrder.address,
                payment: true
            });
            await newOrder.save();

            // Clear the pending order and update the user's cart
            delete pendingOrders[orderId];
            await userModel.findByIdAndUpdate(pendingOrder.userId, { cartData: {} });

            res.json({ success: true, message: "Payment verified and order placed", order: newOrder });
        } else {
            // Payment failed: discard the pending order
            delete pendingOrders[orderId];
            res.json({ success: false, message: "Payment failed, order not placed" });
        }
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error" });
    }
};

// Fetch orders for a user
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error" });
    }
};

// List all orders for admin panel
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error" });
    }
};

// API to update order status
const updateStatus = async (req, res) => {
    try {
        const updatedOrder = await orderModel.findByIdAndUpdate(
            req.body.orderId,
            { status: req.body.status },
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
