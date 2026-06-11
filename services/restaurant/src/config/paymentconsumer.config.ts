import OrderModel from "../models/Order.model.js";
import { getChannel } from "./rabbitmq.config.js";



export const startPaymentConsumer = async () => {
    const channel = getChannel();

    channel?.consume(process.env.PAYMENT_QUEUE!, async (msg) => {
        if (!msg) {
            return;
        }

        try {
            const event = JSON.parse(msg.content.toString());
            console.log(event);

            if (event.type !== "PAYMENT_SUCCESS") {
                channel.ack(msg);
                return;
            }

            const { orderId ,paymentId} = event.payload;

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
                        expiresAt: 1
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

            console.log("✅✅✅Order Placed", order._id)

            channel.ack(msg);


        } catch (error) {
            console.error("Error processing payment event in restaurant:", error);
            channel?.ack(msg);
        }
    });
}

