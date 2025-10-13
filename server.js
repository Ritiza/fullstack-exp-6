// Experiment 16 - Middleware Implementation
const express = require('express');
const morgan = require('morgan');
const app = express();
const PORT = 3000;

// ================================
// 1️⃣ Application-level Middleware (Logging)
// ================================
app.use(morgan('tiny')); // Logs HTTP requests in concise format

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next(); // Pass control to the next middleware/route
});

// ================================
// 2️⃣ Authentication Middleware (Bearer Token)
// ================================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing or incorrect' });
  }

  // Expect header format: "Bearer mysecrettoken"
  const token = authHeader.split(' ')[1];

  if (token !== 'mysecrettoken') {
    return res.status(403).json({ message: 'Invalid token' });
  }

  next(); // Valid token → proceed to protected route
}

// ================================
// 3️⃣ Routes
// ================================

// Public route (no token required)
app.get('/public', (req, res) => {
  res.status(200).send('This is a public route. No authentication required.');
});

// Protected route (requires token)
app.get('/protected', authenticateToken, (req, res) => {
  res.status(200).send('You have accessed a protected route with a valid Bearer token!');
});

// ================================
// 4️⃣ Start the Server
// ================================
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
