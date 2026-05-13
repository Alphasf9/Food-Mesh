import express from 'express';
import { isAuth } from '../middlewares/auth.js';
import { addAddress, deleteAddress, editAddress, getAddresses } from '../controllers/address.controller.js';

const router = express.Router();



router.post("/add-address", isAuth, addAddress);

router.put("/edit-address/:addressId", isAuth, editAddress);

router.get("/get-addresses", isAuth, getAddresses);

router.delete("/delete-address/:addressId", isAuth, deleteAddress);



export default router;