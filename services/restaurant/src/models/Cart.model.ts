import mongoose, { Schema, Document } from "mongoose";


export interface ICart extends Document {
    userId: mongoose.Types.ObjectId;
    restaurantId: mongoose.Types.ObjectId;
    itemId: mongoose.Types.ObjectId;
    quantity: number;
    createdAt: Date;
    updatedAt: Date
}

const CartSchema: Schema = new Schema({
    userId:
    {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User",
        index:true
    },


    restaurantId: 
    { 
        type: mongoose.Types.ObjectId, 
        required: true, 
        ref: "Restaurant" 
    },


    itemId: 
    { 
        type: mongoose.Types.ObjectId, 
        required: true, 
        ref: "Menu" 
    },


    quantity: 
    { 
        type: Number, 
        required: true 
    },
}, {
    timestamps: true
});

CartSchema.index({ userId: 1, restaurantId: 1, itemId: 1 }, { unique: true });

export default mongoose.model<ICart>("Cart", CartSchema);