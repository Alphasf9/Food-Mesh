import mongoose, { Schema, Document } from "mongoose";



export interface IRestaurant extends Document {
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


const RestaurantSchema: Schema = new Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    image: { type: String, required: true },
    ownerId: { type: String, required: true },
    isVerified: { type: Boolean, default: false },

    autoLocation: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        },

        // restaurantId: { type: String, required: true },
        formattedAddress: { type: String, required: true }
    },
    isOpen: { type: Boolean, default: false },
    openingTime: { type: String },
    closingTime: { type: String }
}, {
    timestamps: true
});

RestaurantSchema.index({ autoLocation: "2dsphere" });
RestaurantSchema.index({ ownerId: 1 });


export default mongoose.model<IRestaurant>("Restaurant", RestaurantSchema);

