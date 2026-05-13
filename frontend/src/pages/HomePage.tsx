import { useAppData } from "@/context/AppContext";
import type { IRestaurant } from "@/types";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { MapPin, Clock, Award } from "lucide-react";

const HomePage = () => {
    const { city, location } = useAppData();
    const [searchParams, setSearchParams] = useSearchParams();

    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
    const [loading, setLoading] = useState(true);

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const params = new URLSearchParams(searchParams);
        if (searchQuery.trim()) {
            params.set("search", searchQuery.trim());
        } else {
            params.delete("search");
        }
        setSearchParams(params);
    };

    const fetchRestaurants = useCallback(async () => {
        if (!location?.latitude || !location?.longitude) return;

        try {
            setLoading(true);
            const { data } = await axios.get(
                `${import.meta.env.VITE_RESTAURANT_API_URL}/nearby-restaurants`,
                {
                    params: {
                        latitude: location.latitude,
                        longitude: location.longitude,
                        search: searchQuery,
                    },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            setRestaurants(data.restaurants || []);
        } catch (error) {
            console.error("Error fetching nearby restaurants:", error);
        } finally {
            setLoading(false);
        }
    }, [location, searchQuery]);

    useEffect(() => {
        fetchRestaurants();
    }, [fetchRestaurants]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-linear-to-br from-orange-600 via-red-500 to-pink-600 pt-20 pb-24">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tighter mb-4">
                        Delicious food, <span className="text-white">delivered fast</span>
                    </h1>
                    <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
                        Order from the best restaurants near you
                    </p>

                    <form onSubmit={handleSearch} className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-2 flex flex-col md:flex-row gap-3">
                        <div className="flex-1 relative">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">🔍</div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search restaurants, dishes, or cuisine..."
                                className="w-full bg-transparent border-0 pl-14 py-4 text-lg focus:outline-none placeholder:text-gray-400 rounded-2xl"
                            />
                        </div>

                        <div className="hidden md:block w-px bg-gray-200 my-2"></div>

                        <div className="md:w-64 relative">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">📍</div>
                            <input
                                type="text"
                                value={city || ""}
                                placeholder="City"
                                className="w-full bg-transparent border-0 pl-14 py-4 text-lg focus:outline-none placeholder:text-gray-400 rounded-2xl"
                                readOnly
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg-black hover:bg-gray-900 text-white px-10 py-4 rounded-2xl font-semibold transition-all active:scale-95 md:w-auto w-full"
                        >
                            Search
                        </button>
                    </form>
                </div>
            </div>

            {/* Nearby Restaurants */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">
                        {searchQuery ? `Results for "${searchQuery}"` : "Restaurants Near You"}
                    </h2>
                    <p className="text-gray-600">
                        {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} found
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-3xl h-96 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {restaurants.map((restaurant) => (
                            <div
                                key={restaurant._id}
                                className={`group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200 cursor-pointer ${!restaurant.isOpen ? 'opacity-75' : ''}`}
                            >
                                <div className="relative h-56">
                                    <Link to={`/restaurant/${restaurant._id}`} className="absolute inset-0 z-10" />
                                    <img    
                                        src={restaurant.image}
                                        alt={restaurant.name}
                                        
                                        className={`w-full h-full object-cover transition-transform duration-500 ${!restaurant.isOpen ? 'grayscale' : 'group-hover:scale-105'}`}
                                    />

                                    {/* Status Badge */}
                                    <div className="absolute top-4 left-4">
                                        <span className={`px-4 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 backdrop-blur-md ${restaurant.isOpen ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                                            <div className={`w-2 h-2 rounded-full ${restaurant.isOpen ? "bg-white animate-pulse" : "bg-white"}`} />
                                            {restaurant.isOpen ? "OPEN NOW" : "CLOSED"}
                                        </span>
                                    </div>

                                    {/* Verified Badge */}
                                    {restaurant.isVerified && (
                                        <div className="absolute top-4 right-4 bg-white text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow">
                                            <Award className="w-3.5 h-3.5" />
                                            VERIFIED
                                        </div>
                                    )}

                                    {/* Distance */}
                                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-xs font-medium px-3 py-1 rounded-full">
                                        {restaurant.distanceKm ? `${restaurant.distanceKm.toFixed(1)} km` : "Nearby"}
                                    </div>

                                    {/* Closed Overlay */}
                                    {!restaurant.isOpen && (
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                            <div className="bg-white/90 px-6 py-2 rounded-full text-red-600 font-semibold text-sm tracking-wider">
                                                CLOSED
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                                        {restaurant.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                        {restaurant.description}
                                    </p>

                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            <span className="line-clamp-1">{restaurant.address.split(',')[0]}</span>
                                        </div>
                                        {restaurant.isOpen && (
                                            <div className="flex items-center gap-1 text-emerald-600">
                                                <Clock className="w-4 h-4" />
                                                <span>Open</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && restaurants.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-2xl text-gray-400">No restaurants found</p>
                        <p className="text-gray-500 mt-2">Try changing your search or location</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;