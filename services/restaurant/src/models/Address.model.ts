import mongoose, { Schema, Document } from "mongoose";


export interface IAddress extends Document {
    userId: string;
    mobile: string;

    formattedAddress: string;

    location: {
        type: 'Point',
        coordinates: [number, number]
    }
    createdAt: Date;
    updatedAt: Date;
}

const AddressSchema: Schema = new Schema({
    userId: { type: String, required: true },
    mobile: { type: String, required: true },
    formattedAddress: { type: String, required: true },
    location: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true }
    }
}, { timestamps: true });

AddressSchema.index({ location: '2dsphere' });

export default mongoose.model<IAddress>('Address', AddressSchema);


