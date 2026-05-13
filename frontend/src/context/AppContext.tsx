/* eslint-disable react-refresh/only-export-components */
import type { AppContextType, ICart, LocationData, User } from "@/types";
import axios from "axios";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: React.ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {

    const [user, setUser] = useState<User | null>(null);
    const [auth, setAuth] = useState(false);
    const [loading, setLoading] = useState(true);
    const [initializing, setInitializing] = useState(true);
    const [cart, setCart] = useState<ICart[]>([]);
    const [subTotal, setSubTotal] = useState(0);
    const [quantity, setQuantity] = useState(0);
    const [cartLength, setCartLength] = useState(0);

    const [location, setLocation] = useState<LocationData | null>(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [city, setCity] = useState("fetching location...");
    const [postcode, setPostcode] = useState("");

    const fetchCart = useCallback(async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) return;

            const { data } = await axios.get(`${import.meta.env.VITE_CART_API_URL}/my-cart`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            
            setCart(data.cart || []);
            setSubTotal(data.subTotal || 0);
            setQuantity(data.quantity || 0);
            setCartLength(data.cartLength || 0);
        } catch (error) {
            console.log("Error fetching cart:", error);
        }
    }, []);

    async function fetchUser() {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                setUser(null);
                setAuth(false);
                setLoading(false);
                setInitializing(false);
                return;
            }

            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/my-user`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setUser(data.user);
            setAuth(true);

            if (data.token) {
                localStorage.setItem("accessToken", data.token);
            }

            if (data.user?.role === "customer") {
                try {
                    const cartRes = await axios.get(`${import.meta.env.VITE_CART_API_URL}/my-cart`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setCart(cartRes.data.cart || []);
                    setSubTotal(cartRes.data.subTotal || 0);
                    setCartLength(cartRes.data.cartLength || 0);
                } catch (error) {
                    console.log("Error fetching cart on init:", error);
                }
            }

        } catch (error) {
            console.error("Error fetching user:", error);
            setUser(null);
            setAuth(false);
            localStorage.removeItem("accessToken");
        } finally {
            setLoading(false);
            setInitializing(false);
        }
    }

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (!navigator.geolocation) return alert("Please allow location access to use the app");
        setLocationLoading(true);

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;

            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await res.json();

                setLocation({
                    latitude,
                    longitude,
                    formattedAddress: data.display_name || "Unknown Location",
                });

                setCity(data.address.city || data.address.town || data.address.village || "Unknown City");
                setPostcode(data.address.postcode || "");
                setLocationLoading(false);

            } catch (error) {
                console.error("Error fetching location data:", error);
                setLocation({
                    latitude,
                    longitude,
                    formattedAddress: "Unknown Location",
                });
                setCity("Fetching location...");
                setPostcode("Please type if displayed postal code is wrong");
                setLocationLoading(false);
            }
        });
    }, []);

    const contextValue = {
        user, auth, loading, location,
        locationLoading, city, fetchUser, setUser,
        setAuth, setLoading, setLocation, setLocationLoading,
        setCity, postcode, setPostcode, initializing, setInitializing,
        cart, setCart, subTotal, setSubTotal, quantity, setQuantity,
        cartLength, setCartLength, fetchCart 
    } as AppContextType;

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppData = () => {
    const context = useContext(AppContext);
    if (context === undefined || !context) {
        throw new Error("useAppData must be used within a AppProvider");
    }
    return context;
};