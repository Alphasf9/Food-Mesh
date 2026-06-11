import express from 'express';
import { isAuth } from '../middlewares/auth.js';
import { createOrder, fetchOrderByPaymentId, fetchOrderForPayment } from '../controllers/order.controller.js';

const router = express.Router();

router.post("/create-order", isAuth, createOrder);

router.get("/fetch-order-for-payment/:id", fetchOrderForPayment);

router.get("/order-by-payment/:paymentId", isAuth, fetchOrderByPaymentId);

export default router;