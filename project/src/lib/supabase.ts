import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  email: string;
  username: string;
  level: number;
  points: number;
  created_at?: string;
}

// Auth functions
export const authService = {
  async signUp(email: string, username: string, password: string) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email,
            username,
            level: 1,
            points: 0
          })
          .select()
          .single();

        if (profileError) throw profileError;

        return { 
          success: true, 
          user: profileData,
          needsConfirmation: !authData.session 
        };
      }

      return { success: false, error: 'Failed to create user' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) throw profileError;

        return { success: true, user: profileData };
      }

      return { success: false, error: 'Failed to sign in' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getCurrentUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return { success: false, user: null };
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;

      return { success: true, user: profileData };
    } catch (error: any) {
      return { success: false, error: error.message, user: null };
    }
  },

  // Subscribe to auth changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        callback(profileData);
      } else {
        callback(null);
      }
    });
  }
};

// Learning paths service
export const learningPathsService = {
  async generatePath(formData: { topic: string; level: string; timeAvailable: string; goals: string; userId: string }) {
    try {
      const { data, error } = await supabase
        .from('learning_paths')
        .insert({
          user_id: formData.userId,
          topic: formData.topic,
          level: formData.level,
          time_available: formData.timeAvailable,
          goals: formData.goals,
          title: `Master ${formData.topic}`,
          duration: '8-12 weeks',
          modules: [
            {
              id: 1,
              title: 'Foundations',
              lessons: ['Introduction to Concepts', 'Basic Principles', 'Core Terminology'],
              duration: '2 weeks',
              completed: false
            },
            {
              id: 2,
              title: 'Intermediate Concepts',
              lessons: ['Advanced Topics', 'Practical Applications', 'Real-world Examples'],
              duration: '3 weeks',
              completed: false
            },
            {
              id: 3,
              title: 'Advanced Mastery',
              lessons: ['Expert Techniques', 'Complex Problems', 'Industry Best Practices'],
              duration: '3 weeks',
              completed: false
            },
            {
              id: 4,
              title: 'Final Project',
              lessons: ['Capstone Project', 'Portfolio Creation', 'Peer Review'],
              duration: '2 weeks',
              completed: false
            }
          ],
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getUserPaths(userId: string) {
    try {
      const { data, error } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

// Chat service
export const chatService = {
  async saveMessage(userId: string, message: { type: 'user' | 'assistant'; content: string }) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          type: message.type,
          content: message.content,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getChatHistory(userId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

// Quiz service
export const quizService = {
  async saveQuiz(userId: string, quiz: any) {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .insert({
          user_id: userId,
          title: quiz.title,
          questions: quiz.questions,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getUserQuizzes(userId: string) {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};