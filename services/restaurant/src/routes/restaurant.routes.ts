import express from "express";
import { isAuth, isSeller } from "../middlewares/auth.js";
import { addRestaurant, deleteRestaurant, fetchMyRestaurant, fetchSingleRestaurant, getNearByRestaurants, updateRestaurant, updateStatusofRestaurant } from "../controllers/restaurant.controller.js";
import uploadFile from "../middlewares/multer.js";

const router = express.Router();



router.post("/create-restaurant", isAuth, isSeller, uploadFile, addRestaurant);

router.get("/my-restaurant", isAuth, isSeller, fetchMyRestaurant);

router.put("/update-restaurant", isAuth, isSeller, uploadFile, updateRestaurant);

router.delete("/delete-restaurant", isAuth, isSeller, deleteRestaurant);

router.put("/update-status", isAuth, isSeller, updateStatusofRestaurant);

router.get("/nearby-restaurants", isAuth, getNearByRestaurants);

router.get("/search-restaurant/:id", isAuth, fetchSingleRestaurant)

export default router;