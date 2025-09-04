const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const root = '/api';

// Middleware to parse JSON
app.use(express.json());



// Test route
app.get(`${root}/test`, (req, res) => {
  res.json({
    message: 'Test route is working!',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

// Root route
app.get(`${root}/`, (req, res) => {
  res.json({
    message: 'Welcome to  the Tech2Gether API',
    version: '1.0.0'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
