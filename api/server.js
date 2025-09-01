const express = require('express');
const app = express();
const PORT = 8080;

// Middleware to parse JSON
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({
    message: 'Test route is working!',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to  the Tech2Gether API',
    version: '1.0.0'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
