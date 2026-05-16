/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Plus, Trash2, Loader, LocateFixed, Edit2 } from "lucide-react";

// Fix Leaflet Marker Icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Address {
    _id: string;
    formattedAddress: string;
    mobile: string;
    latitude?: number;
    longitude?: number;
}

// Location Picker — click on map to set location
const LocationPicker = ({ setLocation }: { setLocation: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            setLocation(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// Fly to location when lat/lng changes
const FlyToLocation = ({ lat, lng }: { lat: number | null; lng: number | null }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.flyTo([lat, lng], 15);
        }
    }, [lat, lng, map]);
    return null;
};

const AddAddressPage = () => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [locating, setLocating] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    // Form State
    const [mobile, setMobile] = useState("");
    const [formattedAddress, setFormattedAddress] = useState("");
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);

    // Reverse Geocoding
    const fetchFormattedAddress = async (lat: number, lng: number) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await res.json();
            setFormattedAddress(data.display_name || "Address not found");
        } catch {
            toast.error("Could not fetch address");
        }
    };

    const setLocation = (lat: number, lng: number) => {
        setLatitude(lat);
        setLongitude(lng);
        fetchFormattedAddress(lat, lng);
    };

    // ✅ Use Current Location
    const useCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation(latitude, longitude); // ✅ sets state + fetches address + flies map
                setLocating(false);
                toast.success("Location detected!");
            },
            () => {
                toast.error("Could not get your location. Please allow location access.");
                setLocating(false);
            }
        );
    };

    // Fetch Addresses
    const fetchAddresses = async () => {
        try {
            const { data } = await axios.get(
                `${import.meta.env.VITE_ADDRESS_API_URL}/get-addresses`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
                }
            );
            setAddresses(data.addresses || data || []);
        } catch (error) {
            toast.error("Failed to load addresses");
        } finally {
            setLoading(false);
        }
    };

    // Add / Update Address
    const saveAddress = async () => {
        if (!mobile || !formattedAddress || latitude === null || longitude === null) {
            toast.error("Please fill all fields and select location on map");
            return;
        }

        try {
            setAdding(true);

            if (editingAddress) {
                await axios.put(
                    `${import.meta.env.VITE_ADDRESS_API_URL}/edit-address/${editingAddress._id}`,
                    { mobile, formattedAddress, latitude, longitude },
                    { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
                );
                toast.success("Address updated successfully!");
            } else {
                await axios.post(
                    `${import.meta.env.VITE_ADDRESS_API_URL}/add-address`,
                    { mobile, formattedAddress, latitude, longitude },
                    { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
                );
                toast.success("Address added successfully!");
            }

            resetForm();
            fetchAddresses();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Operation failed");
        } finally {
            setAdding(false);
        }
    };

    // Delete Address
    const deleteAddress = async (id: string) => {
        if (!window.confirm("Delete this address?")) return;
        try {
            setDeletingId(id);
            await axios.delete(
                `${import.meta.env.VITE_ADDRESS_API_URL}/delete-address/${id}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
            );
            toast.success("Address deleted");
            fetchAddresses();
        } catch {
            toast.error("Failed to delete address");
        } finally {
            setDeletingId(null);
        }
    };

    const startEditing = (addr: Address) => {
        setEditingAddress(addr);
        setMobile(addr.mobile.toString());
        setFormattedAddress(addr.formattedAddress);
        setLatitude(addr.latitude || null);
        setLongitude(addr.longitude || null);
    };

    const resetForm = () => {
        setMobile("");
        setFormattedAddress("");
        setLatitude(null);
        setLongitude(null);
        setEditingAddress(null);
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">
                {editingAddress ? "Edit Address" : "Manage Delivery Addresses"}
            </h1>

            {/* ✅ Use Current Location Button — outside map */}
            <button
                onClick={useCurrentLocation}
                disabled={locating}
                className="w-full flex items-center justify-center gap-3 py-4 border-2 border-dashed border-orange-300 hover:border-orange-500 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-2xl font-semibold transition-all disabled:opacity-70"
            >
                {locating ? (
                    <Loader className="w-5 h-5 animate-spin" />
                ) : (
                    <LocateFixed className="w-5 h-5" />
                )}
                {locating ? "Fetching your location..." : "Use Your Current Location"}
            </button>

            {/* Map */}
            <div className="relative w-full rounded-3xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: "420px" }}>
                <MapContainer
                    center={[latitude || 27.1767, longitude || 78.0081]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap contributors'
                    />
                    <LocationPicker setLocation={setLocation} />
                    <FlyToLocation lat={latitude} lng={longitude} /> {/* ✅ flies map when location changes */}
                    {latitude && longitude && <Marker position={[latitude, longitude]} />}
                </MapContainer>
            </div>

            <p className="text-sm text-gray-500 text-center -mt-4">
                📍 Click anywhere on the map to set your delivery location
            </p>

            {/* Selected Location */}
            {formattedAddress && (
                <div className="bg-green-50 border border-green-200 p-5 rounded-2xl flex gap-3">
                    <MapPin className="w-6 h-6 text-green-600 mt-0.5" />
                    <div>
                        <p className="font-medium text-green-800">Selected Location</p>
                        <p className="text-green-700 text-sm mt-1">{formattedAddress}</p>
                    </div>
                </div>
            )}

            {/* Mobile Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                <input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-orange-500 focus:ring-1 outline-none text-lg"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <button
                    onClick={saveAddress}
                    disabled={adding || !mobile || !formattedAddress}
                    className="flex-1 bg-linear-to-r from-orange-600 to-amber-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 hover:shadow-xl transition disabled:opacity-70"
                >
                    {adding ? <Loader className="w-5 h-5 animate-spin" /> : editingAddress ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {adding ? "Saving..." : editingAddress ? "Update Address" : "Save Address"}
                </button>

                {editingAddress && (
                    <button
                        onClick={resetForm}
                        className="px-8 py-4 border border-gray-300 rounded-2xl font-medium hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {/* Saved Addresses */}
            <div className="mt-12">
                <h2 className="text-2xl font-semibold mb-6">Saved Addresses</h2>

                {loading ? (
                    <p className="text-gray-500">Loading addresses...</p>
                ) : addresses.length === 0 ? (
                    <p className="text-gray-500 italic">No saved addresses yet</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map((addr) => (
                            <div
                                key={addr._id}
                                className="bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-md transition group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800 leading-relaxed">
                                            {addr.formattedAddress}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            📞 {addr.mobile}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => startEditing(addr)}
                                            className="text-orange-600 hover:bg-orange-50 p-2 rounded-xl transition"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => deleteAddress(addr._id)}
                                            disabled={deletingId === addr._id}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition"
                                        >
                                            {deletingId === addr._id ? (
                                                <Loader className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddAddressPage;