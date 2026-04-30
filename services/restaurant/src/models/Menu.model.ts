import mongoose, { Schema, Document } from 'mongoose';


export interface IMenu extends Document {
    name: string;
    description: string;
    price: number;
    restaurantId: mongoose.Types.ObjectId;
    image?: string;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MenuSchema = new Schema<IMenu>({
    restaurantId: {
        type: mongoose.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
        index: true
    },

    name: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    image: {
        type: String
    },

    isAvailable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});


const Menu = mongoose.model<IMenu>('Menu', MenuSchema);

export default Menu;