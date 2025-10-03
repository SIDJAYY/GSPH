# Deployment to Vercel

## Environment variables
Set these in Vercel Project Settings → Environment Variables:

- DIALOGFLOW_PROJECT_ID = bpmproject-51620 (or your project)
- DIALOGFLOW_CLIENT_EMAIL = <service-account-email>
- DIALOGFLOW_PRIVATE_KEY = <service-account-private-key with \n escaped as newline>

Optionally, you can upload a JSON key file locally for dev and use GOOGLE_APPLICATION_CREDENTIALS, but for Vercel you must use env vars as above.

## API
- Serverless function: `api/chat.js`
- Frontend calls: `fetch('/api/chat')`
