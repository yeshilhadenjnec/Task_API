
require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Display frontend home page
app.use(express.static(path.join(__dirname, 'frontend')));

// Task API routes
const taskRoutes = require('./src/routes/taskRoutes');
app.use('/tasks', taskRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);

    res.status(err.statusCode || 500).json({
        error: err.message || 'Internal Server Error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});