import express from "express";
import morgan from "morgan";
import cors from 'cors'
import cloudinary from "cloudinary";
import uploadRoutes from "./routes/cloudinary.js";
import dotenv from "dotenv";
dotenv.config();




const app = express();



app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(morgan("combined"));
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

const {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET
} = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Missing Cloudinary environment variables");
}

cloudinary.v2.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

const PORT2 = process.env.PORT2 || 8002;
app.use("/api/v1/media", uploadRoutes);


const startUploadServer = async () => {
    try {

        app.listen(PORT2, () => {
            console.log(`upload  service is running on port ${PORT2}`);
        });

    } catch (error) {
        console.error("Failed to connect DB", error);
        process.exit(1);
    }
};

startUploadServer();


