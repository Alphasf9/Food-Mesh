import { AuthenticatedRequest } from "../middlewares/auth.js";
import { TryCatch } from "../middlewares/trycatch.js";
import AddressModel from "../models/Address.model.js";



export const addAddress = TryCatch(async (req: AuthenticatedRequest, res) => {

    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }


    const { mobile, formattedAddress, latitude, longitude } = req.body;

    if (!mobile || !formattedAddress || !latitude || !longitude) {
        return res.status(400).json({ message: "All fields are required" });
    }


    const newAddress = await AddressModel.create({
        userId: user._id,
        mobile,
        formattedAddress,
        location: {
            type: 'Point',
            coordinates: [Number(latitude), Number(longitude)]
        },
    });


    res.status(201).json({
        message: "Address added successfully",
        address: newAddress
    });

})



export const deleteAddress = TryCatch(async (req: AuthenticatedRequest, res) => {

    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { addressId } = req.params;

    if (!addressId) {
        return res.status(400).json({ message: "Address ID is required" });
    }

    const address = await AddressModel.findOne({ _id: addressId, userId: user._id });

    if (!address) {
        return res.status(404).json({ message: "Address not found" });
    }

    await address.deleteOne();

    res.status(200).json({
        message: "Address deleted successfully"
    });
})



export const getAddresses = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const addresses = await AddressModel.find({ userId: user._id }).sort({ createdAt: -1 });

    res.status(200).json({
        message: "Addresses retrieved successfully",
        addresses
    });
});



export const editAddress = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { addressId } = req.params;

    if (!addressId) {
        return res.status(400).json({ message: "Address ID is required" });
    }

    const address = await AddressModel.findOne({ _id: addressId, userId: user._id });

    if (!address) {
        return res.status(404).json({ message: "Address not found" });
    }

    const { mobile, formattedAddress, latitude, longitude } = req.body;

    if (mobile) address.mobile = mobile;
    if (formattedAddress) address.formattedAddress = formattedAddress;

    if (latitude && longitude) {
        address.location = {
            type: 'Point',
            coordinates: [Number(latitude), Number(longitude)]
        }
    }

    await address.save();

    res.status(200).json({
        message: "Address updated successfully",
        address
    });
})


