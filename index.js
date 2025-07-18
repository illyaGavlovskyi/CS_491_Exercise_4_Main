const express = require('express');
const path = require('path');
const app = express();

// Use port 8000 or the one set in environment
const PORT = process.env.PORT || 8000;

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Route for base URL - send index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Four-in-a-Row app is running at http://localhost:${PORT}`);
});
