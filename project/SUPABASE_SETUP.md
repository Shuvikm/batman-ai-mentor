# 🗄️ Supabase Database Setup - Step by Step Guide

## 📋 Prerequisites
- You have a Supabase account and project running
- Your project URL: `https://fdnvqzqrxfdzpaaetjge.supabase.co`

## 🚀 Step-by-Step Database Setup

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project: **fdnvqzqrxfdzpaaetjge**

### Step 2: Open SQL Editor
1. In your project dashboard, click on **SQL Editor** in the left sidebar
2. Click **New Query** to create a new SQL script

### Step 3: Run the Database Schema
Copy and paste the SQL script below into the SQL editor, then click **Run**:

```sql
-- ===============================================
-- BATMAN AI MENTOR - DATABASE SCHEMA
-- ===============================================

-- 1. Create user profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  level integer DEFAULT 1,
  points integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Create learning paths table
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  topic text NOT NULL,
  title text NOT NULL,
  level text NOT NULL,
  time_available text NOT NULL,
  goals text,
  duration text NOT NULL,
  modules jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Create chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Create quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  questions jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 5. Create quiz results table
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id uuid REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score integer NOT NULL,
  total_questions integer NOT NULL,
  time_taken integer, -- in seconds
  answers jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- ===============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ===============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- CREATE RLS POLICIES
-- ===============================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Learning paths policies
CREATE POLICY "Users can view own learning paths" ON public.learning_paths 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own learning paths" ON public.learning_paths 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning paths" ON public.learning_paths 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own learning paths" ON public.learning_paths 
  FOR DELETE USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Users can view own chat messages" ON public.chat_messages 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat messages" ON public.chat_messages 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Quizzes policies
CREATE POLICY "Users can view own quizzes" ON public.quizzes 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quizzes" ON public.quizzes 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quizzes" ON public.quizzes 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quizzes" ON public.quizzes 
  FOR DELETE USING (auth.uid() = user_id);

-- Quiz results policies
CREATE POLICY "Users can view own quiz results" ON public.quiz_results 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quiz results" ON public.quiz_results 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===============================================
-- CREATE FUNCTIONS AND TRIGGERS
-- ===============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_learning_paths_updated_at 
  BEFORE UPDATE ON public.learning_paths 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at 
  BEFORE UPDATE ON public.quizzes 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ===============================================
-- VERIFICATION QUERIES
-- ===============================================

-- Check if all tables were created successfully
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'learning_paths', 'chat_messages', 'quizzes', 'quiz_results');
```

### Step 4: Verify Tables Creation
After running the script, you should see:
- ✅ Success message
- ✅ Query executed successfully
- ✅ 5 tables should be listed in the verification query

### Step 5: Check Table Editor
1. Go to **Table Editor** in the left sidebar
2. You should now see these tables:
   - `profiles`
   - `learning_paths` 
   - `chat_messages`
   - `quizzes`
   - `quiz_results`

## 🔧 What This Schema Creates

### 📋 Tables Overview
- **profiles**: User accounts with levels and XP points
- **learning_paths**: AI-generated personalized learning journeys
- **chat_messages**: Persistent chat history with AI assistant
- **quizzes**: Generated quizzes from uploaded documents
- **quiz_results**: Quiz scores and performance tracking

### 🔒 Security Features
- **Row Level Security (RLS)**: Users can only access their own data
- **Authentication Integration**: Uses Supabase Auth for user management
- **Data Integrity**: Foreign key constraints and data validation

## 🚀 After Setup Complete

Once you've run this SQL script:

1. **Refresh your app**: http://localhost:5174/
2. **Create a real account**: The signup form will now work
3. **Test features**: All data will be saved to your database
4. **No more errors**: The "table not found" error will be resolved

## ⚡ Quick Test
Try creating an account with:
- Email: your-email@example.com
- Username: your-hero-name
- Password: your-secure-password

The error should be gone and you'll have full backend functionality! 🦇