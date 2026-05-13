/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from "axios";
import { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { Upload, X, ChefHat, DollarSign } from "lucide-react";

interface AddMenuProps {
    onItemAdded: () => void;
}

const AddMenu = ({ onItemAdded }: AddMenuProps) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetForm = () => {
        setName('');
        setPrice('');
        setDescription('');
        setImage(null);
        setImagePreview(null);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size should be less than 5MB");
                return;
            }
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !price || !description || !image) {
            toast.error("Please fill all fields and upload an image");
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('description', description);
        formData.append('file', image);

        try {
            setLoading(true);
            await axios.post(
                `${import.meta.env.VITE_MENU_API_URL}/add-menu-items`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                }
            );

            toast.success("🎉 Menu item added successfully!", {
                duration: 3000,
            });

            resetForm();
            onItemAdded();
        } catch (error: any) {
            console.error('Error adding menu item:', error);
            toast.error(error.response?.data?.message || "Failed to add menu item");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-8 py-6 text-white">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                        <ChefHat className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Add New Menu Item</h2>
                        <p className="text-orange-100 text-sm">Fill the details below</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Food Image
                    </label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 hover:border-orange-400 rounded-3xl p-8 text-center cursor-pointer transition-all hover:bg-orange-50"
                    >
                        {imagePreview ? (
                            <div className="relative mx-auto max-w-[280px]">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="rounded-2xl shadow-md mx-auto max-h-64 object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setImage(null);
                                        setImagePreview(null);
                                    }}
                                    className="absolute -top-3 -right-3 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="py-10">
                                <div className="mx-auto w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center">
                                    <Upload className="w-10 h-10 text-orange-600" />
                                </div>
                                <p className="mt-4 text-gray-600 font-medium">Click to upload food image</p>
                                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                            </div>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                    />
                </div>

                {/* Item Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Butter Chicken"
                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-lg"
                        required
                    />
                </div>

                {/* Price */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                    <div className="relative">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="249"
                            className="w-full pl-12 pr-5 py-4 rounded-2xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-lg"
                            required
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Delicious butter chicken cooked in rich tomato gravy with aromatic spices..."
                        rows={4}
                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none resize-y min-h-[120px]"
                        required
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white py-4 rounded-2xl font-semibold text-lg transition-all active:scale-[0.985] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                            Adding Item...
                        </>
                    ) : (
                        "Add Menu Item"
                    )}
                </button>
            </form>
        </div>
    );
};

export default AddMenu;