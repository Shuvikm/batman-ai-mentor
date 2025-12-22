# 🦇 Batman AI Mentor - MongoDB Setup Guide

This guide will help you set up MongoDB for the Batman AI Mentor application using MongoDB Compass.

## Prerequisites

- MongoDB Community Server installed
- MongoDB Compass (GUI client)
- Node.js and npm installed

## Step 1: Install MongoDB Community Server

If you haven't installed MongoDB yet:

1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install it with default settings
3. MongoDB will typically run on `mongodb://localhost:27017`

## Step 2: Install MongoDB Compass

1. Download MongoDB Compass from: https://www.mongodb.com/try/download/compass
2. Install and launch MongoDB Compass
3. Connect to `mongodb://localhost:27017`

## Step 3: Create the Database

1. In MongoDB Compass, click "Create Database"
2. Database Name: `batman-ai-mentor`
3. Collection Name: `users` (initial collection)
4. Click "Create Database"

## Step 4: Database Collections

The backend will automatically create these collections when needed:
- `users` - User accounts and profiles
- `learningpaths` - AI-generated learning paths
- `chatmessages` - Chat history with AI assistant
- `quizzes` - Generated quizzes
- `quizresults` - Quiz scores and results

## Step 5: Start the Application

### Option 1: Start Everything at Once
```bash
npm run dev:full
```

This will start both the backend server (port 5000) and frontend (port 5173).

### Option 2: Start Separately

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run dev
```

## Step 6: Verify Setup

1. **Backend Health Check**: Visit http://localhost:5000/api/health
   - Should show: "Batman AI Mentor API is running!"

2. **Frontend**: Visit http://localhost:5173
   - Should show the Batman AI Mentor login page

3. **Database Connection**: Check MongoDB Compass
   - Should show `batman-ai-mentor` database

## Step 7: Test the Application

1. **Create Account**: Use the signup form to create a new user
2. **Login**: Sign in with your credentials
3. **Generate Learning Path**: Try creating a learning path
4. **Chat with AI**: Test the chat assistant feature
5. **Upload Quiz**: Try the quiz generator

## Features Now Available

### ✅ Complete Backend Integration
- MongoDB database with full CRUD operations
- JWT-based authentication
- RESTful API endpoints
- Real-time data persistence

### ✅ AI Assistant
- Intelligent responses based on user input
- Persistent chat history
- Context-aware conversations

### ✅ Learning Paths
- AI-generated personalized learning journeys
- Progress tracking
- Module-based structure

### ✅ Quiz System
- Document-based quiz generation
- Interactive quiz taking
- Results tracking with XP rewards

### ✅ User Management
- Secure registration and login
- User profiles with levels and points
- Session management

## Environment Variables

Your `.env` file should contain:
```env
MONGODB_URI=mongodb://localhost:27017/batman-ai-mentor
JWT_SECRET=batman-secret-key-wayne-tech-2025-super-secure
VITE_API_URL=http://localhost:5000
PORT=5000
```

## Troubleshooting

### MongoDB Connection Issues
1. Ensure MongoDB service is running
2. Check connection string in `.env`
3. Verify firewall settings

### API Connection Issues
1. Ensure backend server is running on port 5000
2. Check console for CORS errors
3. Verify `VITE_API_URL` in `.env`

### Frontend Issues
1. Clear browser cache
2. Check browser console for errors
3. Ensure all dependencies are installed

## MongoDB Compass Usage

### View Data
1. Connect to your database
2. Expand `batman-ai-mentor`
3. Click on any collection to view documents

### Query Data
- Use the filter bar to search documents
- Example: `{"username": "batman"}` to find user

### Monitor Performance
- Use the "Performance" tab to monitor queries
- Check indexes for optimization

## Production Deployment

For production, update these settings:

1. **MongoDB Atlas**: Use cloud MongoDB instead of local
2. **Environment Variables**: Update with production values
3. **CORS**: Configure allowed origins
4. **SSL**: Enable HTTPS
5. **Authentication**: Strengthen JWT secrets

## API Endpoints

### Authentication
- POST `/api/auth/register` - Create account
- POST `/api/auth/login` - Sign in
- GET `/api/auth/me` - Get current user

### Learning Paths
- POST `/api/learning-paths` - Create learning path
- GET `/api/learning-paths` - Get user's paths

### Chat
- POST `/api/chat/messages` - Save message
- GET `/api/chat/messages` - Get chat history
- POST `/api/ai/chat` - Get AI response

### Quizzes
- POST `/api/quizzes` - Create quiz
- GET `/api/quizzes` - Get user's quizzes
- POST `/api/quiz-results` - Submit quiz result

Your Batman AI Mentor is now fully operational with MongoDB! 🚀🦇