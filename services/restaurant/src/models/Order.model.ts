import mongoose, { Schema, Document } from "mongoose";


export interface IOrder extends Document {
    userId: string,
    restaurantId: string,
    restaurantName: string,
    riderId?: string | null,
    riderPhone?: string | null,
    riderName?: string | null,
    distance?: number | null,
    riderAmount: number,


    items: {
        itemId: string,
        name: string,
        price: number,
        quantity: number
    }[],



    subtotal: number,
    deliveryFee: number,
    platformFee: number,
    totalAmount: number,



    addressId: string,
    deliveryAddress: {
        formattedAddress: string,
        mobile: string,
        latitude: number,
        longitude: number
    },


    status: "placed" | "accepted" | "preparing" | "ready_for_rider" | "rider_assigned" | "picked_up" | "delivered" | "cancelled",

    paymentMethod: "razorpay" | "stripe",
    paymentStatus: "pending" | "paid" | "failed",


    expiredAt: Date,


    createdAt: Date,
    updatedAt: Date
};


const OrderSchema: Schema = new Schema({
    userId: { type: String, required: true },
    restaurantId: { type: String, required: true },
    restaurantName: { type: String, required: true },
    riderId: { type: String, default: null },
    riderPhone: { type: String, required: true },
    riderName: { type: String, default: null },
    distance: { type: Number, default: null },
    items: [
        {
            itemId: { type: String, required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true }
        }
    ],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    riderAmount: { type: Number, required: true },

    addressId: { type: String, required: true },
    deliveryAddress: {
        formattedAddress: { type: String, required: true },
        mobile: { type: String, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },

    status: { type: String, enum: ["placed", "accepted", "preparing", "ready_for_rider", "rider_assigned", "picked_up", "delivered", "cancelled"], default: "placed" },
    paymentMethod: { type: String, enum: ["razorpay", "stripe"], default: "razorpay" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    expiredAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }
}, {
    timestamps: true
});

export default mongoose.model<IOrder>("Order", OrderSchema);