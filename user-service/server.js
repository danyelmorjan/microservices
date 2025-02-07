const express = require('express');
const amqp = require('amqplib');

const app = express();
app.use(express.json());

const users = [];

async function publishUserRegistered(user) {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq');
    const channel = await connection.createChannel();
    const queue = 'user.registered';
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(user)), { persistent: true });
    console.log('Published user.registered event:', user);
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error('Error publishing user.registered event:', error);
  }
}

app.post('/register', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const user = { id: users.length + 1, name };
  users.push(user);
  await publishUserRegistered(user);
  res.json({ message: 'User registered', user });
});

app.get('/user', (req, res) => {
  res.json({ id: 1, name: 'Test User from User-Service' });
});

app.listen(4000, () => {
  console.log('User Service running on port 4000');
});
