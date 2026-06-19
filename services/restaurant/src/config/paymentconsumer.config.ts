import CartModel from "../models/Cart.model.js";
import OrderModel from "../models/Order.model.js";
import { sendOrderConfirmationEmail } from "./email.config.js";
import { getChannel } from "./rabbitmq.config.js";



export const startPaymentConsumer = async () => {
    const channel = getChannel();

    channel?.consume(process.env.PAYMENT_QUEUE!, async (msg) => {
        if (!msg) {
            return;
        }

        try {
            const event = JSON.parse(msg.content.toString());

            if (event.type !== "PAYMENT_SUCCESS") {
                channel.ack(msg);
                return;
            }

            const { orderId, paymentId } = event.payload;

            const order = await OrderModel.findOneAndUpdate(
                {
                    _id: orderId,
                    paymentStatus: { $ne: "paid" }
                },
                {
                    $set: {
                        paymentStatus: "paid",
                        paymentId: paymentId,
                        status: "placed"
                    },
                    $unset: {
                        expiredAt: 1
                    }
                },
                {
                    new: true
                }
            );

            if (!order) {
                channel.ack(msg);
                return;
            }

            // console.log("✅✅✅Order Placed", order._id);

            await CartModel.deleteMany({ userId: order.userId });

           
            try {
                await sendOrderConfirmationEmail({
                    toEmail: order.userEmail,
                    orderId: order._id.toString(),
                    restaurantName: order.restaurantName,
                    items: order.items,
                    subtotal: order.subtotal,
                    deliveryFee: order.deliveryFee,
                    platformFee: order.platformFee,
                    totalAmount: order.totalAmount,
                    deliveryAddress: order.deliveryAddress.formattedAddress
                });
                console.log("📧 Confirmation email sent to:", order.userEmail);
            } catch (emailError) {
                console.error("Failed to send email:", emailError);
                // order already placed — email failure doesn't break anything
            }

            channel.ack(msg);

        } catch (error) {
            console.error("Error processing payment event in restaurant:", error);
            channel?.ack(msg);
        }
    });
}