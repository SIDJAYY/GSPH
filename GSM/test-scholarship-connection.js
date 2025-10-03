// Simple test script to verify scholarship service connection
const API_BASE_URL = 'http://localhost:8003';

async function testScholarshipService() {
  console.log('🧪 Testing Scholarship Service Connection...\n');

  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);

    // Test public endpoints
    console.log('\n2. Testing public endpoints...');
    
    const [schoolsResponse, categoriesResponse, docTypesResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/public/schools`),
      fetch(`${API_BASE_URL}/api/public/scholarship-categories`),
      fetch(`${API_BASE_URL}/api/public/document-types`)
    ]);

    const schools = await schoolsResponse.json();
    const categories = await categoriesResponse.json();
    const docTypes = await docTypesResponse.json();

    console.log('✅ Schools:', schools.data?.length || 0, 'schools found');
    console.log('✅ Categories:', categories.data?.length || 0, 'categories found');
    console.log('✅ Document Types:', docTypes.data?.length || 0, 'document types found');

    // Test statistics
    console.log('\n3. Testing statistics...');
    const statsResponse = await fetch(`${API_BASE_URL}/api/stats/overview`);
    const stats = await statsResponse.json();
    console.log('✅ Statistics:', stats.data);

    console.log('\n🎉 All tests passed! Scholarship service is ready.');
    console.log('\n📝 Next steps:');
    console.log('1. Start the scholarship service: cd microservices/scholarship_service && php artisan serve --port=8003');
    console.log('2. Run the database migrations: php artisan migrate');
    console.log('3. Seed the database: php artisan db:seed');
    console.log('4. Test the frontend form submission');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the scholarship service is running on port 8003');
    console.log('2. Check if the database is set up correctly');
    console.log('3. Verify the API endpoints are accessible');
  }
}

// Run the test
testScholarshipService();
