import { Request, Response } from "express";
import { TryCatch } from "../middlewares/trycatch.js";
import axios from "axios";
import razorpay from "../config/razorpay.config.js";
import { publishPaymentSuccess } from "../config/payemtproducer.config.js";
import { verifyRazorpaySignature } from "../config/razorpyaverifypayment.config.js";

export const createRazorpayOrder = TryCatch(async (req: Request, res: Response) => {
    const { orderId } = req.body;

    const { data } = await axios.get(
        `${process.env.ORDER_API_URL}/fetch-order-for-payment/${orderId}`,
        { headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY } }
    );

    const razorpayOrder = await razorpay.orders.create({
        amount: data.amount * 100,
        currency: "INR",
        receipt: orderId
    });

    res.json({
        razorpayOrderId: razorpayOrder.id,
        key: process.env.RAZORPAY_KEY_ID
    });
});

export const verifyRazorPayment = TryCatch(async (req: Request, res: Response) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderId
    } = req.body;

    const isVerified = verifyRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    );

    if (!isVerified) {
        return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    console.log("Razorpay Payment ID:  ", razorpay_payment_id);

    await publishPaymentSuccess({
        orderId,
        paymentId: razorpay_payment_id,
        provider: "razorpay"
    });

    res.json({
        success: true,
        message: "Payment verified successfully"
    });
});