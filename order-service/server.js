const express = require('express');
const amqp = require('amqplib');
const { Kafka } = require('kafkajs');

const app = express();
app.use(express.json());

const orders = [];

const kafkaBrokers = process.env.KAFKA_BROKERS || 'kafka:29092';
const kafka = new Kafka({
  clientId: 'order-service',
  brokers: [kafkaBrokers]
});
const producer = kafka.producer();

async function produceOrderCreatedEvent(order) {
  try {
    await producer.connect();
    await producer.send({
      topic: 'order.created',
      messages: [{ value: JSON.stringify(order) }]
    });
    console.log('Produced order.created event to Kafka:', order);
    await producer.disconnect();
  } catch (error) {
    console.error('Error producing Kafka event:', error);
  }
}

async function subscribeToUserRegistered() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq');
    const channel = await connection.createChannel();
    const queue = 'user.registered';
    await channel.assertQueue(queue, { durable: true });
    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const event = JSON.parse(msg.content.toString());
        console.log('Order Service received user.registered event:', event);
        const randomValue = Math.floor(Math.random() * (500 - 50 + 1)) + 50;
        const order = {
          id: orders.length + 1,
          userId: event.id,
          item: 'Welcome Package',
          amount: randomValue
        };
        orders.push(order);
        await produceOrderCreatedEvent(order);
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error('Error subscribing to user.registered events:', error);
  }
}

subscribeToUserRegistered();

app.get('/order', (req, res) => {
  res.json(orders);
});

app.listen(5000, () => {
  console.log('Order Service running on port 5000');
});
