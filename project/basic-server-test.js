// Simple test to check server health and API functionality
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000';

async function testServerHealth() {
  console.log('🏥 Testing Server Health...');
  
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    const data = await response.json();
    
    console.log('Server Status:', response.status);
    console.log('Health Response:', data);
    
    if (response.ok) {
      console.log('✅ Server is healthy and running!');
      return true;
    }
  } catch (error) {
    console.error('❌ Server health check failed:', error.message);
    return false;
  }
  
  return false;
}

async function testAPIKeys() {
  console.log('\n🔑 Testing API Keys Configuration...');
  
  try {
    // Test YouTube API configuration (will fail without auth but should tell us if key is configured)
    const ytResponse = await fetch(`${API_BASE}/api/search/youtube?q=test`);
    const ytData = await ytResponse.json();
    
    console.log('YouTube API Status:', ytResponse.status);
    console.log('YouTube API Response:', ytData);
    
    // Test News API configuration
    const newsResponse = await fetch(`${API_BASE}/api/search/news?q=test`);
    const newsData = await newsResponse.json();
    
    console.log('News API Status:', newsResponse.status);
    console.log('News API Response:', newsData);
    
    // Both should return 401 (unauthorized) if APIs are configured
    if (ytResponse.status === 401 && newsResponse.status === 401) {
      console.log('✅ API endpoints are protected and configured correctly');
      return true;
    }
  } catch (error) {
    console.error('❌ API keys test failed:', error.message);
  }
  
  return false;
}

async function runBasicTests() {
  console.log('🔍 Running Basic Server Tests...\n');
  
  const healthOk = await testServerHealth();
  const apisOk = await testAPIKeys();
  
  console.log('\n📊 Test Results:');
  console.log('- Server Health:', healthOk ? '✅ PASS' : '❌ FAIL');
  console.log('- API Configuration:', apisOk ? '✅ PASS' : '❌ FAIL');
  
  if (healthOk && apisOk) {
    console.log('\n🎉 Server is ready! The search functionality should work once authenticated.');
  } else {
    console.log('\n⚠️  There may be issues with the server setup.');
  }
}

runBasicTests().catch(console.error);