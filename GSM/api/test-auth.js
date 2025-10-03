import { SessionsClient } from '@google-cloud/dialogflow';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testDialogflowAuth() {
  console.log('🔍 Testing Dialogflow Authentication...');
  console.log('='.repeat(50));

  const projectId = 'bpmproject-51620';
  const keyFilename = path.join(__dirname, './bpmproject-51620-16f5485edbe4.json');

  console.log('Project ID:', projectId);
  console.log('Key file path:', keyFilename);

  try {
    // Test 1: Initialize client
    console.log('\n1️⃣ Initializing SessionsClient...');
    const sessionClient = new SessionsClient({
      keyFilename,
      projectId,
    });
    console.log('✅ SessionsClient initialized successfully');

    // Test 2: Create session path
    console.log('\n2️⃣ Creating session path...');
    const sessionId = 'test-session-' + Date.now();
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);
    console.log('Session ID:', sessionId);
    console.log('Session Path:', sessionPath);
    console.log('✅ Session path created successfully');

    // Test 3: Create request
    console.log('\n3️⃣ Creating test request...');
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: 'Hello',
          languageCode: 'en',
        },
      },
    };
    console.log('Request:', JSON.stringify(request, null, 2));
    console.log('✅ Request created successfully');

    // Test 4: Send request to Dialogflow
    console.log('\n4️⃣ Sending request to Dialogflow...');
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    
    console.log('✅ Dialogflow response received!');
    console.log('Fulfillment Text:', result.fulfillmentText);
    console.log('Intent Display Name:', result.intent?.displayName);
    console.log('Confidence:', result.intentDetectionConfidence);

    console.log('\n🎉 Authentication test PASSED!');
    return true;

  } catch (error) {
    console.error('\n❌ Authentication test FAILED!');
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
    });

    if (error.code === 16) {
      console.error('\n🔧 Troubleshooting suggestions:');
      console.error('1. Check if the service account key file is valid');
      console.error('2. Verify the project ID is correct');
      console.error('3. Ensure the service account has Dialogflow API access');
      console.error('4. Check if Dialogflow API is enabled in Google Cloud Console');
    }

    return false;
  }
}

// Run the test
testDialogflowAuth()
  .then(success => {
    if (success) {
      console.log('\n✅ All tests passed! Your Dialogflow setup is working correctly.');
    } else {
      console.log('\n❌ Tests failed. Please check the error messages above.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  }); 