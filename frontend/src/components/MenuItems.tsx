/* eslint-disable @typescript-eslint/no-unused-vars */
import type { IMenu } from "@/types";
import axios from "axios";
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { Trash2, Edit3, Plus, Clock, X, Upload } from "lucide-react";
import { useAppData } from "@/context/AppContext";

interface MenuItemsProps {
  items: IMenu[];
  onItemDeleted: () => void;
  isSeller: boolean;
  restaurantId?: string;
}

const MenuItems = ({ items, onItemDeleted, isSeller, restaurantId }: MenuItemsProps) => {
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IMenu | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", price: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {fetchCart}=useAppData();

  const handleDelete = async (itemId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this menu item? This action cannot be undone.");
    if (!confirmDelete) return;
    try {
      setLoadingItemId(itemId);
      await axios.delete(`${import.meta.env.VITE_MENU_API_URL}/delete-menu-item/${itemId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      toast.success("Menu item deleted successfully");
      onItemDeleted();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete menu item");
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleToggleAvailability = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      await axios.patch(`${import.meta.env.VITE_MENU_API_URL}/toggle-availability/${itemId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      toast.success("Availability updated!");
      onItemDeleted();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to toggle availability");
    } finally {
      setLoadingItemId(null);
    }
  };

  const addToCart = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      await axios.post(`${import.meta.env.VITE_CART_API_URL}/add-to-cart`, {
        restaurantId,
        itemId
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
      });
      toast.success("Item added to cart!");
      await fetchCart();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setLoadingItemId(null);
    }
  }; 

  const openEditModal = (item: IMenu) => {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
    });
    setImagePreview(item.image || "");
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editForm.name || !editForm.description || !editForm.price) {
      toast.error("All fields are required");
      return;
    }
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append("name", editForm.name);
      formData.append("description", editForm.description);
      formData.append("price", editForm.price);
      if (selectedFile) formData.append("file", selectedFile);

      await axios.patch(
        `${import.meta.env.VITE_MENU_API_URL}/edit-menu-item/${editingItem._id}`,
        formData,
        { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
      );
      toast.success("Menu item updated successfully!");
      setIsEditModalOpen(false);
      onItemDeleted();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update menu item");
    } finally {
      setUpdating(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Clock className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-800">No menu items yet</h3>
        <p className="text-gray-500 mt-2">Start adding delicious items to your menu!</p>
      </div>
    );
  }

  // ✅ return is now properly inside MenuItems, outside all other functions
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item) => {
          const isLoading = loadingItemId === item._id;
          return (
            <div
              key={item._id}
              className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-orange-200 flex flex-col h-full"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className={`w-full h-full object-cover transition-transform group-hover:scale-105 duration-500 ${!item.isAvailable ? "grayscale" : ""}`}
                />
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="bg-white/90 text-red-600 px-6 py-2 rounded-full font-semibold text-sm tracking-widest">
                      CURRENTLY UNAVAILABLE
                    </div>
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white px-4 py-1.5 rounded-2xl shadow-md font-bold text-lg">
                  ₹{item.price}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 mb-2">{item.name}</h3>
                <p className="text-gray-600 text-sm line-clamp-3 flex-1 mb-6">{item.description}</p>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-100 mt-auto">
                  {isSeller ? (
                    <>
                      <button
                        onClick={() => handleDelete(item._id)}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-2xl font-medium transition-all active:scale-95 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        {isLoading ? "..." : "Delete"}
                      </button>

                      <button
                        onClick={() => openEditModal(item)}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-600 py-3 rounded-2xl font-medium transition-all active:scale-95 disabled:opacity-50"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>

                      <button
                        onClick={() => handleToggleAvailability(item._id)}
                        disabled={isLoading}
                        className={`flex-1 flex items-center justify-center py-3 rounded-2xl font-medium transition-all active:scale-95 disabled:opacity-50 ${item.isAvailable
                          ? "bg-green-50 hover:bg-green-100 text-green-600"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-500"
                          }`}
                      >
                        {item.isAvailable ? "Mark Unavailable" : "Mark Available"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => addToCart(item._id)} // ✅ wired up
                      disabled={!item.isAvailable || isLoading}
                      className={`flex-1 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 ${item.isAvailable
                        ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:shadow-xl"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                      <Plus className="w-5 h-5" />
                      {isLoading ? "Adding..." : item.isAvailable ? "Add to Cart" : "Unavailable"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[88vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-semibold">Edit Menu Item</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Image</label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-2xl p-4 cursor-pointer hover:border-orange-400 transition"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="rounded-xl mx-auto max-h-48 object-cover" />
                    ) : (
                      <div className="py-10 text-center">
                        <Upload className="mx-auto w-10 h-10 text-gray-400" />
                        <p className="mt-2 text-gray-500">Click to upload new image</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                  <input
                    type="text" name="name" value={editForm.name}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:border-orange-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description" value={editForm.description}
                    onChange={handleInputChange} rows={3}
                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:border-orange-500 focus:outline-none resize-y"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number" name="price" value={editForm.price}
                    onChange={handleInputChange} min="0"
                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:border-orange-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button" onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl border border-gray-300 font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" disabled={updating}
                    className="flex-1 py-4 rounded-2xl bg-linear-to-r from-orange-600 to-amber-600 text-white font-semibold disabled:opacity-70"
                  >
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 

export default MenuItems;