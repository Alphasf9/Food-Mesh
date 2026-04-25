import express from 'express';
import { uploadToCloudinary } from '../controllers/uploadController.js';
const router = express.Router();

router.post('/upload', uploadToCloudinary);

export default router;