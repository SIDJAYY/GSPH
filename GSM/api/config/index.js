import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Dialogflow configuration
  dialogflow: {
    projectId: process.env.DIALOGFLOW_PROJECT_ID || 'bpmproject-51620',
    languageCode: process.env.DIALOGFLOW_LANGUAGE_CODE || 'en',
    keyFilename: path.join(__dirname, '../bpmproject-51620-442af2875f18.json'),
    // Alternative authentication methods
    useKeyFile: process.env.DIALOGFLOW_USE_KEY_FILE !== 'false',
    credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    // Fallback mode for development
    enableFallbackMode: process.env.DIALOGFLOW_FALLBACK_MODE === 'true'
  },
  
  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING !== 'false'
  }
};

export default config; 