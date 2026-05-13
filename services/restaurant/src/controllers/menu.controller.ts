import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { TryCatch } from "../middlewares/trycatch.js";
import Restaurant from "../models/Restaurant.js";
import Menu from "../models/Menu.model.js";

export const addMenuItems = TryCatch(async (req: AuthenticatedRequest, res) => {
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

    const { name, description, price } = req.body;

    if (!name || !description || !price) {
        return res.status(400).json({
            success: false,
            message: "Please provide all the required fields"
        });
    }


    const file = req.file;
    if (!file) {
        return res.status(400).json({
            success: false,
            message: "Image is required"
        });
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer?.content) {
        return res.status(400).json({
            success: false,
            message: "Failed to create file buffer"
        });
    }

    const { data: uploadResult } = await axios.post(`${process.env.UPLOAD_SERVICE_URL}/upload`, {
        buffer: fileBuffer.content,
    });

    const menuItems = await Menu.create({
        name,
        description,
        price,
        restaurantId: restaurant._id,
        image: uploadResult.url,
        isAvailable: true
    });

    if (!menuItems) {
        return res.status(400).json({
            success: false,
            message: "Failed to create menu item"
        });
    }

    return res.status(201).json({
        success: true,
        message: "Menu item created successfully",
        menuItems
    });
})


export const getAllMenuItems = TryCatch(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(401).json({
            success: false,
            message: "Id is required"
        });
    };

    const items = await Menu.find({ restaurantId: id });

    if (!items) {
        return res.status(404).json({
            success: false,
            message: "Menu items not found"
        });
    }

    return res.status(200).json({
        success: true,
        message: "Menu items retrieved successfully",
        items
    });
});



export const deleteMenuItem = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ success: false, message: "Please login to access this route" });
    }

    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ success: false, message: "Id is required" });
    }

    const item = await Menu.findById(id);
    if (!item) {
        return res.status(404).json({ success: false, message: "Menu item not found" });
    }

    const restaurant = await Restaurant.findOne({
        _id: item.restaurantId,
        ownerId: user._id
    });
    if (!restaurant) {
        return res.status(403).json({ success: false, message: "Unauthorized - you don't own this restaurant" });
    }

    await Menu.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: "Menu item deleted successfully" });
});


export const toggleMenuItemAvailability = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ success: false, message: "Please login to access this route" });
    }

    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ success: false, message: "Id is required" });
    }

    const item = await Menu.findById(id);
    if (!item) {
        return res.status(404).json({ success: false, message: "Menu item not found" });
    }

    const restaurant = await Restaurant.findOne({
        _id: item.restaurantId,
        ownerId: user._id
    });

    if (!restaurant) {
        return res.status(403).json({ success: false, message: "Unauthorized - you don't own this restaurant" });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    return res.status(200).json({ success: true, message: "Menu item availability toggled successfully" });
})


export const editMenuItem = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ success: false, message: "Please login to access this route" });
    }

    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ success: false, message: "Id is required" });
    }

    const item = await Menu.findById(id);
    if (!item) {
        return res.status(404).json({ success: false, message: "Menu item not found" });
    }

    const restaurant = await Restaurant.findOne({
        _id: item.restaurantId,
        ownerId: user._id
    });
    if (!restaurant) {
        return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { name, description, price } = req.body;
    if (!name || !description || !price) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    let imageUrl = item.image!; 

    const file = req.file;
    if (file) {
        
        const fileBuffer = getBuffer(file);
        if (!fileBuffer?.content) {
            return res.status(400).json({ success: false, message: "Failed to create file buffer" });
        }
        const { data: uploadResult } = await axios.post(`${process.env.UPLOAD_SERVICE_URL}/upload`, {
            buffer: fileBuffer.content,
        });
        imageUrl = uploadResult.url;
    }

    item.name = name;
    item.description = description;
    item.price = price;
    item.image = imageUrl; 
    await item.save();

    return res.status(200).json({ success: true, message: "Menu item updated successfully", item });
});