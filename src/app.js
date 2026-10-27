require('dotenv').config();

const express = require('express');
const pool = require('./db');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok'
  });
});

app.get('/health/db', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT current_database() AS database_name, current_user AS database_user'
    );

    res.status(200).json({
      status: 'ok',
      database: result.rows[0].database_name,
      user: result.rows[0].database_user
    });
  } catch (err) {
    console.error('Database health check failed:', err.message);

    res.status(503).json({
      status: 'error',
      message: 'Database connection failed'
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

module.exports = app;
