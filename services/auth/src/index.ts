import express from "express";
import morgan from "morgan";
import cors from 'cors'
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
dotenv.config();
import authRoutes from "./routes/auth.js";


const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(morgan("combined"));
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use("/api/v1/auth", authRoutes);
const PORT = process.env.PORT || 8000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Auth service is running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Failed to connect DB", error);
        process.exit(1);
    }
};

startServer();