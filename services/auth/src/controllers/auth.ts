import { User } from "../model/User.js";
import jwt from "jsonwebtoken";
import { TryCatch } from "../middlewares/trycatch.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { oauth2client } from "../config/googleConfig.js";
import axios from 'axios';



export const loginUser = TryCatch(async (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({
            success: false,
            message: "Authorization code is required"
        });
    }
    const googleRes= await oauth2client.getToken(code);

    oauth2client.setCredentials(googleRes.tokens);
    const userRes= await axios.get(`https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`)

  
    const { email, name, picture } = userRes.data;

    let user = await User.findOne({ email });
    if (!user) {
        user = await User.create({
            email,
            name,
            image: picture
        })
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: "7d" });

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })


    res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user
    });
});


const allowedRoles = ["customer", "rider", "seller"] as const;
type Role = (typeof allowedRoles)[number];

export const addUserRole = TryCatch(async (req: AuthenticatedRequest, res) => {
    if (!req.user?._id) {
        res.status(401).json({
            success: false,
            message: "Unauthorized because req.user.id is missing"
        });
        return;
    }

    const { role } = req.body as { role: Role };

    if (!allowedRoles.includes(role)) {
        res.status(400).json({
            success: false,
            message: "Invalid role provided. Allowed roles are: customer, rider, seller"
        });
        return;
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        role
    },
        {
            new: true,
        }
    )

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: "7d" });

    res.status(200).json({
        success: true,
        message: "Role added successfully",
        token,
        user
    });
})


export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    res.json({
        success: true,
        user
    })
})