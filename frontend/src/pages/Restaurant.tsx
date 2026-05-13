/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IMenu, IRestaurant } from "@/types";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import AddRestaurant from "./AddRestaurant";
import {
    MapPin, Phone, Calendar, Edit2, UtensilsCrossed,
    Power, X, Upload, ChefHat
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import MenuItems from "@/components/MenuItems";
import AddMenu from "@/components/AddMenu";

type SellerTab = "menu" | "add-item" | "sales";

const Restaurant = () => {
    const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [tab, setTab] = useState<SellerTab>("menu");

    const [editForm, setEditForm] = useState({ name: "", description: "", phone: "" });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [updating, setUpdating] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchMyRestaurant = async () => {
        try {
            const { data } = await axios.get(
                `${import.meta.env.VITE_RESTAURANT_API_URL}/my-restaurant`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
                }
            );
            setRestaurant(data.restaurant);
            if (data.token) localStorage.setItem("accessToken", data.token);
        } catch (error) {
            console.error("Failed to fetch restaurant", error);
        } finally {
            setLoading(false);
        }
    };

    // Modern Status Toggle with Celebration
    const toggleRestaurantStatus = async () => {
        if (!restaurant) return;

        setUpdatingStatus(true);

        try {
            const newStatus = !restaurant.isOpen;

            await axios.put(
                `${import.meta.env.VITE_RESTAURANT_API_URL}/update-status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
            );

            setRestaurant(prev => prev ? { ...prev, isOpen: newStatus } : null);

            if (newStatus) {
                // Celebration for going Online
                toast.success("🎉 Hurray! Your restaurant is now LIVE!", {
                    duration: 4000,
                    position: "top-center",
                    icon: "🚀",
                });
            } else {
                toast.success("Restaurant is now Closed", {
                    position: "top-center",
                });
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update status");
        } finally {
            setUpdatingStatus(false);
        }
    };

    const openEditModal = () => {
        if (!restaurant) return;
        setEditForm({
            name: restaurant.name || "",
            description: restaurant.description || "",
            phone: restaurant.phone || "",
        });
        setImagePreview(restaurant.image);
        setSelectedFile(null);
        setIsEditModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleUpdateRestaurant = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!restaurant) return;

        if (!editForm.name || !editForm.description || !editForm.phone) {
            toast.error("All fields are required");
            return;
        }

        setUpdating(true);
        try {
            const formData = new FormData();
            formData.append("name", editForm.name);
            formData.append("description", editForm.description);
            formData.append("phone", editForm.phone);
            if (selectedFile) formData.append("file", selectedFile);

            await axios.put(
                `${import.meta.env.VITE_RESTAURANT_API_URL}/update-restaurant`,
                formData,
                { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
            );

            toast.success("Restaurant updated successfully!");
            setIsEditModalOpen(false);
            fetchMyRestaurant();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Update failed");
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        fetchMyRestaurant();
    }, []);




    const [menuItems, setMenuItems] = useState<IMenu[]>([]);

    const fetchMenuItems = async (restaurantId: string) => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_MENU_API_URL}/get-all-menu-items/${restaurantId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            })
            setMenuItems(data.items);
            console.log(data.items[0].name);
            console.log("restaurantid is ->", restaurantId);
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        if (restaurant?._id) {
            fetchMenuItems(restaurant._id)
        }
    }, [restaurant?._id])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[70vh]">
                <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-orange-500"></div>
            </div>
        );
    }

    if (!restaurant) {
        return <AddRestaurant fetchMyRestaurant={fetchMyRestaurant} />;
    }

    const { name, description, image, isOpen, isVerified, address, phone, createdAt } = restaurant;

    return (
        <div className="min-h-screen bg-linear-to-br from-zinc-50 to-orange-50 pb-16">
            <Toaster position="top-center" />

            <div className="max-w-6xl mx-auto px-4 pt-8">
                {/* Hero Card */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 mb-10">
                    <div className="relative h-95 md:h-110">
                        <img src={image} alt={name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

                        {/* Status Badges */}
                        <div className="absolute top-6 right-6 flex flex-col gap-3">
                            <div className={`px-6 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 backdrop-blur-lg shadow-md transition-all ${isOpen ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                                <div className={`w-3 h-3 rounded-full ${isOpen ? "bg-white animate-pulse" : "bg-white"}`} />
                                {isOpen ? "OPEN NOW" : "CLOSED"}
                            </div>
                            {isVerified && (
                                <div className="px-6 py-2 rounded-full text-sm font-semibold bg-white/95 text-emerald-700 flex items-center gap-2 shadow-sm">
                                    ✓ VERIFIED
                                </div>
                            )}
                        </div>

                        {/* Name & Cuisine */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                            <div className="flex items-center gap-3 mb-2">
                                <ChefHat className="w-9 h-9" />
                                <h1 className="text-5xl md:text-6xl font-bold tracking-tighter drop-shadow-md">{name}</h1>
                            </div>
                            <p className="text-orange-100 text-xl flex items-center gap-2">
                                <UtensilsCrossed className="w-5 h-5" />
                                Asian • Fine Dining
                            </p>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="p-8 md:p-10">
                        <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">{description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                            <div className="bg-zinc-50 p-6 rounded-2xl hover:bg-zinc-100 transition-all">
                                <div className="flex items-center gap-3 text-orange-600 mb-3">
                                    <MapPin className="w-6 h-6" />
                                    <h3 className="font-semibold">Location</h3>
                                </div>
                                <p className="text-gray-700 leading-relaxed">{address}</p>
                            </div>

                            <div className="bg-zinc-50 p-6 rounded-2xl hover:bg-zinc-100 transition-all">
                                <div className="flex items-center gap-3 text-orange-600 mb-3">
                                    <Phone className="w-6 h-6" />
                                    <h3 className="font-semibold">Contact</h3>
                                </div>
                                <p className="text-gray-700 text-lg font-medium">{phone}</p>
                            </div>

                            <div className="bg-zinc-50 p-6 rounded-2xl hover:bg-zinc-100 transition-all">
                                <div className="flex items-center gap-3 text-orange-600 mb-3">
                                    <Calendar className="w-6 h-6" />
                                    <h3 className="font-semibold">Joined</h3>
                                </div>
                                <p className="text-gray-700">
                                    {new Date(createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-12 flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={toggleRestaurantStatus}
                                disabled={updatingStatus}
                                className={`flex-1 py-4 px-6 rounded-2xl font-semibold flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-70 shadow-md ${isOpen
                                    ? "bg-red-600 hover:bg-red-700 text-white"
                                    : "bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"}`}
                            >
                                <Power className="w-5 h-5" />
                                {updatingStatus ? "Updating..." : isOpen ? "Close Restaurant" : "Go Online Now"}
                            </button>

                            <button
                                onClick={openEditModal}
                                className="flex-1 py-4 px-6 rounded-2xl font-semibold flex items-center justify-center gap-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:shadow-xl active:scale-95 transition-all"
                            >
                                <Edit2 className="w-5 h-5" />
                                Edit Details
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modern Tab Navigation */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="flex border-b border-gray-100">
                        {[
                            { key: "menu", label: "Menu" },
                            { key: "add-item", label: "Add Item" },
                            { key: "sales", label: "Sales & Analytics" }
                        ].map((item) => (
                            <button
                                key={item.key}
                                onClick={() => setTab(item.key as SellerTab)}
                                className={`flex-1 py-5 text-base font-semibold transition-all relative ${tab === item.key ? "text-orange-600" : "text-gray-600 hover:text-gray-900"}`}
                            >
                                {item.label}
                                {tab === item.key && (
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-orange-500 rounded-t-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 min-h-100">
                    {tab === "menu" && <MenuItems items={menuItems} onItemDeleted={() => fetchMenuItems(restaurant._id)} isSeller={true} />}
                    {tab === "add-item" && <AddMenu onItemAdded={() => fetchMenuItems(restaurant._id)} />}
                    {tab === "sales" && <MenuItems />}
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg max-h-[88vh] overflow-hidden shadow-2xl flex flex-col">
                        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 className="text-2xl font-semibold">Edit Restaurant</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <form onSubmit={handleUpdateRestaurant} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 cursor-pointer hover:border-orange-400 transition" onClick={() => fileInputRef.current?.click()}>
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="rounded-xl mx-auto max-h-56 object-cover" />
                                        ) : (
                                            <div className="py-14 text-center">
                                                <Upload className="mx-auto w-12 h-12 text-gray-400" />
                                                <p className="mt-2 text-gray-500">Upload new image</p>
                                            </div>
                                        )}
                                    </div>
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                                    <input type="text" name="name" value={editForm.name} onChange={handleInputChange} className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:border-orange-500" required />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea name="description" value={editForm.description} onChange={handleInputChange} rows={4} className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:border-orange-500 resize-y" required />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input type="tel" name="phone" value={editForm.phone} onChange={handleInputChange} className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:border-orange-500" required />
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 rounded-2xl border border-gray-300 font-medium hover:bg-gray-50">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={updating} className="flex-1 py-4 rounded-2xl bg-linear-to-r from-orange-600 to-amber-600 text-white font-semibold disabled:opacity-70">
                                        {updating ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Restaurant;