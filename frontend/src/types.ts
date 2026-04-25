import type React from "react";

export interface User {
    _id: string,
    name: string;
    email: string;
    role: string;
    image: string
}

export interface LocationData {
    latitude: number;
    longitude: number;
    formattedAddress: string;
}

export interface AppContextType {
    user: User | null;
    auth: boolean;
    loading: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setAuth: React.Dispatch<React.SetStateAction<boolean>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    location: LocationData | null;
    locationLoading: boolean;
    city: string;
    postcode: string;
    setPostcode: React.Dispatch<React.SetStateAction<string>>;
    setLocation: React.Dispatch<React.SetStateAction<LocationData | null>>;
    setLocationLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setCity: React.Dispatch<React.SetStateAction<string>>;
    initializing: boolean;
    setInitializing: React.Dispatch<React.SetStateAction<boolean>>;
    fetchUser: () => Promise<void>;
}


export interface IRestaurant {
    _id: string;
    name: string;
    description?: string;
    address: string;
    phone: string;
    image: string;
    ownerId: string;
    isVerified: boolean;
    restaurantId: string;

    autoLocation: {
        type: "Point",
        coordinates: [number, number],
        formattedAddress: string;
    };

    isOpen: boolean;
    openingTime: string;
    closingTime: string;

    createdAt: Date;
    updatedAt: Date;
}

