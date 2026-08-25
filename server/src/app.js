const express = require('express');
const cors = require('cors');

const ApiResponse = require('./utils/ApiResponse');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  return ApiResponse.ok(res, 'TaskFlow API is running', {
    app: 'TaskFlow API',
    version: '1.0.0',
    status: 'running',
  });
});

app.get('/api/health', (req, res) => {
  return ApiResponse.ok(res, 'TaskFlow server is running', {
    status: 'ok',
  });
});

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Catch-all for 404 routes
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
