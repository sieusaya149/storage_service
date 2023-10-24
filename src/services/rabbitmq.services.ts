import {rabbitMqUri} from '../config';
import Logger from '../helpers/Logger';
import amqp from 'amqplib';
import CloudFileRepo from '~/database/repository/CloudFileRepo';

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

    static consumer = async (exchangeName: string, queueName: string) => {
        if (!rabbitMqUri) {
            throw new Error('Invalid rabbitmq url');
        }
        const connection = await amqp.connect(rabbitMqUri);
        const channel = await connection.createChannel();
        const queue = await channel.assertQueue(queueName);
        console.log(
            `bind the queue ${queue.queue} to exchange ${exchangeName} with queueName ${queueName}`
        );
        channel.bindQueue(queue.queue, exchangeName, queueName);

        channel.consume(queue.queue, async (message) => {
            if (message !== null) {
                const notifyContent = JSON.parse(message.content.toString());
                if (!notifyContent.type) {
                    throw new Error('Missing type notify');
                }
                if (notifyContent.task.type == 'UPLOAD') {
                    CloudFileRepo.createByNotify(notifyContent);
                }
                if (notifyContent.task.type == 'DELETE') {
                    CloudFileRepo.deleteByNotify(notifyContent);
                }
                // Acknowledge the message when receiving message is complete.
                channel.ack(message);
            }
        });
    };
}
