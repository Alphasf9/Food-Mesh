import crypto from "crypto";


export const verifyRazorpaySignature = (
    orderId: string,
    paymentId: string,
    signature: string,
)=>{
    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!);
    shasum.update(`${orderId}|${paymentId}`);
    const digest = shasum.digest("hex");
    return digest === signature;
}