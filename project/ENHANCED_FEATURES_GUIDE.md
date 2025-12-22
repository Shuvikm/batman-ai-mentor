# 🦇 Batman AI Mentor - Enhanced Features Documentation

## 🚀 New Features Overview

Your Batman AI Mentor platform has been significantly enhanced with powerful new capabilities:

### 🤖 Enhanced Chatbot with API Integration
- **Gemini AI Integration**: Advanced conversational AI responses
- **YouTube Search**: Find relevant educational videos during chat
- **News Search**: Get latest news and updates on topics
- **Smart Context**: AI considers search results for better responses

### 🧠 AI Quiz Generator for Any Subject
- **Universal Subject Support**: Generate quizzes on ANY topic
- **Difficulty Levels**: Easy, Medium, Hard
- **Custom Question Count**: 5-20 questions
- **Detailed Explanations**: Each answer includes explanations
- **Smart Storage**: Automatically saved to your database

### 🗺️ Interactive Learning Path Mindmaps
- **Visual Learning Paths**: AI-generated mindmaps
- **Interactive Branches**: Click to explore topics
- **Time Estimates**: Realistic learning durations
- **Resource Suggestions**: Books, courses, and materials
- **Prerequisites**: What you need to know first

### 💳 Dual Payment System
- **Stripe**: International payments (USD, EUR, GBP)
- **Razorpay**: India-focused payments (INR)
- **Secure Processing**: Industry-standard security
- **Auto-verification**: Payment confirmation handling

## 🔧 API Keys Configuration

Update your `.env` file with these API keys:

```env
# Enhanced Chatbot
GEMINI_API_KEY=your_gemini_api_key_here
CHATBOT_API_KEY=your_gemini_api_key_here

# Search Integration  
YOUTUBE_API_KEY=your_youtube_api_key_here
NEWS_API_KEY=your_news_api_key_here

# Payment Processing
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

# Search Configuration
CHATBOT_SEARCH_ENABLED=true
CHATBOT_DEFAULT_SEARCH_TOPICS=programming,technology,education,tutorials,science,mathematics
CHATBOT_MAX_SEARCH_RESULTS=10
```

## 🛠️ How to Get API Keys

### 1. Gemini AI API Key
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Create new API key
4. Copy to `GEMINI_API_KEY` in .env

### 2. YouTube API Key
1. Visit: https://console.developers.google.com
2. Create new project or select existing
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Copy to `YOUTUBE_API_KEY` in .env

### 3. News API Key
1. Visit: https://newsapi.org/register
2. Sign up for free account
3. Copy API key from dashboard
4. Add to `NEWS_API_KEY` in .env

### 4. Razorpay Keys
1. Visit: https://dashboard.razorpay.com/app/keys
2. Sign up for Razorpay account
3. Get Key ID and Key Secret
4. Add to `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`

## 🎯 New Features Usage

### Enhanced Quiz Generation
1. Navigate to "AI Quiz Creator" in dashboard
2. Enter any subject (e.g., "Python Programming", "World History")
3. Select difficulty level
4. Choose number of questions
5. Click "Generate Quiz"
6. Review questions with explanations
7. Take quiz or save for later

### Learning Path Mindmaps
1. Go to "Learning Mindmaps" section
2. Enter your learning subject
3. Add optional learning goals
4. Select difficulty level
5. Click "Generate Mindmap"
6. Explore visual learning path
7. Click branches for detailed view

### Enhanced Chat Features
1. Open "AI Assistant"
2. Use search buttons for YouTube videos or news
3. Chat normally - AI will integrate search results
4. Get contextual responses with external resources

### Payment Integration
1. Teachers can accept payments via Stripe or Razorpay
2. Students can pay in their preferred currency
3. Automatic payment verification
4. Earnings tracking for teachers

## 🔗 New API Endpoints

### Quiz Generation
```
POST /api/quizzes/generate
{
  "subject": "JavaScript Programming",
  "difficulty": "medium", 
  "numberOfQuestions": 10
}
```

