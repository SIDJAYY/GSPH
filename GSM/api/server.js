import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import config from './config/index.js';
import { ChatService } from './services/ChatService.js';
import { createChatRoutes } from './routes/chat.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Initialize chat service
const chatService = new ChatService(config);

// Create Express app
const app = express();

// CORS configuration
app.use(cors(config.cors));

// Body parser middleware
app.use(bodyParser.json());

// Request logging middleware
if (config.logging.enableRequestLogging) {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'JironAI Chat API',
    version: '1.0.0',
    environment: config.nodeEnv
  });
});

// API routes
app.use('/api', createChatRoutes(chatService));

// 404 handler
app.use('*', notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
const server = app.listen(config.port, () => {
  console.log('='.repeat(50));
  console.log('🚀 JironAI Chat Server Started');
  console.log('='.repeat(50));
  console.log(`📍 Server running on port ${config.port}`);
  console.log(`🌐 API endpoint: http://localhost:${config.port}/api/chat`);
  console.log(`🏥 Health check: http://localhost:${config.port}/api/health`);
  console.log(`🔧 CORS enabled for: ${config.cors.origin}`);
  console.log(`🤖 Dialogflow Project ID: ${config.dialogflow.projectId}`);
  console.log(`🌍 Language: ${config.dialogflow.languageCode}`);
  console.log(`🌱 Environment: ${config.nodeEnv}`);
  console.log('='.repeat(50));
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`${signal} received, shutting down gracefully`);
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;