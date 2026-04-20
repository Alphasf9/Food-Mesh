import { useAppData } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Edit, Calendar, Package, MapPin } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const AccountPage = () => {
  const { user, setUser, setAuth } = useAppData();
  const navigate = useNavigate();

  const firstLetter = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      localStorage.removeItem("accessToken");
      setUser(null);
      setAuth(false);
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err) {
      console.log(err);
      localStorage.removeItem("accessToken");
      setUser(null);
      setAuth(false);
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-3xl mx-auto px-6 pt-10">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="relative">
            {user?.image ? (
              <img
                src={user.image}
                alt="profile"
                referrerPolicy="no-referrer"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
              />
            ) : (
              <div className="w-32 h-32 bg-linear-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-6xl font-bold text-white shadow-xl">
                {firstLetter}
              </div>
            )}
          </div>

          <h2 className="mt-6 text-4xl font-bold text-gray-900">{user?.name}</h2>
          <p className="text-gray-600 mt-1 text-lg">{user?.email}</p>

          <div className="mt-4">
            <span className="px-5 py-2 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full">
              {user?.role?.toUpperCase() || "CUSTOMER"}
            </span>
          </div>
        </div>

        {/* Account Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium text-lg">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(user?.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-2xl">
                <div className="text-5xl">
                  {user?.role === "customer" && "🛍️"}
                  {user?.role === "seller" && "🍽️"}
                  {user?.role === "rider" && "🏍️"}
                </div>
                <div>
                  <p className="text-2xl font-semibold capitalize">{user?.role}</p>
                  <p className="text-gray-600 mt-1">
                    {user?.role === "customer" && "You can browse restaurants and place orders"}
                    {user?.role === "seller" && "Manage your restaurant and orders"}
                    {user?.role === "rider" && "Deliver orders and earn money"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Your Orders */}
          <Card
            className="hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => navigate("/my-orders")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Package className="w-6 h-6 text-orange-600" />
                Your Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                View your past and active orders
              </p>
              <Button variant="outline" className="group-hover:bg-orange-600 group-hover:text-white transition-colors">
                View All Orders
              </Button>
            </CardContent>
          </Card>

          {/* Saved Addresses */}
          <Card
            className="hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => navigate("/address")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-orange-600" />
                Saved Addresses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Manage your delivery addresses
              </p>
              <Button variant="outline" className="group-hover:bg-orange-600 group-hover:text-white transition-colors">
                Manage Addresses
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-white rounded-2xl border border-red-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <p className="font-semibold text-gray-900">Logout from Account</p>
                  <p className="text-gray-600 mt-1 text-sm">
                    You will be signed out and redirected to the login page.
                  </p>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <LogOut className="w-4 h-4" />
                  Logout Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountPage;