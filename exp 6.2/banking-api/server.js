const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(bodyParser.json());

const SECRET_KEY = 'super_secure_jwt_secret';

// Hardcoded user credentials
const user = { username: 'customer1', password: bcrypt.hashSync('bank123', 8) };

// Dummy account (in place of a database)
let account = { balance: 1000 };

// Login route – returns a JWT token
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === user.username && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    return res.json({ message: 'Login successful', token });
  }
  res.status(401).json({ error: 'Invalid username or password' });
});

// JWT middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });

  jwt.verify(token, SECRET_KEY, (err, userData) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = userData;
    next();
  });
}

// Protected route: Check balance
app.get('/balance', authenticateToken, (req, res) => {
  res.json({ balance: account.balance });
});

// Protected route: Deposit money
app.post('/deposit', authenticateToken, (req, res) => {
  const { amount } = req.body;
  if (amount <= 0) return res.status(400).json({ error: 'Deposit amount must be positive' });
  account.balance += amount;
  res.json({ message: `Deposited ₹${amount}`, new_balance: account.balance });
});

// Protected route: Withdraw money
app.post('/withdraw', authenticateToken, (req, res) => {
  const { amount } = req.body;
  if (amount <= 0) return res.status(400).json({ error: 'Withdrawal amount must be positive' });
  if (amount > account.balance) return res.status(400).json({ error: 'Insufficient balance' });
  account.balance -= amount;
  res.json({ message: `Withdrew ₹${amount}`, new_balance: account.balance });
});

// Start the server
const PORT = 4000;
app.listen(PORT, () => console.log(`Banking API running on port ${PORT}`));
