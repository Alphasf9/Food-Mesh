import mongoose, { Document, Schema } from "mongoose";



export interface IUser extends Document {
    name: string;
    email: string;
    role: string;
    image: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}


const schema: Schema<IUser> = new Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    role: {
        type: String,
        default: null
    },

    image: {
        type: String,
    }
}, { timestamps: true });


export const User = mongoose.model<IUser>("User", schema);