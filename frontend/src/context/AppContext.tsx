/* eslint-disable react-refresh/only-export-components */
import type { AppContextType, LocationData, User } from "@/types";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: React.ReactNode;
}



export const AppProvider = ({ children }: AppProviderProps) => {

    const [user, setUser] = useState<User | null>(null);
    const [auth, setAuth] = useState(false);
    const [loading, setLoading] = useState(true);


    const [location, setLocation] = useState<LocationData | null>(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [city, setCity] = useState("fetching location...");

    async function fetchUser() {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                setAuth(false);
                return;
            }

            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/my-user`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("Fetched user data:", data);
            setUser(data.user);
            setAuth(true);

        } catch (error) {
            console.error("Error fetching user:", error);
        } finally {
            setLoading(false);
        }

    }

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <AppContext.Provider value={{
            user, auth, loading,
            location, locationLoading, city,
            fetchUser, setUser, setAuth, setLoading,
            setLocation, setLocationLoading, setCity
        }}>

            {children}

        </AppContext.Provider>
    )
}

export const useAppData = () => {
    const context = useContext(AppContext);
    if (context === undefined || !context) {
        throw new Error("useAppData must be used within a AppProvider");
    }
    return context;
}