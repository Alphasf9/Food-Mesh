import nodemailer from "nodemailer";

const getTransporter = () => {
    const email = process.env.NODEMAILER_EMAIL;
    const password = process.env.NODEMAILER_PASSWORD?.replace(/\s/g, "");

    if (!email || !password) {
        throw new Error("NODEMAILER_EMAIL and NODEMAILER_PASSWORD must be set");
    }

    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: email,
            pass: password
        }
    });
};

interface OrderEmailParams {
    toEmail: string;
    orderId: string;
    restaurantName: string;
    items: { name: string; quantity: number; price: number }[];
    subtotal: number;
    deliveryFee: number;
    platformFee: number;
    totalAmount: number;
    deliveryAddress: string;
}

export const sendOrderConfirmationEmail = async (params: OrderEmailParams) => {
    const {
        toEmail,
        orderId,
        restaurantName,
        items,
        subtotal,
        deliveryFee,
        platformFee,
        totalAmount,
        deliveryAddress
    } = params;

    const itemsList = items
        .map(item => `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">${item.name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #f0f0f0; text-align:center;">${item.quantity}</td>
                <td style="padding: 8px; border-bottom: 1px solid #f0f0f0; text-align:right;">₹${item.price * item.quantity}</td>
            </tr>
        `)
        .join("");

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e0e0e0;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f97316, #f59e0b); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🍔 FoodMesh</h1>
            <p style="color: white; margin: 8px 0 0 0; opacity: 0.9;">Your order is confirmed!</p>
        </div>

        <!-- Body -->
        <div style="padding: 30px;">
            <h2 style="color: #1a1a1a;">Order Confirmed ✅</h2>
            <p style="color: #666;">Thank you for ordering with FoodMesh! Your order from <strong>${restaurantName}</strong> has been placed successfully.</p>

            <!-- Order ID -->
            <div style="background: #f9f9f9; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #666; font-size: 13px;">Order ID</p>
                <p style="margin: 4px 0 0 0; color: #1a1a1a; font-weight: bold; font-size: 14px;">${orderId}</p>
            </div>

            <!-- Items Table -->
            <h3 style="color: #1a1a1a; margin-bottom: 10px;">Items Ordered</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f9f9f9;">
                        <th style="padding: 10px 8px; text-align: left; color: #666; font-size: 13px;">Item</th>
                        <th style="padding: 10px 8px; text-align: center; color: #666; font-size: 13px;">Qty</th>
                        <th style="padding: 10px 8px; text-align: right; color: #666; font-size: 13px;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsList}
                </tbody>
            </table>

            <!-- Price Summary -->
            <div style="margin-top: 20px; border-top: 2px solid #f0f0f0; padding-top: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #666;">Subtotal</span>
                    <span>₹${subtotal}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #666;">Delivery Fee</span>
                    <span style="color: ${deliveryFee === 0 ? '#16a34a' : '#1a1a1a'}">${deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                    <span style="color: #666;">Platform Fee</span>
                    <span>₹${platformFee}</span>
                </div>
                <div style="display: flex; justify-content: space-between; background: #fff7ed; padding: 12px; border-radius: 8px;">
                    <span style="font-weight: bold; color: #1a1a1a;">Total Paid</span>
                    <span style="font-weight: bold; color: #f97316; font-size: 18px;">₹${totalAmount}</span>
                </div>
            </div>

            <!-- Delivery Address -->
            <div style="margin-top: 20px; background: #f9f9f9; border-radius: 8px; padding: 15px;">
                <p style="margin: 0; color: #666; font-size: 13px;">📍 Delivery Address</p>
                <p style="margin: 4px 0 0 0; color: #1a1a1a;">${deliveryAddress}</p>
            </div>
        </div>

        <!-- Footer -->
        <div style="background: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="color: #999; font-size: 13px; margin: 0;">Thank you for ordering with FoodMesh! 🧡</p>
            <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">Fresh • Fast • Delivered</p>
        </div>

    </div>
    `;

    const transporter = getTransporter();

    await transporter.sendMail({
        from: `"FoodMesh" <${process.env.NODEMAILER_EMAIL}>`,
        to: toEmail,
        subject: `✅ Order Confirmed from ${restaurantName}! #${orderId}`,
        html
    });
};
