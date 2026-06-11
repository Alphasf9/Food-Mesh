/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, Download, Home, Loader } from "lucide-react";
import jsPDF from "jspdf";
import toast from "react-hot-toast";

const OrderSuccess = () => {
    const { paymentId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await axios.get(
                    `${import.meta.env.VITE_ORDER_API_URL}/order-by-payment/${paymentId}`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
                );
                setOrder(data.order);
            } catch (error) {
                toast.error("Failed to load order details");
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [paymentId]);

    const downloadReceipt = () => {
        if (!order) return;

        const doc = new jsPDF();


        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("FOOD MESH", 105, 20, { align: "center" });

        doc.setFontSize(13);
        doc.setFont("helvetica", "normal");
        doc.text("Order Receipt", 105, 30, { align: "center" });

        // Divider
        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);

        // Order Info
        doc.setFontSize(11);
        doc.text(`Order ID     : ${order._id}`, 20, 45);
        doc.text(`Payment ID   : ${paymentId}`, 20, 53);
        doc.text(`Date         : ${new Date(order.createdAt).toLocaleDateString("en-IN", {
            year: "numeric", month: "long", day: "numeric"
        })}`, 20, 61);
        doc.text(`Restaurant   : ${order.restaurantName}`, 20, 69);
        doc.text(`Payment      : ${order.paymentMethod?.toUpperCase()}`, 20, 77);
        doc.text(`Status       : ${order.paymentStatus?.toUpperCase()}`, 20, 85);

        // Divider
        doc.line(20, 90, 190, 90);

        // Items Header
        doc.setFont("helvetica", "bold");
        doc.text("Item", 20, 98);
        doc.text("Qty", 120, 98);
        doc.text("Price", 145, 98);
        doc.text("Total", 170, 98);
        doc.line(20, 102, 190, 102);

        // Items
        doc.setFont("helvetica", "normal");
        let yPos = 110;
        order.items.forEach((item: any) => {
            doc.text(item.name, 20, yPos);
            doc.text(`${item.quantity}`, 120, yPos);
            doc.text(`Rs.${item.price}`, 145, yPos);
            doc.text(`Rs.${item.price * item.quantity}`, 170, yPos);
            yPos += 10;
        });

        // Divider
        doc.line(20, yPos + 2, 190, yPos + 2);
        yPos += 10;

        // Price Summary
        doc.text(`Subtotal`, 130, yPos);
        doc.text(`Rs.${order.subtotal}`, 170, yPos);
        yPos += 8;

        doc.text(`Delivery Fee`, 130, yPos);
        doc.text(order.deliveryFee === 0 ? "FREE" : `Rs.${order.deliveryFee}`, 170, yPos);
        yPos += 8;

        doc.text(`Platform Fee`, 130, yPos);
        doc.text(`Rs.${order.platformFee}`, 170, yPos);
        yPos += 8;

        doc.line(130, yPos, 190, yPos);
        yPos += 6;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text(`Total`, 130, yPos);
        doc.text(`Rs.${order.totalAmount}`, 170, yPos);

        // Delivery Address
        yPos += 16;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("Delivery Address:", 20, yPos);
        doc.setFont("helvetica", "normal");
        yPos += 8;
        doc.text(order.deliveryAddress?.formattedAddress || "", 20, yPos);
        yPos += 8;
        doc.text(`Phone: ${order.deliveryAddress?.mobile || ""}`, 20, yPos);

        // Footer
        yPos += 20;
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("Thank you for ordering with Food Mesh!", 105, yPos, { align: "center" });

        doc.save(`FoodMesh-Receipt-${order._id}.pdf`);
        toast.success("Receipt downloaded!");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader className="w-10 h-10 animate-spin text-orange-500" />
            </div>
        );
    }
    

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Order not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="max-w-2xl mx-auto px-6 pt-12">

                {/* Success Header */}
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="w-20 h-20 text-green-500" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900">Payment Successful!</h1>
                    <p className="text-gray-500 mt-2">Your order has been placed successfully</p>
                </div>

                {/* Receipt Card */}
                <div className="bg-white rounded-3xl shadow-sm p-8">

                    {/* Order Info */}
                    <div className="space-y-3 mb-8">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Order ID</span>
                            <span className="font-medium text-xs">{order._id}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Payment ID</span>
                            <span className="font-medium text-xs">{paymentId}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Restaurant</span>
                            <span className="font-medium">{order.restaurantName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Date</span>
                            <span className="font-medium">
                                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                    year: "numeric", month: "long", day: "numeric"
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Payment Status</span>
                            <span className="text-green-600 font-semibold uppercase">{order.paymentStatus}</span>
                        </div>
                    </div>

                    <div className="border-t my-6" />

                    {/* Items */}
                    <h3 className="font-semibold mb-4">Items Ordered</h3>
                    <div className="space-y-3">
                        {order.items.map((item: any) => (
                            <div key={item._id} className="flex justify-between text-sm">
                                <span>{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                                <span className="font-medium">₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t my-6" />

                    {/* Price Summary */}
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Subtotal</span>
                            <span>₹{order.subtotal}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Delivery Fee</span>
                            <span className={order.deliveryFee === 0 ? "text-green-600" : ""}>
                                {order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Platform Fee</span>
                            <span>₹{order.platformFee}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t pt-4">
                            <span>Total Paid</span>
                            <span className="text-orange-600">₹{order.totalAmount}</span>
                        </div>
                    </div>

                    <div className="border-t my-6" />

                    {/* Delivery Address */}
                    <h3 className="font-semibold mb-3">Delivery Address</h3>
                    <p className="text-sm text-gray-600">{order.deliveryAddress?.formattedAddress}</p>
                    <p className="text-sm text-gray-500 mt-1">📞 {order.deliveryAddress?.mobile}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8">
                    <button
                        onClick={downloadReceipt}
                        className="flex-1 flex items-center justify-center gap-3 py-4 bg-linear-to-r from-orange-600 to-amber-600 text-white rounded-2xl font-semibold hover:shadow-xl transition active:scale-95"
                    >
                        <Download className="w-5 h-5" />
                        Download Receipt
                    </button>

                    <button
                        onClick={() => navigate("/")}
                        className="flex-1 flex items-center justify-center gap-3 py-4 border border-gray-300 rounded-2xl font-semibold hover:bg-gray-50 transition active:scale-95"
                    >
                        <Home className="w-5 h-5" />
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;