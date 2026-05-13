import { useAppData } from "@/context/AppContext";
import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Search } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
    const { auth, cartLength } = useAppData();
    const currentLocation = useLocation();

    const isHomePage = currentLocation.pathname === "/";

    const [searchParam, setSearchParam] = useSearchParams();
    const [search, setSearch] = useState(searchParam.get("search") || "");


    useEffect(() => {
        const timer = setTimeout(() => {
            if (search.trim()) {
                setSearchParam({ search });
            } else {
                setSearchParam({});
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [search, setSearchParam]);

    return (
        <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-3xl shadow-md group-hover:scale-110 transition-transform">
                        🍔
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tighter text-gray-900">FOOD MESH</h1>
                        <p className="text-[10px] text-orange-600 -mt-1 font-medium">Fresh • Fast • Delivered</p>
                    </div>
                </Link>

                {/* Search Bar - Visible only on Home Page */}
                {isHomePage && (
                    <div className="flex-1 max-w-xl mx-8 relative">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search restaurants, dishes, or cuisine..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-gray-100 border border-gray-200 pl-11 py-3 rounded-2xl focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-sm"
                            />
                        </div>
                    </div>
                )}

                {/* Right Side Navigation */}
                <div className="flex items-center gap-3">
                    {/* Shopping Cart */}
                    {/* Shopping Cart */}
                    <Link to="/shopping-cart">
                        <Button variant="ghost" size="icon" className="relative hover:bg-orange-50">
                            <ShoppingCart className="w-5 h-5" />
                            {cartLength > 0 && (
                                <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                    {cartLength > 99 ? "99+" : cartLength}
                                </div>
                            )}
                        </Button>
                    </Link>

                    {/* Auth Section */}
                    {auth ? (
                        <>
                            {/* My Profile */}
                            <Link to="/my-account">
                                <Button variant="ghost" size="icon" className="hover:bg-orange-50">
                                    <User className="w-5 h-5" />
                                </Button>
                            </Link>

                            {/* Cart Length Badge */}
                        </>
                    ) : (
                        <Link to="/login">
                            <Button className="bg-orange-600 hover:bg-orange-700 text-white px-6">
                                Login
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;