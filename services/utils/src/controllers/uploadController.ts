import { TryCatch } from "../middlewares/trycatch.js";
import cloudinary from 'cloudinary';


export const uploadToCloudinary = TryCatch(async (req, res) => {
    const { buffer } = req.body;
    const cloud = await cloudinary.v2.uploader.upload(buffer);

    res.json({
        url: cloud.secure_url
    })
});

