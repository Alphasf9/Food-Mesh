import type { IRestaurant } from "@/types";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Clock, Star, Award } from "lucide-react";
import toast from "react-hot-toast";
import MenuItems from "@/components/MenuItems";
import type { IMenu } from "@/types";

const RestaurantPage = () => {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
    const [menuItems, setMenuItems] = useState<IMenu[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchRestaurant = useCallback(async () => {
        try {
            const { data } = await axios.get(
                `${import.meta.env.VITE_RESTAURANT_API_URL}/search-restaurant/${id}`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
                }
            );
            setRestaurant(data.restaurant);
        } catch (error) {
            console.error("Failed to fetch restaurant", error);
            toast.error("Failed to load restaurant");
        }
    }, [id]);

    const fetchMenuItems = useCallback(async () => {
        try {
            const { data } = await axios.get(
                `${import.meta.env.VITE_MENU_API_URL}/get-all-menu-items/${id}`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
                }
            );
            setMenuItems(data.items || []);
        } catch (error) {
            console.error("Failed to fetch menu items", error);
        }
    }, [id]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchRestaurant(), fetchMenuItems()]);
            setLoading(false);
        };
        loadData();
    }, [fetchRestaurant, fetchMenuItems]);

    if (loading || !restaurant) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Hero Banner */}
            <div className="relative h-105 md:h-120">
                <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/50 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center gap-3 mb-3">
                            {restaurant.isVerified && (
                                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-sm">
                                    <Award className="w-4 h-4" /> Verified
                                </div>
                            )}
                            <div className={`px-5 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 ${restaurant.isOpen ? "bg-green-500" : "bg-red-500"}`}>
                                <div className={`w-2 h-2 rounded-full ${restaurant.isOpen ? "animate-pulse bg-white" : "bg-white"}`} />
                                {restaurant.isOpen ? "OPEN NOW" : "CLOSED"}
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-2">
                            {restaurant.name}
                        </h1>
                        <p className="text-lg text-orange-100 max-w-2xl">
                            {restaurant.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Restaurant Info Bar */}
            <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-10">
                <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4">
                        <MapPin className="w-8 h-8 text-orange-500" />
                        <div>
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="font-medium text-gray-800 leading-tight">
                                {restaurant.address.split('\n')[0]}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Clock className="w-8 h-8 text-orange-500" />
                        <div>
                            <p className="text-sm text-gray-500">Delivery Time</p>
                            <p className="font-medium text-gray-800">25-35 mins</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Star className="w-8 h-8 text-orange-500" />
                        <div>
                            <p className="text-sm text-gray-500">Rating</p>
                            <p className="font-medium text-gray-800">4.6 • 1.2k ratings</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Section — using MenuItems component */}
            <div className="max-w-6xl mx-auto px-6 pt-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Menu</h2>
                <MenuItems
                    items={menuItems}
                    onItemDeleted={fetchMenuItems}
                    isSeller={false}
                    restaurantId={id}
                />
            </div>
        </div>
    );
};

export default RestaurantPage;