/* eslint-disable @typescript-eslint/no-unused-vars */
import { useAppData } from "@/context/AppContext";
import type { IRestaurant } from "@/types";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Plus, Minus, Trash2, ArrowRight } from "lucide-react";

const Cart = () => {
    const { cart, subTotal, fetchCart } = useAppData();
    const navigate = useNavigate();

    const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
    const [clearingCart, setClearingCart] = useState(false);

    if (!cart || cart.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="text-6xl mb-6">🛒</div>
                <h2 className="text-3xl font-semibold text-gray-800 mb-3">Your cart is empty</h2>
                <p className="text-gray-500 mb-8">Looks like you haven't added anything yet</p>
                <button
                    onClick={() => navigate("/")}
                    className="px-8 py-3 bg-orange-600 text-white rounded-2xl font-semibold hover:bg-orange-700 transition"
                >
                    Browse Restaurants
                </button>
            </div>
        );
    }

    const restaurant = cart[0]?.restaurantId as IRestaurant;
    const deliveryFee = subTotal < 250 ? 49 : 0;
    const platformFee = Math.round(subTotal * 0.07);
    const grandTotal = subTotal + deliveryFee + platformFee;

    const increaseQuantity = async (itemId: string) => {
        setLoadingItemId(itemId);
        try {
            await axios.put(`${import.meta.env.VITE_CART_API_URL}/increment-cart-item`, { itemId }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
            });
            await fetchCart();
        } catch (error) {
            toast.error("Failed to increase quantity");
        } finally {
            setLoadingItemId(null);
        }
    };

    const decreaseQuantity = async (itemId: string) => {
        setLoadingItemId(itemId);
        try {
            await axios.put(`${import.meta.env.VITE_CART_API_URL}/decrement-cart-item`, { itemId }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
            });
            await fetchCart();
        } catch (error) {
            toast.error("Failed to decrease quantity");
        } finally {
            setLoadingItemId(null);
        }
    };

    const removeItem = async (itemId: string) => {
        if (!window.confirm("Remove this item from cart?")) return;
        setLoadingItemId(itemId);
        try {
            await axios.delete(`${import.meta.env.VITE_CART_API_URL}/remove-cart-item/${itemId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
            });
            await fetchCart();
            toast.success("Item removed");
        } catch (error) {
            toast.error("Failed to remove item");
        } finally {
            setLoadingItemId(null);
        }
    };

    const clearCart = async () => {
        if (!window.confirm("Clear entire cart?")) return;
        setClearingCart(true);
        try {
            await axios.delete(`${import.meta.env.VITE_CART_API_URL}/clear-cart`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
            });
            await fetchCart();
            toast.success("Cart cleared");
        } catch (error) {
            toast.error("Failed to clear cart");
        } finally {
            setClearingCart(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="max-w-5xl mx-auto px-6 pt-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Cart</h1>
                <p className="text-gray-600">Review your items before checkout</p>

                {/* Restaurant Header */}
                <div className="bg-white rounded-3xl p-6 mt-8 shadow-sm flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden">
                        <img src={restaurant?.image} alt={restaurant?.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold">{restaurant?.name}</h2>
                        <p className="text-gray-500 text-sm">{restaurant?.address.split('\n')[0]}</p>
                    </div>
                </div>

                {/* Cart Items */}
                <div className="mt-8 space-y-6">
                    {cart.map((cartItem) => {
                        if (typeof cartItem.itemId === "string") return null;

                        const item = cartItem.itemId;
                        const isLoading = loadingItemId === item._id;

                        return (
                                <div key={item._id} className="bg-white rounded-3xl p-6 shadow-sm flex gap-6">

                                {/* Details */}
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{item.description}</p>

                                    <div className="mt-4 flex items-center justify-between">
                                        <p className="text-2xl font-bold text-orange-600">₹{item.price}</p>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-3 bg-gray-100 rounded-2xl p-1">
                                            <button
                                                onClick={() => decreaseQuantity(item._id)}
                                                disabled={isLoading}
                                                className="w-9 h-9 flex items-center justify-center hover:bg-white rounded-xl transition"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="font-semibold w-8 text-center">{cartItem.quantity}</span>
                                            <button
                                                onClick={() => increaseQuantity(item._id)}
                                                disabled={isLoading}
                                                className="w-9 h-9 flex items-center justify-center hover:bg-white rounded-xl transition"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Remove Button */}
                                <button
                                    onClick={() => removeItem(item._id)}
                                    disabled={isLoading}
                                    className="text-red-500 hover:text-red-600 self-start mt-1 transition"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Price Summary */}
                <div className="mt-10 bg-white rounded-3xl p-8 shadow-sm">
                    <h3 className="font-semibold text-lg mb-5">Price Details</h3>

                    <div className="space-y-4 text-gray-700">
                        <div className="flex justify-between">
                            <span>Subtotal ({cart.length} items)</span>
                            <span>₹{subTotal}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Delivery Fee</span>
                            <span className="text-green-600">{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Platform Fee</span>
                            <span>₹{platformFee}</span>
                        </div>
                    </div>

                    <div className="border-t my-6"></div>

                    <div className="flex justify-between text-xl font-bold">
                        <span>Total</span>
                        <span>₹{grandTotal}</span>
                    </div>

                    <button
                        onClick={() => navigate("/checkout")}
                        className="mt-8 w-full bg-linear-to-r from-orange-600 to-amber-600 text-white py-5 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 hover:shadow-xl transition-all active:scale-[0.985]"
                    >
                        Proceed to Checkout
                        <ArrowRight className="w-5 h-5" />
                    </button>

                    <button
                        onClick={clearCart}
                        disabled={clearingCart}
                        className="mt-4 w-full text-red-600 hover:text-red-700 py-3 font-medium transition"
                    >
                        {clearingCart ? "Clearing..." : "Clear Cart"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;