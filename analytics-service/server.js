const express = require('express');
const { Kafka } = require('kafkajs');

const app = express();
const port = 6000;

const orderAnalytics = [];

const kafkaBrokers = process.env.KAFKA_BROKERS || 'kafka:29092';
const kafka = new Kafka({
  clientId: 'analytics-service',
  brokers: [kafkaBrokers]
});
const consumer = kafka.consumer({ groupId: 'analytics-group' });

async function runConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'order.created', fromBeginning: true });
  console.log('Analytics Service subscribed to Kafka topic: order.created');
  
  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());
      console.log('Analytics Service received event:', event);
      orderAnalytics.push(event);
    }
  });
}

runConsumer().catch(console.error);

app.get('/analytics/orders', (req, res) => {
  const distinctUsers = new Set(orderAnalytics.map(o => o.userId)).size;
  const totalOrders = orderAnalytics.length;
  const totalValue = orderAnalytics.reduce((sum, order) => sum + order.amount, 0);
  const averageValue = totalOrders ? (totalValue / totalOrders) : 0;

  res.json({
    distinctUsers,
    totalOrders,
    totalValue,
    averageValue: Number(averageValue.toFixed(2)),
    orders: orderAnalytics 
  });
});

app.listen(port, () => {
  console.log(`Analytics Service running on port ${port}`);
});
