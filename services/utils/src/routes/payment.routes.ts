import express from 'express';
import { createRazorpayOrder, verifyRazorPayment } from '../controllers/payement.controller.js';

const router = express.Router();


router.post("/create-razorpay-order", createRazorpayOrder);

router.post("/verify-payment", verifyRazorPayment);

export default router;