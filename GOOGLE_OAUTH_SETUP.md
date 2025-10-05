# Google OAuth Setup Guide

This guide will help you set up Google OAuth 2.0 for the GoServePH application.

## Prerequisites

- Google Cloud Console account
- Access to create OAuth 2.0 credentials

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (or Google Identity API)

## Step 2: Configure OAuth Consent Screen

1. In the Google Cloud Console, go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required fields:
   - App name: GoServePH
   - User support email: your-email@example.com
   - Developer contact information: your-email@example.com
4. Add scopes: `email`, `profile`, `openid`
5. Add test users (your email addresses)

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:5173` (for development)
   - `https://yourdomain.com` (for production)
5. Copy the Client ID and Client Secret

## Step 4: Configure Environment Variables

### Frontend (GSM/.env)
```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173
VITE_API_BASE_URL=http://localhost:8000/api
```

### Backend (microservices/auth_service/.env)
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5173
```

## Step 5: Test the Integration

1. Start the auth service: `php artisan serve --port=8000`
2. Start the frontend: `npm run dev`
3. Go to `http://localhost:5173`
4. Click "Continue with Google"
5. Complete the OAuth flow

## Troubleshooting

- **"Google OAuth Not Configured"**: Check that environment variables are set correctly
- **Redirect URI mismatch**: Ensure the redirect URI in Google Console matches your environment
- **CORS errors**: Verify the frontend URL is allowed in Laravel CORS settings

## Security Notes

- Never commit `.env` files to version control
- Use different credentials for development and production
- Regularly rotate your OAuth credentials
- Monitor OAuth usage in Google Cloud Console
