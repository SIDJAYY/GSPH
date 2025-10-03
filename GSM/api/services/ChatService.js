import { SessionsClient } from '@google-cloud/dialogflow';
import { v4 as uuidv4 } from 'uuid';
import { FallbackHandler } from '../utils/FallbackHandler.js';

export class ChatService {
  constructor(config) {
    this.config = config;
    this.projectId = config.dialogflow.projectId;
    this.languageCode = config.dialogflow.languageCode;
    this.fallbackMode = config.dialogflow.enableFallbackMode;
    
    if (this.fallbackMode) {
      console.log('⚠️  Running in FALLBACK MODE - Dialogflow disabled');
      console.log('Dialogflow client not initialized (fallback mode enabled)');
      return;
    }

    // Initialize Dialogflow client with proper authentication
    const clientConfig = {
      projectId: config.dialogflow.projectId,
    };

    // Use key file if specified and available
    if (config.dialogflow.useKeyFile && config.dialogflow.keyFilename) {
      clientConfig.keyFilename = config.dialogflow.keyFilename;
    }
    
    // Use credentials from environment if available
    if (config.dialogflow.credentials) {
      clientConfig.credentials = config.dialogflow.credentials;
    }

    this.sessionClient = new SessionsClient(clientConfig);
    console.log('Dialogflow client initialized with project:', this.projectId);
  }

  async processMessage(message, sessionId) {
    if (!message || typeof message !== 'string') {
      throw new Error('Invalid message provided');
    }

    // If in fallback mode, use only fallback responses
    if (this.fallbackMode) {
      console.log('Using fallback mode - skipping Dialogflow');
      return FallbackHandler.getResponse(message);
    }

    // Check if Dialogflow client is available
    if (!this.sessionClient) {
      console.log('Dialogflow client not available - using fallback');
      return FallbackHandler.getResponse(message);
    }

    const sessionPath = this.sessionClient.projectAgentSessionPath(
      this.projectId, 
      sessionId || uuidv4()
    );

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
          languageCode: this.languageCode,
        },
      },
    };

    try {
      console.log('Sending request to Dialogflow...');
      console.log('Session path:', sessionPath);
      console.log('Request:', JSON.stringify(request, null, 2));
      
      const responses = await this.sessionClient.detectIntent(request);
      const result = responses[0].queryResult;
      
      console.log('Dialogflow response:', result.fulfillmentText);
      
      // Return Dialogflow response if available, otherwise use fallback
      if (result.fulfillmentText && result.fulfillmentText.trim()) {
        return result.fulfillmentText;
      }
      
      return FallbackHandler.getResponse(message);
    } catch (error) {
      console.error('Dialogflow error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        stack: error.stack
      });
      
      // Check if it's an authentication error
      if (error.code === 16 || error.message.includes('authentication')) {
        console.error('Authentication error detected. Please check your Dialogflow credentials.');
        console.log('Using fallback response due to authentication error');
        return FallbackHandler.getResponse(message);
      }
      
      // Return fallback response on other Dialogflow errors
      console.log('Using fallback response due to Dialogflow error');
      return FallbackHandler.getResponse(message);
    }
  }

  async getSessionInfo(sessionId) {
    return {
      sessionId: sessionId || uuidv4(),
      projectId: this.projectId,
      languageCode: this.languageCode
    };
  }
} 