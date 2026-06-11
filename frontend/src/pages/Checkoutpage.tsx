/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppData } from "@/context/AppContext";
import type { IRestaurant } from "@/types";
import axios from "axios";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Shield, Loader
} from "lucide-react";


const CheckoutPage = () => {
  const { cart, subTotal, location } = useAppData();
  const navigate = useNavigate();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const restaurant = cart[0]?.restaurantId as IRestaurant | undefined;

  // Calculate Fees
  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platformFee = Math.round(subTotal * 0.07);
  const gst = Math.round(subTotal * 0.05); // 5% GST
  const grandTotal = subTotal + deliveryFee + platformFee + gst;

  // Fetch Addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_ADDRESS_API_URL}/get-addresses`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          }
        );
        setAddresses(data.addresses || data || []);
      } catch (error) {
        toast.error("Failed to load addresses");
        console.log(error);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, []);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    let distance = 0;
    const restaurantCoords = (cart[0]?.restaurantId as IRestaurant)?.autoLocation?.coordinates;

    if (location && restaurantCoords) {
      const [restLng, restLat] = restaurantCoords;

      const R = 6371;
      const dLat = (restLat - location.latitude) * Math.PI / 180;
      const dLon = (restLng - location.longitude) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(location.latitude * Math.PI / 180) *
        Math.cos(restLat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    console.log("here is my distance", distance);

    setLoadingPayment(true);

    try {
      // Create Order
      const { data: orderData } = await axios.post(
        `${import.meta.env.VITE_ORDER_API_URL}/create-order`,
        { addressId: selectedAddressId, paymentMethod: "razorpay", distance },
        { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
      );

      const { orderId, amount } = orderData;

      // Create Razorpay Order
      const { data: razorpayData } = await axios.post(
        `${import.meta.env.VITE_PAYMENT_API_URL}/create-razorpay-order`,
        { orderId }
      );

      const options = {
        key: razorpayData.key,
        amount: amount * 100,
        currency: "INR",
        name: "FOOD MESH",
        description: `Order from ${restaurant?.name || "restaurant"}`,
        order_id: razorpayData.razorpayOrderId,
        handler: async function (response: any) {
          try {
            await axios.post(
              `${import.meta.env.VITE_PAYMENT_API_URL}/verify-payment`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderId,
              }
            );

            toast.success("🎉 Payment Successful! Order Placed");
            navigate(`/order-success/${response.razorpay_payment_id}`);
          } catch (error) {
            toast.error("Payment verification failed");
            console.log(error)
          }
        },
        theme: { color: "#f97316" },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to initiate payment");
    } finally {
      setLoadingPayment(false);
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-3xl font-semibold">Your cart is empty</h2>
          <button onClick={() => navigate("/")} className="mt-6 px-8 py-3 bg-orange-600 text-white rounded-2xl">
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-6xl mx-auto px-6 pt-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-4xl font-bold">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Section */}
          <div className="lg:col-span-7 space-y-8">
            {/* Restaurant Info */}
            <div className="bg-white rounded-3xl p-6 shadow-sm flex gap-5">
              <img
                src={restaurant?.image}
                alt={restaurant?.name}
                className="w-24 h-24 rounded-2xl object-cover"
              />
              <div>
                <h2 className="text-2xl font-semibold">{restaurant?.name}</h2>
                <p className="text-gray-500 mt-1">{restaurant?.address?.split('\n')[0]}</p>
              </div>
            </div>

            {/* Delivery Addresses */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-5 flex items-center gap-2">
                <MapPin className="w-5 h-5" /> Select Delivery Address
              </h3>

              {loadingAddresses ? (
                <p>Loading addresses...</p>
              ) : addresses.length === 0 ? (
                <p className="text-gray-500">No addresses found. Please add one from profile.</p>
              ) : (
                <div className="space-y-4">
                  {addresses.map((addr: any) => (
                    <label
                      key={addr._id}
                      className={`flex gap-4 p-5 border rounded-2xl cursor-pointer transition-all ${selectedAddressId === addr._id
                        ? "border-orange-500 bg-orange-50"
                        : "hover:border-gray-300"
                        }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === addr._id}
                        onChange={() => setSelectedAddressId(addr._id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{addr.formattedAddress}</p>
                        <p className="text-sm text-gray-500 mt-1">📞 {addr.mobile}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl shadow-sm p-8 sticky top-6">
              <h3 className="text-xl font-semibold mb-6">Order Summary</h3>

              <div className="space-y-5 max-h-85 overflow-y-auto pr-2 mb-8">
                {cart.map((cartItem: any) => {
                  const item = cartItem.itemId;
                  return (
                    <div key={cartItem._id} className="flex justify-between">
                      <div>
                        <span className="font-medium">{cartItem.quantity}x</span>{" "}
                        <span>{item.name}</span>
                      </div>
                      <span className="font-semibold">₹{item.price * cartItem.quantity}</span>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-4 border-t pt-6 text-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className={deliveryFee === 0 ? "text-green-600" : ""}>
                    {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span>₹{platformFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>₹{gst}</span>
                </div>

                <div className="flex justify-between text-xl font-bold border-t pt-4 text-gray-900">
                  <span>Grand Total</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={loadingPayment || !selectedAddressId}
                className="mt-10 w-full bg-linear-to-r from-orange-600 to-amber-600 text-white py-5 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 hover:shadow-xl transition disabled:opacity-70"
              >
                {loadingPayment ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ₹${grandTotal} & Place Order`
                )}
              </button>

              <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1">
                <Shield className="w-4 h-4" /> Secure Payment • Powered by Razorpay
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;