### Mindmap Generation
```
POST /api/learning-paths/mindmap
{
  "subject": "React Development",
  "learningGoals": ["Build web apps", "Master hooks"],
  "difficulty": "intermediate"
}
```

### Enhanced Chat
```
POST /api/chat/enhanced
{
  "message": "Teach me about machine learning",
  "searchTopics": ["AI", "algorithms", "data science"]
}
```

### YouTube Search
```
GET /api/search/youtube?q=javascript tutorial&maxResults=10
```

### News Search
```
GET /api/search/news?q=artificial intelligence&pageSize=5
```

### Razorpay Order Creation
```
POST /api/payments/razorpay/create-order
{
  "amount": 1000,
  "currency": "INR",
  "sessionId": "session_id_here"
}
```

## 🎨 Frontend Enhancements

### New Components
- `EnhancedQuizGenerator.tsx` - AI quiz creation interface
- `MindmapGenerator.tsx` - Visual learning path creator
- Enhanced `ChatAssistant.tsx` - Search integration
- Updated `Dashboard.tsx` - New feature navigation

### Updated Features
- Enhanced navigation with new options
- Search integration in chat
- Visual mindmap display
- Quiz generation interface
- Payment method selection

## 🗄️ Database Schema Updates

### Quiz Schema Enhanced
```javascript
{
  subject: String,           // New: Quiz subject
  difficulty: String,        // New: easy/medium/hard
  isGenerated: Boolean,      // New: AI-generated flag
  generatedAt: Date,         // New: Generation timestamp
  questions: {               // Updated: Flexible format
    options: Mixed,          // Can be array or object
    correctAnswer: Mixed     // Can be number or string
  }
}
```

### Learning Path Schema Enhanced
```javascript
{
  subject: String,           // New: Learning subject
  mindmapData: Mixed,        // New: Full mindmap JSON
  prerequisites: [String],   // New: Required knowledge
  totalEstimatedTime: String,// New: Complete duration
  isGenerated: Boolean,      // New: AI-generated flag
  steps: [{                  // New: Structured steps
    title: String,
    description: String,
    estimatedTime: String,
    resources: [String]
  }]
}
```

### Payment Schema Enhanced
```javascript
{
  paymentMethod: String,     // New: stripe/razorpay
  razorpayOrderId: String,   // New: Razorpay order ID
  razorpayPaymentId: String, // New: Razorpay payment ID
  razorpaySignature: String  // New: Payment signature
}
```

## 🚀 Getting Started

1. **Start the servers**:
   ```bash
   # Backend
   cd project
   node server/index.js
   
   # Frontend (new terminal)
   cd project
   npm run dev
   ```

2. **Access the platform**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

3. **Test new features**:
   - Try generating a quiz on any subject
   - Create a learning mindmap
   - Use enhanced chat with search
   - Test payment integration

## 🎉 What's New Summary

✅ **AI Quiz Generation** - Create quizzes on any subject instantly
✅ **Learning Mindmaps** - Visual learning path generation  
✅ **Enhanced Chat** - YouTube & News search integration
✅ **Dual Payments** - Stripe + Razorpay support
✅ **Smart Search** - Context-aware AI responses
✅ **Mobile Ready** - Responsive design updates
✅ **API Integration** - Multiple external services
✅ **Enhanced Database** - Flexible schema updates

Your Batman AI Mentor platform is now a comprehensive educational ecosystem with advanced AI capabilities, visual learning tools, and global payment support!

## 🔧 Troubleshooting

If you encounter issues:

1. **Server won't start**: Check if port 5000 is free
2. **Quiz generation fails**: Verify Gemini API key
3. **Search not working**: Check YouTube/News API keys  
4. **Payment issues**: Verify Stripe/Razorpay configuration
5. **Database errors**: Ensure MongoDB is running

For support, check the console logs for detailed error messages.