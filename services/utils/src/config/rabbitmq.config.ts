import amqplib from "amqplib";


let channel: amqplib.Channel | null = null;

export const connectToRabbitMq = async () => {
    const connection = await amqplib.connect(process.env.RABBITMQ_URL!);

    channel = await connection.createChannel();

    await channel.assertQueue(process.env.PAYMENT_QUEUE!, {
        durable: true
    });


    console.log("Connected to Utils RabbitMQ 🐇🐇🐇");
}


export const getChannel= ()=> channel 