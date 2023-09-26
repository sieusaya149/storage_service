import {rabbitMqUri} from '../config';
import Logger from '../helpers/Logger';
import amqp from 'amqplib';

export default class RabbitMqServices {
    static publishMessage = async function (
        message: string,
        exchangeName: string,
        routingKey: string,
        typeExchange = 'direct'
    ) {
        // Create a RabbitMQ connection within the scope of this function.
        if (!rabbitMqUri) {
            Logger.error('Please give info connection rabbitmq');
            throw new Error('Please give info connection rabbitmq');
        }
        const connection = await amqp.connect(rabbitMqUri);

        try {
            // Create a channel for this connection.
            const channel = await connection.createChannel();
            // Declare the exchange (you can also declare queues here).
            // Make sure the exchange and queue definitions match your RabbitMQ setup.
            await channel.assertExchange(exchangeName, typeExchange, {
                durable: true
            });

            // Publish the message to the exchange.
            channel.publish(exchangeName, routingKey, Buffer.from(message));

            Logger.info(
                `Message sent to exchange ${exchangeName} with routing key ${routingKey}`
            );

            // Close the channel.
            await channel.close();
        } catch (error) {
            Logger.error('Error publishing message:', error);
        } finally {
            // Close the connection when you're done.
            await connection.close();
        }
    };
}
