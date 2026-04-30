/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppData } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LogOut, Edit, Calendar, Package, MapPin,
  ChefHat, Store, TrendingUp, Trash2
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const AccountPage = () => {
  const { user, setUser, setAuth, fetchUser } = useAppData();
  const navigate = useNavigate();

  const firstLetter = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  const isSeller = user?.role === "seller";

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/logout`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
      );
    } catch (err) {
      console.log(err);
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
      setAuth(false);
      toast.success("Logged out successfully");
      navigate("/login");
    }
  };

  // Delete Restaurant Function
  const handleDeleteRestaurant = async () => {
    const confirmed = window.confirm(
      "⚠️ This action is irreversible!\n\n" +
      "Deleting your restaurant will:\n" +
      "• Permanently remove your restaurant profile\n" +
      "• Delete all menu items\n" +
      "• Remove all associated orders and data\n\n" +
      "Are you sure you want to delete your restaurant?"
    );

    if (!confirmed) return;

    try {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_RESTAURANT_API_URL}/delete-restaurant`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
        }
      );

      // ✅ save new clean token instead of removing it
      if (data.token) {
        localStorage.setItem("accessToken", data.token);
      }

      // ✅ refresh context with new token data
      await fetchUser();

      toast.success("Restaurant deleted successfully");
      navigate("/my-restaurant"); // ✅ shows AddRestaurant form automatically

    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete restaurant. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 to-orange-50 pb-16">
      <div className="max-w-4xl mx-auto px-6 pt-10">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center mb-14">
          <div className="relative">
            {user?.image ? (
              <img
                src={user.image}
                alt="profile"
                referrerPolicy="no-referrer"
                className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-2xl ring-2 ring-orange-100"
              />
            ) : (
              <div className="w-36 h-36 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-7xl font-bold text-white shadow-2xl">
                {firstLetter}
              </div>
            )}
          </div>

          <h2 className="mt-6 text-4xl font-bold text-gray-900 tracking-tight">{user?.name}</h2>
          <p className="text-gray-600 mt-2 text-lg">{user?.email}</p>

          <div className="mt-5">
            <span className={`px-6 py-2 text-sm font-semibold rounded-full ${isSeller
              ? "bg-emerald-100 text-emerald-700"
              : "bg-orange-100 text-orange-700"}`}>
              {isSeller ? "RESTAURANT OWNER" : "CUSTOMER"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-8">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Edit className="w-5 h-5 text-orange-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-lg mt-1">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium mt-1">{user?.email}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    {new Date(user?.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Role-Specific Card */}
            {isSeller ? (
              <Card className="shadow-sm border-emerald-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Store className="w-6 h-6 text-emerald-600" />
                    Your Restaurant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 p-6 bg-emerald-50 rounded-2xl">
                    <div className="text-5xl">🍽️</div>
                    <div>
                      <p className="text-xl font-semibold">Manage Your Business</p>
                      <p className="text-gray-600 mt-1">
                        Update menu, track orders, and grow your restaurant
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate("/my-restaurant")}
                    className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    Go to Restaurant Dashboard
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Package className="w-6 h-6 text-orange-600" />
                    Your Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Track your past and current food orders</p>
                  <Button
                    onClick={() => navigate("/my-orders")}
                    variant="outline"
                    className="mt-6 w-full hover:bg-orange-600 hover:text-white"
                  >
                    View All Orders
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Quick Actions + Danger Zone */}
          <div className="lg:col-span-5 space-y-8">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isSeller ? (
                  <>
                    <Button onClick={() => navigate("/my-restaurant")} variant="outline" className="w-full justify-start h-14 text-left hover:bg-orange-50">
                      <ChefHat className="mr-4 w-5 h-5" />
                      Manage Restaurant
                    </Button>
                    <Button onClick={() => navigate("/menu")} variant="outline" className="w-full justify-start h-14 text-left hover:bg-orange-50">
                      <Package className="mr-4 w-5 h-5" />
                      Manage Menu Items
                    </Button>
                    <Button onClick={() => navigate("/sales")} variant="outline" className="w-full justify-start h-14 text-left hover:bg-orange-50">
                      <TrendingUp className="mr-4 w-5 h-5" />
                      Sales & Analytics
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => navigate("/my-orders")} variant="outline" className="w-full justify-start h-14 text-left hover:bg-orange-50">
                      <Package className="mr-4 w-5 h-5" />
                      My Orders
                    </Button>
                    <Button onClick={() => navigate("/address")} variant="outline" className="w-full justify-start h-14 text-left hover:bg-orange-50">
                      <MapPin className="mr-4 w-5 h-5" />
                      Saved Addresses
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Danger Zone - Now includes Delete Restaurant for Sellers */}
            <Card className="border-red-200 bg-red-50/60">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logout */}
                <div className="p-6 bg-white rounded-2xl border border-red-100">
                  <p className="font-semibold text-gray-900">Logout from Account</p>
                  <p className="text-gray-600 text-sm mt-1">
                    You will be signed out from all devices.
                  </p>
                  <Button
                    onClick={handleLogout}
                    variant="destructive"
                    className="mt-6 w-full flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout Now
                  </Button>
                </div>

                {/* Delete Restaurant - Only for Sellers */}
                {isSeller && (
                  <div className="p-6 bg-white rounded-2xl border border-red-200">
                    <p className="font-semibold text-red-600">Delete Restaurant</p>
                    <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                      Permanently delete your restaurant, menu, and all associated data.
                      This action cannot be undone.
                    </p>
                    <Button
                      onClick={handleDeleteRestaurant}
                      variant="destructive"
                      className="mt-6 w-full bg-red-600 text-bg-white hover:bg-red-700 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete My Restaurant
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;