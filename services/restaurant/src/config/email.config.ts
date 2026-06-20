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
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f1f1;">
                    <strong>${item.name}</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f1f1; text-align: center; color: #666;">
                    ${item.quantity}
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f1f1; text-align: right; font-weight: 600;">
                    ₹${item.price * item.quantity}
                </td>
            </tr>
        `)
        .join("");

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmed - FoodMesh</title>
    </head>
    <body style="margin:0; padding:0; background:#f8f9fa; font-family: 'Segoe UI', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #f97316, #fb923c); padding: 35px 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">FoodMesh</h1>
                <p style="color: rgba(255,255,255,0.95); margin: 8px 0 0 0; font-size: 17px;">Order Confirmed</p>
            </div>

            <!-- Success Message -->
            <div style="padding: 40px 30px 10px; text-align: center;">
                <div style="width: 70px; height: 70px; background: #dcfce7; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 40px;">🎉</span>
                </div>
                <h2 style="margin: 0; color: #166534; font-size: 24px;">Thank You!</h2>
                <p style="color: #4b5563; margin: 12px 0 0 0; font-size: 16px;">
                    Your order from <strong>${restaurantName}</strong> has been confirmed.
                </p>
            </div>

            <!-- Order Info -->
            <div style="padding: 0 30px 30px;">
                <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <p style="margin:0; color:#64748b; font-size:14px;">Order ID</p>
                            <p style="margin:4px 0 0 0; font-weight:600; color:#1e2937;">#${orderId}</p>
                        </div>
                        <div style="text-align:right;">
                            <p style="margin:0; color:#64748b; font-size:14px;">Order Date</p>
                            <p style="margin:4px 0 0 0; font-weight:500;">${new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })}</p>
                        </div>
                    </div>
                </div>

                <!-- Items -->
                <h3 style="margin: 0 0 15px 0; color: #1e2937;">Your Order</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                    <thead>
                        <tr style="background: #f8fafc;">
                            <th style="text-align:left; padding:12px 0; font-weight:500; color:#64748b;">Item</th>
                            <th style="text-align:center; padding:12px 0; font-weight:500; color:#64748b;">Qty</th>
                            <th style="text-align:right; padding:12px 0; font-weight:500; color:#64748b;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsList}
                    </tbody>
                </table>

                <!-- Price Breakdown -->
                <div style="background: #f8fafc; padding: 20px; border-radius: 12px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #64748b;">Subtotal</span>
                        <span>₹${subtotal}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #64748b;">Delivery Fee</span>
                        <span style="color: ${deliveryFee === 0 ? '#16a34a' : '#1e2937'}">
                            ${deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                        </span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #64748b;">Platform Fee</span>
                        <span>₹${platformFee}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #64748b;">GST (5%)</span>
                        <span>₹${Math.round(subtotal * 0.05)}</span>
                    </div>
                    
                    <div style="border-top: 2px solid #e2e8f0; margin: 15px 0; padding-top: 15px;">
                        <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700;">
                            <span>Total Amount</span>
                            <span style="color: #f97316;">₹${totalAmount}</span>
                        </div>
                    </div>
                </div>

                <!-- Delivery Address -->
                <div style="margin-top: 25px;">
                    <h3 style="margin: 0 0 10px 0; color: #1e2937;">Delivery Address</h3>
                    <div style="background: #f8fafc; padding: 18px; border-radius: 12px; line-height: 1.6;">
                        ${deliveryAddress}
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div style="background: #f1f5f9; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #64748b; font-size: 14px;">
                    Thank you for choosing <strong>FoodMesh</strong> ❤️
                </p>
                <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 13px;">
                    Fresh • Fast • Reliable
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    const transporter = getTransporter();

    await transporter.sendMail({
        from: `"FoodMesh" <${process.env.NODEMAILER_EMAIL}>`,
        to: toEmail,
        subject: `✅ Order Confirmed! #${orderId} - ${restaurantName}`,
        html: html,
    });
};
