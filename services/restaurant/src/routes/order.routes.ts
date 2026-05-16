import express from 'express';
import { isAuth } from '../middlewares/auth.js';
import { createOrder, fetchOrderForPayment } from '../controllers/order.controller.js';
const router = express.Router();

router.post("/create-order", isAuth, createOrder);

router.get("/order-payment/:id", fetchOrderForPayment);


export default router;