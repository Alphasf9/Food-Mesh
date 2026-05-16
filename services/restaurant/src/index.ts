import express from "express";
import cors from 'cors'
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();
import { connectRestaurantDB } from "./config/db.js";
import restaurantRoutes from "./routes/restaurant.routes.js";
import menuRoutes from "./routes/menu.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import addressRoutes from "./routes/address.routes.js";



const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

const PORT1 = process.env.PORT1 || 8000;

app.use("/api/v1/restaurants", restaurantRoutes);
app.use("/api/v1/menu", menuRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/address", addressRoutes);



const startRestaurantServer = async () => {
    try {
        await connectRestaurantDB();

        app.listen(PORT1, () => {
            console.log(`Restaurant service is running on port ${PORT1}`);
        });

    } catch (error) {
        console.error("Failed to connect DB", error);
        process.exit(1);
    }
};

startRestaurantServer();


