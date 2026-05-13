import express from 'express';
import { isAuth } from '../middlewares/auth.js';
import { addToCart, clearCart, decrementCartItem, fetchMyCart, incrementCartItem, removeCartItem } from '../controllers/cart.controller.js';

const router = express.Router();


router.post("/add-to-cart", isAuth, addToCart);

router.get("/my-cart", isAuth, fetchMyCart);

router.put("/increment-cart-item", isAuth, incrementCartItem);

router.put("/decrement-cart-item", isAuth, decrementCartItem);

router.delete("/remove-cart-item/:itemId", isAuth, removeCartItem); 

router.delete("/clear-cart", isAuth, clearCart);


export default router;