import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { IUser, User } from '../model/User.js';



export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}

export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        const token =
            req.cookies.token ||
            (authHeader?.startsWith("Bearer ")
                ? authHeader.split(" ")[1]
                : null);

        if (!token) {
             res.status(401).json({
                success: false,
                message: "Unauthorized - No token"
            });
            return
        }
        console.log("token:", token);

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

        if (!decoded?.id) {
             res.status(401).json({
                success: false,
                message: "Unauthorized - Invalid token"
            });
            return
        }

        console.log("decoded:", decoded);

        const user = await User.findById(decoded.id);

        if (!user) {
             res.status(401).json({
                success: false,
                message: "User not found"
            });
            return

        }

        req.user = user;
        next();

    } catch (error) {
         res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
        return
    }
};