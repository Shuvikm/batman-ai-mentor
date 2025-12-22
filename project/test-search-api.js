// Test Search API Functionality
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000';

// Test YouTube API directly
async function testYouTubeSearch() {
  console.log('🎥 Testing YouTube Search API...');
  
  try {
    // First test without authentication (should fail)
    const response = await fetch(`${API_BASE}/api/search/youtube?q=python programming&maxResults=3`);
    const data = await response.json();
    
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));
    
    if (response.status === 401) {
      console.log('✅ Authentication required as expected');
    } else if (response.status === 200) {
      console.log('✅ YouTube search working!');
      console.log('Videos found:', data.data?.videos?.length || 0);
    } else {
      console.log('❌ Unexpected response status');
    }
  } catch (error) {
    console.error('❌ YouTube search error:', error.message);
  }
}

// Test News API directly
async function testNewsSearch() {
  console.log('\n📰 Testing News Search API...');
  
  try {
    const response = await fetch(`${API_BASE}/api/search/news?q=technology&pageSize=3`);
    const data = await response.json();
    
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));
    
    if (response.status === 401) {
      console.log('✅ Authentication required as expected');
    } else if (response.status === 200) {
      console.log('✅ News search working!');
      console.log('Articles found:', data.data?.articles?.length || 0);
    } else {
      console.log('❌ Unexpected response status');
    }
  } catch (error) {
    console.error('❌ News search error:', error.message);
  }
}

// Test search configuration endpoint
async function testSearchConfig() {
  console.log('\n⚙️  Testing Search Configuration API...');
  
  try {
    const response = await fetch(`${API_BASE}/api/chat/search-config`);
    const data = await response.json();
    
    console.log('Response Status:', response.status);
    console.log('Search Config:', JSON.stringify(data, null, 2));
    
    if (response.status === 200) {
      console.log('✅ Search config loaded successfully');
      const config = data.data;
      console.log('YouTube API Available:', config?.availableApis?.youtube);
      console.log('News API Available:', config?.availableApis?.news);
    }
  } catch (error) {
    console.error('❌ Search config error:', error.message);
  }
}

// Test with authentication
async function testWithAuth() {
  console.log('\n🔐 Testing with Authentication...');
  
  try {
    // Try to register a test user
    const registerResponse = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@search.com',
        username: 'searchtester',
        password: 'testpass123'
      })
    });
    
    let token = null;
    
    if (registerResponse.status === 201) {
      const registerData = await registerResponse.json();
      token = registerData.token;
      console.log('✅ Test user registered successfully');
    } else {
      // Try to login instead
      const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@search.com',
          password: 'testpass123'
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        token = loginData.token;
        console.log('✅ Test user logged in successfully');
      }
    }
    
    if (token) {
      console.log('\n🎥 Testing YouTube search with auth token...');
      const youtubeResponse = await fetch(`${API_BASE}/api/search/youtube?q=javascript tutorial&maxResults=2`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const youtubeData = await youtubeResponse.json();
      console.log('YouTube Response:', JSON.stringify(youtubeData, null, 2));
      
      console.log('\n📰 Testing News search with auth token...');
      const newsResponse = await fetch(`${API_BASE}/api/search/news?q=programming&pageSize=2`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const newsData = await newsResponse.json();
      console.log('News Response:', JSON.stringify(newsData, null, 2));
    }
  } catch (error) {
    console.error('❌ Authentication test error:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🔍 Starting Search API Tests...\n');
  
  await testYouTubeSearch();
  await testNewsSearch();
  await testSearchConfig();
  await testWithAuth();
  
  console.log('\n✅ All tests completed!');
}

runAllTests().catch(console.error);