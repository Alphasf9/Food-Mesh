import { Request, RequestHandler, Response, NextFunction } from 'express';

export const TryCatch = (handler: RequestHandler): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await handler(req, res, next);
        } catch (error: any) {
            console.error("Error in TryCatch middleware", error);
            res.status(500).json({
                success: false,
                message: "An unexpected error occurred" + error.message ? `: ${error.message}` : "",
            });
        }
    };
}