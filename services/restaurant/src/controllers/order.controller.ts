import { AuthenticatedRequest } from "../middlewares/auth.js";
import { TryCatch } from "../middlewares/trycatch.js";
import AddressModel from "../models/Address.model.js";
import CartModel from "../models/Cart.model.js";
import { IMenu } from "../models/Menu.model.js";
import OrderModel from "../models/Order.model.js";
import Restaurant, { IRestaurant } from "../models/Restaurant.js";



export const createOrder = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { addressId, paymentMethod, distance } = req.body;

    if (!addressId || !paymentMethod) {
        return res.status(400).json({ message: "Address and payment method are required" });
    }

    const address = await AddressModel.findOne({ _id: addressId, userId: user._id });

    if (!address) {
        return res.status(404).json({ message: "Address not found" });
    }

    const cartItems = await CartModel.find({ userId: user._id })
        .populate<{ itemId: IMenu }>("itemId")
        .populate<{ restaurantId: IRestaurant }>("restaurantId");

    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
    }

    const firstCartItem = cartItems[0];

    if (!firstCartItem || !firstCartItem.restaurantId) {
        return res.status(400).json({ message: "Invalid restaurant in cart" });
    }

    const restaurantId = firstCartItem.restaurantId._id.toString();
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
    }

    if (!restaurant.isOpen) {
        return res.status(400).json({ message: "Restaurant is currently closed" });
    }

    let subtotal = 0;

    const orderItem = cartItems.map((cartItem) => {
        const item = cartItem.itemId;
        if (!item) {
            throw new Error("Invalid item in cart");
        }
        const itemTotal = item.price * cartItem.quantity;
        subtotal += itemTotal;
        return {
            itemId: item._id.toString(),
            name: item.name,
            price: item.price,
            quantity: cartItem.quantity
        }
    });

    const deliveryFee = subtotal < 250 ? 50 : 0;
    const platformFee = 10;
    const totalAmount = subtotal + deliveryFee + platformFee;
    const riderAmount = Math.ceil(distance) * 17;

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const [longitude, latitude] = address.location.coordinates;



    const order = await OrderModel.create({
        userId: user._id.toString(),
        restaurantId: restaurant._id.toString(),
        restaurantName: restaurant.name,
        riderPhone: restaurant.phone,
        items: orderItem,
        subtotal,
        deliveryFee,
        platformFee,
        totalAmount,
        riderAmount,

        addressId: address._id.toString(),
        deliveryAddress: {
            formattedAddress: address.formattedAddress,
            mobile: address.mobile,
            latitude,
            longitude
        },
        paymentMethod,
        paymentStatus: "pending",
        status: "placed",
        expiredAt: expiresAt
    })

    if (!order) {
        return res.status(400).json({ message: "Failed to make an order" });
    }

    await CartModel.deleteMany({ userId: user._id });

    return res.status(201).json({
        message: "Order placed successfully",
        orderId: order._id,
        amount: totalAmount,
    });
});



export const fetchOrderForPayment = TryCatch(async (req, res) => {
    if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    const order = await OrderModel.findById(req.params.id);

    if (!order) {
        return res.status(404).json({ message: "Order not found" })
    }

    if (order.paymentStatus !== "pending") {
        return res.status(400).json({ message: "Payment already processed for this order" })
    }

    return res.status(200).json({
        orderId: order._id,
        amount: order.totalAmount,
        currency: "INR",
    })
})