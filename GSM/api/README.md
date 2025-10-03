# JironAI Chat API

A modern, well-structured Express.js API for the JironAI chatbot with Dialogflow integration.

## 🚀 Features

- **Dialogflow Integration**: Seamless integration with Google Dialogflow for AI-powered conversations
- **Modular Architecture**: Clean separation of concerns with services, routes, and middleware
- **Error Handling**: Comprehensive error handling with graceful fallbacks
- **Multi-language Support**: Support for English and Filipino languages
- **Health Monitoring**: Built-in health check endpoints
- **Environment Configuration**: Flexible configuration management
- **Graceful Shutdown**: Proper server shutdown handling

## 📁 Project Structure

```
api/
├── config/
│   └── index.js          # Configuration management
├── services/
│   └── ChatService.js    # Chat service with Dialogflow integration
├── routes/
│   └── chat.js          # Chat API routes
├── middleware/
│   └── errorHandler.js   # Error handling middleware
├── utils/
│   └── FallbackHandler.js # Fallback response utilities
├── server.js             # Main server file
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## 🛠️ Setup

### Prerequisites

- Node.js >= 16.0.0
- Google Cloud Project with Dialogflow enabled
- Dialogflow service account key file

### Installation

1. **Install dependencies**:
   ```bash
   cd api
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file in the `api` directory:
   ```env
   PORT=5000
   NODE_ENV=development
   DIALOGFLOW_PROJECT_ID=your-project-id
   DIALOGFLOW_LANGUAGE_CODE=en
   CORS_ORIGIN=http://localhost:5173
   LOG_LEVEL=info
   ENABLE_REQUEST_LOGGING=true
   ```

3. **Dialogflow Setup**:
   - Place your Dialogflow service account key file in the `api` directory
   - Update the `keyFilename` path in `config/index.js` if needed

### Running the Server

**Development mode**:
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

## 📡 API Endpoints

### Health Check
```
GET /api/health
```
Returns server health status and configuration information.

### Chat
```
POST /api/chat
```
Processes chat messages through Dialogflow.

**Request Body**:
```json
{
  "message": "Hello, how can you help me?",
  "sessionId": "optional-session-id"
}
```

**Response**:
```json
{
  "reply": "Hello! I'm JironAI. How can I help you today?",
  "sessionId": "generated-session-id",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Chat Capabilities
```
GET /api/chat/capabilities
```
Returns information about what the chatbot can help with.

## 🔧 Configuration

The API uses a centralized configuration system in `config/index.js`:

- **Server**: Port, environment settings
- **Dialogflow**: Project ID, language code, key file path
- **CORS**: Origin settings for cross-origin requests
- **Logging**: Log levels and request logging settings

## 🛡️ Error Handling

The API includes comprehensive error handling:

- **Validation Errors**: Proper validation of request data
- **Dialogflow Errors**: Graceful fallback when Dialogflow is unavailable
- **Global Error Handler**: Catches and formats all unhandled errors
- **404 Handler**: Proper handling of non-existent endpoints

## 🔄 Fallback System

When Dialogflow is unavailable or returns empty responses, the system provides intelligent fallbacks for:

- Greetings (hello, hi, kamusta)
- Identity questions (who are you, name)
- Help requests (help, tulong)
- General queries

## 🚀 Deployment

### Environment Variables for Production

```env
PORT=5000
NODE_ENV=production
DIALOGFLOW_PROJECT_ID=your-production-project-id
DIALOGFLOW_LANGUAGE_CODE=en
CORS_ORIGIN=https://your-frontend-domain.com
LOG_LEVEL=warn
ENABLE_REQUEST_LOGGING=false
```

### Docker Deployment

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🔍 Monitoring

The API includes built-in monitoring capabilities:

- **Health Check Endpoint**: `/api/health`
- **Request Logging**: Configurable request logging
- **Error Logging**: Comprehensive error tracking
- **Graceful Shutdown**: Proper cleanup on server termination

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Update documentation for new features
4. Test thoroughly before submitting

## 📄 License

MIT License - see LICENSE file for details. 