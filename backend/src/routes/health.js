const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const router = express.Router();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: 'unknown',
        aiService: 'unknown'
      }
    };

    // Check database connection
    try {
      if (mongoose.connection.readyState === 1) {
        health.services.database = 'connected';
      } else {
        health.services.database = 'disconnected';
        health.status = 'degraded';
      }
    } catch (error) {
      health.services.database = 'error';
      health.status = 'degraded';
    }

    // Check AI service
    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      await axios.get(`${aiServiceUrl}/health`, { timeout: 5000 });
      health.services.aiService = 'connected';
    } catch (error) {
      health.services.aiService = 'disconnected';
      health.status = 'degraded';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          status: 'unknown',
          connectionState: mongoose.connection.readyState,
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          name: mongoose.connection.name
        },
        aiService: {
          status: 'unknown',
          url: process.env.AI_SERVICE_URL || 'http://localhost:8000'
        }
      },
      system: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version
      }
    };

    // Check database
    try {
      if (mongoose.connection.readyState === 1) {
        health.services.database.status = 'connected';
        // Test a simple query
        await mongoose.connection.db.admin().ping();
      } else {
        health.services.database.status = 'disconnected';
        health.status = 'degraded';
      }
    } catch (error) {
      health.services.database.status = 'error';
      health.services.database.error = error.message;
      health.status = 'degraded';
    }

    // Check AI service
    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      const response = await axios.get(`${aiServiceUrl}/health`, { timeout: 5000 });
      health.services.aiService.status = 'connected';
      health.services.aiService.response = response.data;
    } catch (error) {
      health.services.aiService.status = 'disconnected';
      health.services.aiService.error = error.message;
      health.status = 'degraded';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Detailed health check failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
