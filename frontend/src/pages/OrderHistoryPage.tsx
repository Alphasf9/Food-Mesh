/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MapPin, Package, Calendar } from "lucide-react";

interface OrderItem {
    name: string;
    price: number;
    quantity: number;
}

interface Order {
    _id: string;
    restaurantName: string;
    items: OrderItem[];
    totalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    deliveryAddress?: {
        formattedAddress: string;
    };
}

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrderHistory = async () => {
        try {
            const { data } = await axios.get(
                `${import.meta.env.VITE_ORDER_API_URL}/order-history`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            setOrders(data.orders || data);
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to load order history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderHistory();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }) + ", " + date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase();
        if (s === "delivered") return "bg-green-100 text-green-700";
        if (s === "cancelled") return "bg-red-100 text-red-700";
        if (s.includes("out")) return "bg-orange-100 text-orange-700";
        if (s === "preparing") return "bg-purple-100 text-purple-700";
        return "bg-blue-100 text-blue-700";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="max-w-5xl mx-auto px-6 pt-10">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Order History</h1>
                    <p className="text-gray-600">{orders.length} orders</p>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-20">
                        <Package className="mx-auto w-20 h-20 text-gray-300 mb-6" />
                        <h3 className="text-2xl font-semibold text-gray-700">No orders yet</h3>
                        <p className="text-gray-500 mt-3">When you place an order, it will show up here</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
                            >
                                {/* Header */}
                                <div className="p-6 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <h3 className="font-semibold text-xl text-gray-900">
                                            {order.restaurantName}
                                        </h3>
                                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                            <Calendar className="w-4 h-4" />
                                            {formatDate(order.createdAt)}
                                        </p>
                                    </div>

                                    <div className={`px-6 py-2 text-sm font-semibold rounded-full w-fit ${getStatusColor(order.status)}`}>
                                        {order.status.toUpperCase()}
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="p-6 space-y-3">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-gray-700">
                                            <span>
                                                {item.quantity} × {item.name}
                                            </span>
                                            <span className="font-medium">
                                                ₹{item.price * item.quantity}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="bg-gray-50 px-6 py-5 flex flex-col md:flex-row justify-between items-start md:items-center border-t">
                                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                                        <MapPin className="w-4 h-4" />
                                        <span className="line-clamp-1">
                                            {order.deliveryAddress?.formattedAddress || "N/A"}
                                        </span>
                                    </div>

                                    <div className="mt-4 md:mt-0 text-right">
                                        <p className="text-sm text-gray-500">Total Paid</p>
                                        <p className="text-2xl font-bold text-gray-900">₹{order.totalAmount}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistoryPage;