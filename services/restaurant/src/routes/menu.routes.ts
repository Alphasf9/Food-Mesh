import express from 'express'
import { isAuth, isSeller } from '../middlewares/auth.js';
import { addMenuItems, deleteMenuItem, editMenuItem, getAllMenuItems, toggleMenuItemAvailability } from '../controllers/menu.controller.js';
import uploadFile from '../middlewares/multer.js';

const router = express.Router();


router.post("/add-menu-items", isAuth, isSeller, uploadFile, addMenuItems)

router.get("/get-all-menu-items/:id", isAuth, getAllMenuItems)

router.delete("/delete-menu-item/:id", isAuth, isSeller, deleteMenuItem)

router.patch("/toggle-availability/:id", isAuth, isSeller, toggleMenuItemAvailability)

router.patch("/edit-menu-item/:id", isAuth, isSeller, uploadFile, editMenuItem);


export default router;