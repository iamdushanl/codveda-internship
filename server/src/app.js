require('dotenv').config();

const express = require('express');
const cors = require('cors');

const ApiResponse = require('./utils/ApiResponse');
const taskRoutes = require('./routes/taskRoutes');

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

app.use('/api/tasks', taskRoutes);

app.use((req, res) => {
  return ApiResponse.notFound(res, 'Route not found');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  return ApiResponse.internal(res, 'Something went wrong on the server', err.message);
});

module.exports = app;
