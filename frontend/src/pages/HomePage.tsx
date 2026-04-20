import { useAppData } from "@/context/AppContext";

const HomePage = () => {
    const { city, postcode } = useAppData();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            {/* <Navbar /> */}

            {/* Hero Section with Triple Search */}
            <div className="bg-linear-to-br from-orange-500 via-red-500 to-pink-500 pt-16 pb-20">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tighter mb-4">
                        Welcome to <span className="text-white">FOOD MESH</span>
                    </h1>
                    <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
                        Order delicious food from your favorite restaurants with lightning-fast delivery
                    </p>

                    {/* Triple Search Container */}
                    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-2 flex flex-col md:flex-row gap-3">

                        {/* Main Search Bar */}
                        <div className="flex-1 relative">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                                🔍
                            </div>
                            <input
                                type="text"
                                placeholder="Search restaurants, dishes, or cuisine..."
                                className="w-full bg-transparent border-0 pl-14 py-4 text-lg focus:outline-none placeholder:text-gray-400 rounded-2xl"
                            />
                        </div>

                        {/* Divider */}
                        <div className="hidden md:block w-px bg-gray-200 my-2"></div>

                        {/* City Input */}
                        <div className="md:w-64 relative">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                                📍
                            </div>
                            <input
                                type="text"
                                value={city || ""}
                                placeholder="City"
                                className="w-full bg-transparent border-0 pl-14 py-4 text-lg focus:outline-none placeholder:text-gray-400 rounded-2xl"
                            />
                        </div>

                        {/* Postcode Input */}
                        <div className="md:w-52 relative">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                                📮
                            </div>
                            <input
                                type="text"
                                value={postcode || ""}
                                placeholder="Postcode"
                                className="w-full bg-transparent border-0 pl-14 py-4 text-lg focus:outline-none placeholder:text-gray-400 rounded-2xl"
                            />
                        </div>

                        {/* Search Button */}
                        <button className="bg-black hover:bg-gray-900 text-white px-10 py-4 rounded-2xl font-semibold transition-all active:scale-95 md:w-auto w-full">
                            Search
                        </button>
                    </div>

                    <p className="text-white/70 text-sm mt-4">
                        Currently delivering in 50+ cities • Fast & Reliable
                    </p>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
                        <div className="text-5xl mb-4">🍔</div>
                        <h3 className="text-xl font-semibold mb-2">Browse Restaurants</h3>
                        <p className="text-gray-600">Discover top-rated places near you</p>
                    </div>
                    <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
                        <div className="text-5xl mb-4">🚀</div>
                        <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                        <p className="text-gray-600">Get your food delivered in minutes</p>
                    </div>
                    <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
                        <div className="text-5xl mb-4">💰</div>
                        <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
                        <p className="text-gray-600">Great deals and offers every day</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;