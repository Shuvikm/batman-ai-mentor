// MongoDB-based service layer for Batman AI Mentor
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Utility function to make API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('batman_token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Database types
export interface User {
  id: string;
  email: string;
  username: string;
  level: number;
  points: number;
  role: 'student' | 'teacher' | 'admin';
  isApproved?: boolean;
  specializations?: string[];
  hourlyRate?: number;
  bio?: string;
  experience?: string;
  rating?: number;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
  message?: string;
  redirectTo?: string;
}

// Auth functions
export const authService = {
  async signUp(email: string, username: string, password: string, role: string = 'student'): Promise<AuthResponse> {
    try {
      const response = await apiCall('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, username, password, role }),
      });

      if (response.success && response.token) {
        localStorage.setItem('batman_token', response.token);
        return { 
          success: true, 
          user: response.user,
          token: response.token,
          message: response.message
        };
      }

      return { success: false, error: response.error || 'Registration failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  },

  async signUpTeacher(teacherData: {
    email: string;
    username: string;
    password: string;
    specializations: string[];
    hourlyRate: number;
    bio: string;
    experience: string;
    qualifications: string[];
  }): Promise<AuthResponse> {
    try {
      const response = await apiCall('/api/auth/register-teacher', {
        method: 'POST',
        body: JSON.stringify(teacherData),
      });

      if (response.success && response.token) {
        localStorage.setItem('batman_token', response.token);
        return { 
          success: true, 
          user: response.user,
          token: response.token,
          message: response.message
        };
      }

      return { success: false, error: response.error || 'Teacher registration failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Teacher registration failed' };
    }
  },

  async signIn(email: string, password: string, role?: string): Promise<AuthResponse> {
    try {
      const loginData: any = { email, password };
      if (role) loginData.role = role;

      const response = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginData),
      });

      if (response.success && response.token) {
        localStorage.setItem('batman_token', response.token);
        return { 
          success: true, 
          user: response.user,
          token: response.token,
          redirectTo: response.redirectTo
        };
      }

      return { success: false, error: response.error || 'Login failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  },

  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      localStorage.removeItem('batman_token');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const token = localStorage.getItem('batman_token');
      if (!token) {
        return { success: false, error: 'No token found' };
      }

      const response = await apiCall('/api/auth/me');
      
      if (response.success && response.user) {
        return { success: true, user: response.user };
      }

      return { success: false, error: response.error || 'Failed to get user' };
    } catch (error: any) {
      localStorage.removeItem('batman_token'); // Clear invalid token
      return { success: false, error: error.message || 'Session expired' };
    }
  },

  // Subscribe to auth changes (mock implementation for compatibility)
  onAuthStateChange(callback: (user: User | null) => void) {
    // Check for existing token on page load
    const checkAuth = async () => {
      const result = await this.getCurrentUser();
      callback(result.success ? result.user! : null);
    };

    checkAuth();

    // Return a mock subscription object
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            // Mock unsubscribe
          }
        }
      }
    };
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('batman_token');
  }
};

// Learning paths service
export const learningPathsService = {
  async generatePath(formData: { 
    topic: string; 
    level: string; 
    timeAvailable: string; 
    goals: string; 
    userId?: string; 
  }) {
    try {
      const response = await apiCall('/api/learning-paths', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getUserPaths() {
    try {
      const response = await apiCall('/api/learning-paths');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

// Chat service
export const chatService = {
  async saveMessage(_userId: string, message: { type: 'user' | 'assistant'; content: string }) {
    try {
      const response = await apiCall('/api/chat/messages', {
        method: 'POST',
        body: JSON.stringify(message),
      });

      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getChatHistory(_userId: string, limit: number = 50) {
    try {
      const response = await apiCall(`/api/chat/messages?limit=${limit}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // AI Chat service
  async sendMessage(message: string) {
    try {
      const response = await apiCall('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });

      return { success: true, response: response.response, messageId: response.messageId };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Enhanced AI Chat with search integration
  async sendEnhancedMessage(message: string, searchTopics?: string[]) {
    try {
      const response = await apiCall('/api/chat/enhanced', {
        method: 'POST',
        body: JSON.stringify({ message, searchTopics }),
      });

      return { 
        success: true, 
        response: response.data.response, 
        userMessage: response.data.userMessage,
        botMessage: response.data.botResponse
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Get chatbot search configuration
  async getSearchConfig() {
    try {
      const response = await apiCall('/api/chat/search-config');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

// Search services
export const searchService = {
  // YouTube search
  async searchYouTube(query: string, maxResults: number = 10) {
    try {
      const response = await apiCall(`/api/search/youtube?q=${encodeURIComponent(query)}&maxResults=${maxResults}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // News search
  async searchNews(query: string, pageSize: number = 10) {
    try {
      const response = await apiCall(`/api/search/news?q=${encodeURIComponent(query)}&pageSize=${pageSize}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

// Quiz service
export const quizService = {
  async saveQuiz(_userId: string, quiz: any) {
    try {
      const response = await apiCall('/api/quizzes', {
        method: 'POST',
        body: JSON.stringify(quiz),
      });

      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getUserQuizzes(_userId: string) {
    try {
      const response = await apiCall('/api/quizzes');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async submitQuizResult(quizResult: {
    quizId: string;
    score: number;
    totalQuestions: number;
    timeTaken: number;
    answers: any[];
  }) {
    try {
      const response = await apiCall('/api/quiz-results', {
        method: 'POST',
        body: JSON.stringify(quizResult),
      });

      return { success: true, data: response.data, pointsEarned: response.pointsEarned };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

// Health check service
export const healthService = {
  async checkAPI() {
    try {
      const response = await apiCall('/api/health');
      return { success: true, data: response };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

// Export all services for backward compatibility
export default {
  authService,
  learningPathsService,
  chatService,
  searchService,
  quizService,
  healthService
};