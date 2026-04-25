import express from "express";
import { isAuth, isSeller } from "../middlewares/auth.js";
import { addRestaurant, fetchMyRestaurant, updateRestaurant } from "../controllers/restaurant.controller.js";
import uploadFile from "../middlewares/multer.js";

const router = express.Router();



router.post("/create-restaurant", isAuth, isSeller, uploadFile,addRestaurant);

router.get("/my-restaurant", isAuth, isSeller, fetchMyRestaurant);

router.put("/update-restaurant", isAuth, isSeller, updateRestaurant);





export default router;