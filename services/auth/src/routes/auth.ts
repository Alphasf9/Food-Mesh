import express from 'express';
import { addUserRole, loginUser, logout, myProfile } from '../controllers/auth.js';
import { isAuth } from '../middlewares/isAuth.js';

const router = express.Router();

router.post('/login', loginUser)

router.post('/logout', isAuth, logout)

router.put('/add-role', isAuth, addUserRole)

router.get('/my-user',isAuth,myProfile)


export default router;