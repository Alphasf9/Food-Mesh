import type { IRestaurant } from "@/types";
import axios from "axios";
import { useEffect, useState } from "react";
import AddRestaurant from "./AddRestaurant";

const Restaurant = () => {
    const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
    const [loading, setLoading] = useState(true);


    const fetchMyRestaurant = async () => {
        try {
            const { data } = await axios.get(
                `${import.meta.env.VITE_RESTAURANT_API_URL}/my-restaurant`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );

            console.log(data.restaurant);

            setRestaurant(data.restaurant);

            if (data.token) {
                localStorage.setItem("accessToken", data.token);
            }
        } catch (error) {
            console.error("Failed to fetch restaurant", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyRestaurant();
    }, []);



    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!restaurant) {
        return <AddRestaurant />;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            {/* HERO CARD */}
            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">

                {/* IMAGE SECTION */}
                <div className="relative h-64 md:h-80 w-full">
                    <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                    />

                    {/* STATUS BADGE */}
                    <div className="absolute top-4 right-4">
                        <span
                            className={`px-4 py-1 rounded-full text-sm font-semibold ${restaurant.isOpen
                                    ? "bg-green-500 text-white"
                                    : "bg-red-500 text-white"
                                }`}
                        >
                            {restaurant.isOpen ? "Open Now" : "Closed"}
                        </span>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="p-6 md:p-8">

                    {/* TITLE */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {restaurant.name}
                        </h1>

                        <div className="flex gap-2">
                            <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                                {restaurant.isVerified ? "Verified" : "Not Verified"}
                            </span>
                        </div>
                    </div>

                    {/* DESCRIPTION */}
                    <p className="text-gray-600 mt-3 text-sm md:text-base">
                        {restaurant.description}
                    </p>

                    {/* INFO GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

                        {/* ADDRESS */}
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <h3 className="text-sm font-semibold text-gray-500">
                                Address
                            </h3>
                            <p className="text-gray-800 mt-1">
                                {restaurant.address}
                            </p>
                        </div>

                        {/* PHONE */}
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <h3 className="text-sm font-semibold text-gray-500">
                                Phone
                            </h3>
                            <p className="text-gray-800 mt-1">
                                {restaurant.phone}
                            </p>
                        </div>

                        {/* LOCATION COORDINATES */}
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <h3 className="text-sm font-semibold text-gray-500">
                                Coordinates
                            </h3>
                            <p className="text-gray-800 mt-1">
                                {restaurant.autoLocation.coordinates[0]} ,{" "}
                                {restaurant.autoLocation.coordinates[1]}
                            </p>
                        </div>

                        {/* CREATED DATE */}
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <h3 className="text-sm font-semibold text-gray-500">
                                Created At
                            </h3>
                            <p className="text-gray-800 mt-1">
                                {new Date(restaurant.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* FOOTER ACTIONS */}
                    <div className="mt-8 flex flex-col md:flex-row gap-3">
                        <button className="px-5 py-2 rounded-xl bg-black text-white hover:bg-gray-800 transition">
                            Edit Restaurant
                        </button>

                        <button className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition">
                            Manage Menu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Restaurant;