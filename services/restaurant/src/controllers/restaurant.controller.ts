import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import jwt from 'jsonwebtoken';
import { TryCatch } from "../middlewares/trycatch.js";
import Restaurant from "../models/Restaurant.js";



export const addRestaurant = TryCatch(async (req: AuthenticatedRequest, res) => {

    const user = req.user;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    const existingRestaurant = await Restaurant.findOne({
        ownerId: user._id
    });

    if (existingRestaurant) {
        return res.status(400).json({
            success: false,
            message: "You already have a restaurant"
        });
    }

    const { name, description, latitude, longitude, formattedAddress, phone } = req.body;

    if (!name || !description || !latitude || !longitude || !formattedAddress || !phone) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    };

    const file = req.file;
    if (!file) {
        return res.status(400).json({
            success: false,
            message: "Image is required"
        });
    }

    const fileBuffer = getBuffer(file.path);

    if (!fileBuffer?.content) {
        return res.status(400).json({
            success: false,
            message: "Failed to create file buffer"
        });
    }

    const { data: uploadResult } = await axios.post(`${process.env.UPLOAD_SERVICE_URL}/upload`, {
        buffer: fileBuffer.content,
    })

    const newRestaurant = await Restaurant.create({
        name,
        description,
        address: formattedAddress,
        phone,
        image: uploadResult.url,
        ownerId: user._id,
        autoLocation: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
            formattedAddress
        }
    });


    return res.status(201).json({
        success: true,
        message: "Restaurant created successfully",
        restaurant: newRestaurant
    });


})



export const fetchMyRestaurant = TryCatch(async (req: AuthenticatedRequest, res) => {


    const user = req.user;



    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Please login to access this route"
        });
    }

    const restaurant = await Restaurant.findOne({ ownerId: user._id });

    if (!restaurant) {
        return res.status(404).json({
            success: false,
            message: "Restaurant not found"
        });
    }

    if (!user.restaurantId) {
        const token = jwt.sign({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            restaurantId: restaurant._id
        }, process.env.JWT_SECRET as string, {
            expiresIn: "7d"
        });

        return res.status(200).json({
            success: true,
            restaurant,
            token
        })
    }

    res.status(200).json({
        success: true,
        restaurant
    });
})



export const updateRestaurant = TryCatch(async (req: AuthenticatedRequest, res) => {

    const user = req.user;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Please login to access this route"
        });
    }

    const restaurant = await Restaurant.findOne({ ownerId: user._id });

    if (!restaurant) {
        return res.status(404).json({
            success: false,
            message: "Restaurant not found"
        });
    }

    const { name, description, latitude, longitude, formattedAddress, phone } = req.body;

    if (!name || !description || !latitude || !longitude || !formattedAddress || !phone) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    };

    const file = req.file;
    if (!file) {
        return res.status(400).json({
            success: false,
            message: "Image is required"
        });
    }

    const fileBuffer = getBuffer(file.path);

    if (!fileBuffer?.content) {
        return res.status(400).json({
            success: false,
            message: "Failed to create file buffer"
        });
    }

    const { data: uploadResult } = await axios.post(`${process.env.UPLOAD_SERVICE_URL}/upload`, {
        buffer: fileBuffer.content,
    })

    await Restaurant.findByIdAndUpdate(restaurant._id, {
        name,
        description,
        address: formattedAddress,
        phone,
        image: uploadResult.url,
        autoLocation: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
            formattedAddress
        }
    });

    return res.status(200).json({
        success: true,
        message: "Restaurant updated successfully"
    })

})



// export const deleteRestaurant = TryCatch(async (req: AuthenticatedRequest, res) => {

//     const user = req.user;

//     if (!user) {
//         return res.status(401).json({
//             success: false,
//             message: "Please login to access this route"
//         });
//     }

//     const restaurant = await Restaurant.findOne({ ownerId: user._id });

//     if (!restaurant) {
//         return res.status(404).json({
//             success: false,
//             message: "Restaurant not found"
//         });
//     }

//     await Restaurant.findByIdAndDelete(restaurant._id);

//     return res.status(200).json({
//         success: true,
//         message: "Restaurant deleted successfully"
//     })
// })