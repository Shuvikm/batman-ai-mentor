# Batman AI Mentor - Backend Setup Guide

This guide will help you connect the Batman AI Mentor application to a Supabase backend.

## Prerequisites

- A Supabase account (free tier works fine)
- Node.js and npm installed
- Basic understanding of SQL

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose an organization and enter project details:
   - **Name**: batman-ai-mentor (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users

### 2. Configure Environment Variables

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy your project URL and anon public key
3. Update the `.env` file in your project root:

```env
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace `your-project-url-here` and `your-anon-key-here` with your actual values.

### 3. Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the content from `database/schema.sql` in this project
3. Paste it into the SQL editor and click **Run**

This will create all the necessary tables:
- `profiles` - User profiles with levels and points
- `learning_paths` - AI-generated learning paths
- `chat_messages` - Chat history with AI assistant
- `quizzes` - Generated quizzes from documents
- `quiz_results` - Quiz attempt results

### 4. Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Configure your site URL:
   - **Site URL**: `http://localhost:5173` (for development)
   - Add your production URL when deploying

3. Enable email confirmation (optional but recommended):
   - **Enable email confirmations**: ON
   - Configure email templates as desired

### 5. Set Up Row Level Security (RLS)

The schema includes RLS policies, but verify they're active:

1. Go to **Authentication** → **Policies**
2. Ensure policies exist for all tables
3. Test that users can only access their own data

### 6. Start the Application

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

## Features Connected to Backend

### ✅ Authentication
- User registration with email confirmation
- Login/logout with sessions
- Persistent authentication state

### ✅ User Profiles
- Automatic profile creation on signup
- Level and points tracking
- User preferences storage

### ✅ Learning Paths
- Generate and save personalized learning paths
- Store user progress and preferences
- Retrieve user's learning history

### ✅ Chat Assistant
- Persistent chat history
- Message storage and retrieval
- Conversation continuity

### ✅ Quiz Generation
- Save generated quizzes
- Store quiz results and scores
- Track user progress over time

## API Functions Available

The `src/lib/supabase.ts` file provides these services:

### Authentication Service
- `authService.signUp(email, username, password)`
- `authService.signIn(email, password)`
- `authService.signOut()`
- `authService.getCurrentUser()`
- `authService.onAuthStateChange(callback)`

### Learning Paths Service
- `learningPathsService.generatePath(formData)`
- `learningPathsService.getUserPaths(userId)`

### Chat Service
- `chatService.saveMessage(userId, message)`
- `chatService.getChatHistory(userId, limit)`

### Quiz Service
- `quizService.saveQuiz(userId, quiz)`
- `quizService.getUserQuizzes(userId)`

## Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Make sure `.env` file is in project root
   - Restart the development server
   - Check that variables start with `VITE_`

2. **Database connection errors**
   - Verify your Supabase URL and key
   - Check if your project is paused (free tier limitation)
   - Ensure RLS policies are correctly set

3. **Authentication not working**
   - Verify site URL in Supabase settings
   - Check if email confirmation is required
   - Look for error messages in browser console

4. **Database schema errors**
   - Run the schema SQL again if tables are missing
   - Check for any syntax errors in the SQL
   - Verify all policies are active

### Development vs Production

For production deployment:

1. Update environment variables with production URLs
2. Configure proper CORS settings in Supabase
3. Set up custom domain and SSL
4. Consider upgrading Supabase plan for better performance

## Next Steps

Once the backend is connected, you can:

1. **Enhance AI Integration**: Connect to OpenAI API or other AI services
2. **Add File Upload**: Implement document parsing for quiz generation
3. **Real-time Features**: Use Supabase realtime for live chat updates
4. **Analytics**: Track user engagement and learning progress
5. **Mobile App**: Use the same backend for a React Native mobile app

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Review Supabase logs in the dashboard
3. Verify all environment variables are correct
4. Ensure database schema is properly set up

The application is designed to work with mock data if Supabase is not configured, so you can still test the UI even without a backend connection.