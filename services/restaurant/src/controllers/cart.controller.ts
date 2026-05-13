import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { TryCatch } from "../middlewares/trycatch.js";
import CartModel from "../models/Cart.model.js";




export const addToCart = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "Unauthorized: You cannot access cart" });
    }

    const userId = user._id;

    const { restaurantId, itemId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(restaurantId) || !mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({ message: "Invalid restaurantId or itemId" });
    }

    const cartFromDifferentRestaurant = await CartModel.findOne({ userId, restaurantId: { $ne: restaurantId } });

    if (cartFromDifferentRestaurant) {
        return res.status(400).json({ message: "You have items from a different restaurant in your cart. Please clear your cart before adding items from another restaurant." });
    }

    const cartItem = await CartModel.findOneAndUpdate({
        userId,
        restaurantId,
        itemId
    }, {
        $inc: { quantity: 1 },
        $setOnInsert: { userId, restaurantId, itemId }
    }, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
    })

    return res.status(200).json
        ({
            success: true,
            message: "Item added to cart",
            cartItem
        });
});


export const fetchMyCart = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "Unauthorized: You cannot access cart" });
    }

    const userId = user._id;

    const cartItems = await CartModel.find({ userId }).populate("restaurantId").populate("itemId");

    let subTotal = 0;
    let cartLength = 0;

    for (const cartItem of cartItems) {
        const item: any = cartItem.itemId;
        subTotal += item.price * cartItem.quantity;
        cartLength += cartItem.quantity;
    }

    return res.status(200).json({
        success: true,
        message: "Cart items fetched successfully",
        cart: cartItems,
        subTotal,
        cartLength
    });
})



export const incrementCartItem = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "Unauthorized: You cannot access cart" });
    }

    const userId = user._id;
    const { cartItemId } = req.body;



    const updatedCartItem = await CartModel.findOneAndUpdate({
        userId, cartItemId
    }, {
        $inc: { quantity: 1 }
    }, {
        new: true
    });


    if (!updatedCartItem) {
        return res.status(404).json({ message: "Cart item not found" });
    }

    return res.status(200).json({
        success: true,
        message: "Item quantity updated",
        cartItem: updatedCartItem
    });

})


export const decrementCartItem = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "Unauthorized: You cannot access cart" });
    }

    const userId = user._id;
    const { cartItemId } = req.body;

    const updatedCartItem = await CartModel.findOneAndUpdate({
        userId, cartItemId
    }, {
        $inc: { quantity: -1 }
    }, {
        new: true
    });

    if (!updatedCartItem) {
        return res.status(404).json({ message: "Cart item not found" });
    }

    if (updatedCartItem.quantity <= 0) {
        await CartModel.findByIdAndDelete(cartItemId);
        return res.status(200).json({
            success: true,
            message: "Item removed from cart"
        });
    }

    return res.status(200).json({
        success: true,
        message: "Item quantity updated",
        cartItem: updatedCartItem
    });
})



export const removeCartItem = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "Unauthorized: You cannot access cart" });
    }

    const userId = user._id;
    const { itemId } = req.params;

    const cartItem = await CartModel.findOne({ _id: itemId, userId });

    if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
    }

    await CartModel.findByIdAndDelete(itemId);

    return res.status(200).json({
        success: true,
        message: "Item removed from cart"
    });
})





export const clearCart = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "Unauthorized: You cannot access cart" });
    }

    const userId = user._id;

    await CartModel.deleteMany({ userId });
    return res.status(200).json({
        success: true,
        message: "Cart cleared successfully"
    });
})


