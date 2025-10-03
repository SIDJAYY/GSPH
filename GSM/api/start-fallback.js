#!/usr/bin/env node

// Start server in fallback mode (without Dialogflow)
process.env.DIALOGFLOW_FALLBACK_MODE = 'true';
process.env.NODE_ENV = 'development';

console.log('🚀 Starting JironAI Server in FALLBACK MODE');
console.log('⚠️  Dialogflow is disabled - using local fallback responses');
console.log('📝 This is for development only');
console.log('='.repeat(50));

// Import and start the server
import('./server.js').then(() => {
  console.log('✅ Server started successfully in fallback mode');
  console.log('🌐 Chat endpoint: http://localhost:5000/api/chat');
  console.log('🏥 Health check: http://localhost:5000/api/health');
  console.log('🧪 Test auth: http://localhost:5000/api/chat/test-auth');
}).catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}); 