import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Button, Table, Alert, Nav, Card } from 'react-bootstrap';

function App() {
  const [token, setToken] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [registerName, setRegisterName] = useState('');
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [message, setMessage] = useState('');

  const login = async () => {
    try {
      const res = await axios.post('http://localhost:3000/login', { username: 'test', password: 'test' });
      setToken(res.data.token);
      setMessage('Logged in successfully.');
    } catch (err) {
      console.error(err);
      setMessage('Login failed');
    }
  };

  const register = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/register', { name: registerName });
      setMessage(`User registered: ${res.data.user.name}`);
      setRegisterName('');
      fetchOrders();
      fetchAnalytics();
    } catch (err) {
      console.error(err);
      setMessage('Registration failed');
    }
  };

  const fetchUserData = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/user', { headers: { Authorization: token } });
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/order', { headers: { Authorization: token } });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/analytics', { headers: { Authorization: token } });
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserData();
      fetchOrders();
      fetchAnalytics();
    }
  }, [token]);

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h1>Microservices Dashboard</h1>
          {message && <Alert variant="info">{message}</Alert>}
          {!token ? (
            <div>
              <Button variant="primary" onClick={login}>Login</Button>
            </div>
          ) : (
            <div>
              <Nav variant="tabs" activeKey={activeTab} onSelect={(selectedKey) => setActiveTab(selectedKey)}>
                <Nav.Item>
                  <Nav.Link eventKey="home">Home</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="register">Register User</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="orders">Orders</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="analytics">Analytics</Nav.Link>
                </Nav.Item>
              </Nav>

              {activeTab === 'home' && (
                <div className="mt-3">
                  <h3>Welcome {user ? user.name : 'User'}!</h3>
                  <p>
                    Use the tabs above to register new users, view orders, and see analytics.
                  </p>
                </div>
              )}

              {activeTab === 'register' && (
                <div className="mt-3">
                  <h3>Register a New User</h3>
                  <Form onSubmit={register}>
                    <Form.Group controlId="formName">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter user name"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        required
                      />
                    </Form.Group>
                    <Button variant="success" type="submit" className="mt-2">Register</Button>
                  </Form>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="mt-3">
                  <h3>Orders</h3>
                  {orders.length === 0 ? (
                    <p>No orders found.</p>
                  ) : (
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>User ID</th>
                          <th>Item</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.userId}</td>
                            <td>{order.item}</td>
                            <td>{order.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="mt-3">
                  <h3>Order Analytics Summary</h3>
                  {analytics ? (
                    <Card>
                      <Card.Body>
                        <Row>
                          <Col><strong>Distinct Users:</strong> {analytics.distinctUsers}</Col>
                          <Col><strong>Total Orders:</strong> {analytics.totalOrders}</Col>
                        </Row>
                        <Row className="mt-3">
                          <Col><strong>Total Value:</strong> ${analytics.totalValue}</Col>
                          <Col><strong>Average Value:</strong> ${analytics.averageValue}</Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ) : (
                    <p>No analytics data available.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default App;
