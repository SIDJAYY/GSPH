import express from 'express';
import { v4 as uuidv4 } from 'uuid';

export const createChatRoutes = (chatService) => {
  const router = express.Router();

  // Chat endpoint
  router.post('/chat', async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      
      if (!message) {
        return res.status(400).json({ 
          error: 'Missing message',
          message: 'Message is required'
        });
      }
      
      console.log('Received message:', message, 'Session ID:', sessionId);
      
      const reply = await chatService.processMessage(message, sessionId);
      const sessionInfo = await chatService.getSessionInfo(sessionId);
      
      res.json({ 
        reply,
        sessionId: sessionInfo.sessionId,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Chat endpoint error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'An error occurred while processing your request'
      });
    }
  });

  // Chat capabilities endpoint
  router.get('/chat/capabilities', (req, res) => {
    res.json({
      capabilities: [
        'Scholarship information and applications',
        'Application status checking',
        'General questions about the program',
        'Multi-language support (English and Filipino)'
      ],
      timestamp: new Date().toISOString()
    });
  });

  // Authentication test endpoint
  router.get('/chat/test-auth', async (req, res) => {
    try {
      const testMessage = 'Hello';
      const sessionId = 'test-session-' + Date.now();
      
      console.log('Testing Dialogflow authentication...');
      const reply = await chatService.processMessage(testMessage, sessionId);
      
      res.json({
        success: true,
        message: 'Authentication test completed',
        reply,
        sessionId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Authentication test failed:', error);
      res.status(500).json({
        success: false,
        error: 'Authentication test failed',
        message: error.message,
        code: error.code,
        timestamp: new Date().toISOString()
      });
    }
  });

  return router;
}; 