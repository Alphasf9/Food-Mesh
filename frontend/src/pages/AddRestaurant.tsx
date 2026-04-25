import { useAppData } from "@/context/AppContext";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

const AddRestaurant = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [phone, setPhone] = useState("");

    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const [submitting, setSubmitting] = useState(false);

    const { locationLoading, location } = useAppData();

  
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !description || !phone || !image || !location) {
            toast.error("Please fill all fields");
            return;
        }

        try {
            setSubmitting(true);

            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("phone", phone);
            formData.append("latitude", location.latitude.toString());
            formData.append("longitude", location.longitude.toString());
            formData.append("formattedAddress", location.formattedAddress);
            formData.append("file", image);

            await axios.post(
                `${import.meta.env.VITE_RESTAURANT_API_URL}/create-restaurant`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            toast.success("Restaurant created successfully 🎉");

            // reset
            setName("");
            setDescription("");
            setPhone("");
            setImage(null);
            setPreview(null);
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 md:p-10">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Add Your Restaurant 🍽️</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Fill in details to get your restaurant live
                    </p>
                </div>

                {/* Location Card */}
                <div className="bg-gray-100 rounded-xl p-4 mb-6">
                    {locationLoading ? (
                        <p className="text-sm text-gray-500">Fetching location...</p>
                    ) : location ? (
                        <div className="text-sm text-gray-700">
                            📍 <b>Location:</b> {location.formattedAddress}
                        </div>
                    ) : (
                        <p className="text-red-500 text-sm">Location not available</p>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Name */}
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Restaurant Name"
                        className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-black"
                    />

                    {/* Description */}
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description"
                        className="w-full border rounded-xl p-3 h-28 outline-none focus:ring-2 focus:ring-black"
                    />

                    {/* Phone */}
                    <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone Number"
                        className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-black"
                    />

                    {/* Image Upload */}
                    <div>
                        <input
                            type="file"
                            onChange={handleImageChange}
                            className="w-full border rounded-xl p-3"
                        />

                        {preview && (
                            <img
                                src={preview}
                                className="mt-3 w-full h-48 object-cover rounded-xl"
                            />
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-900 transition flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                Creating...
                            </>
                        ) : (
                            "Create Restaurant"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddRestaurant;