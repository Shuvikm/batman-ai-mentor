import { useState, useEffect } from 'react';
import { Shield, Bot, BookOpen, Trophy, Users, MessageSquare, Upload, Youtube, TrendingUp, Star } from 'lucide-react';
import LoginForm from './components/LoginForm';
import RoleBasedSignup from './components/RoleBasedSignup';
import Dashboard from './components/Dashboard';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';
import SessionBooking from './components/SessionBooking';
import { authService, User } from './lib/mongodb';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'login' | 'signup' | 'dashboard' | 'teacher-dashboard' | 'admin-dashboard' | 'sessions' | 'video-call'>('login');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const result = await authService.getCurrentUser();
        if (result.success && result.user) {
          setUser(result.user);
          // Role-based navigation on session restore
          if (result.user.role === 'admin') {
            setCurrentView('admin-dashboard');
          } else if (result.user.role === 'teacher') {
            setCurrentView('teacher-dashboard');
          } else {
            setCurrentView('dashboard');
          }
        }
      } catch (error) {
        console.error('Session check failed - using demo mode:', error);
        // Fallback to demo mode if database tables don't exist
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Subscribe to auth changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user);
      if (user) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const result = await authService.signIn(email, password);
    
    if (result.success && result.user) {
      setUser(result.user);
      // Role-based navigation
      if (result.user.role === 'admin') {
        setCurrentView('admin-dashboard');
      } else if (result.user.role === 'teacher') {
        setCurrentView('teacher-dashboard');
      } else {
        setCurrentView('dashboard');
      }
    }
    
    return result;
  };



  const handleLogout = async () => {
    const result = await authService.signOut();
    if (result.success) {
      setUser(null);
      setCurrentView('login');
    } else {
      console.error('Logout failed:', result.error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="batman-loading">
          <div className="batman-symbol animate-pulse">
            <Shield className="w-16 h-16 text-yellow-400" />
          </div>
          <p className="text-yellow-400 mt-4 text-xl font-bold">Initializing Wayne Tech Systems...</p>
        </div>
      </div>
    );
  }

  // Navigation functions
  const navigateToTeacherDashboard = () => setCurrentView('teacher-dashboard');
  const navigateToSessions = () => setCurrentView('sessions');
  const navigateToMainDashboard = () => setCurrentView('dashboard');

  // Render appropriate view
  if (currentView === 'dashboard' && user) {
    return (
      <Dashboard 
        user={user} 
        onLogout={handleLogout}
        onNavigateToTeacher={navigateToTeacherDashboard}
        onNavigateToSessions={navigateToSessions}
      />
    );
  }

  if (currentView === 'teacher-dashboard' && user) {
    return (
      <TeacherDashboard 
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  if (currentView === 'admin-dashboard' && user) {
    return (
      <AdminDashboard 
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  if (currentView === 'sessions' && user) {
    return (
      <div className="min-h-screen bg-gray-900">
        <nav className="bg-gray-800 p-4 flex justify-between items-center">
          <button
            onClick={navigateToMainDashboard}
            className="text-yellow-400 hover:text-yellow-300 flex items-center"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </nav>
        <SessionBooking />
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Batman Background */}
      <div className="absolute inset-0 opacity-10">
        <img 
          src="https://images.pexels.com/photos/4553618/pexels-photo-4553618.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080" 
          alt="Gotham City" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Floating Batman Elements */}
      <div className="absolute top-10 right-10 opacity-20">
        <Shield className="w-32 h-32 text-yellow-400 animate-pulse" />
      </div>
      
      <div className="absolute bottom-10 left-10 opacity-20">
        <Bot className="w-24 h-24 text-yellow-400 animate-bounce" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Hero Content */}
          <div className="text-center md:text-left space-y-6">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-6">
              <div className="bg-yellow-400 p-3 rounded-full">
                <Shield className="w-8 h-8 text-black" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white batman-title">
                AI MENTOR
              </h1>
            </div>
            
            <div className="bg-black bg-opacity-50 p-6 rounded-lg border border-yellow-400 backdrop-blur-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-4">
                BECOME THE HERO OF YOUR LEARNING JOURNEY
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Gotham's most advanced AI-powered learning platform. Master new skills with the precision of a Dark Knight.
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">AI Learning Paths</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">AI Chat Assistant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">Gamification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Youtube className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">Video Summaries</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">Quiz Generation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">1-on-1 Sessions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Forms */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              {currentView === 'login' && (
                <LoginForm
                  onLogin={handleLogin}
                  onSwitchToSignup={() => setCurrentView('signup')}
                />
              )}
              
              {currentView === 'signup' && (
                <RoleBasedSignup
                  onSignupSuccess={(user, token) => {
                    setUser(user);
                    localStorage.setItem('batman_token', token);
                    // Role-based navigation after signup
                    if (user.role === 'admin') {
                      setCurrentView('admin-dashboard');
                    } else if (user.role === 'teacher') {
                      setCurrentView('teacher-dashboard');  
                    } else {
                      setCurrentView('dashboard');
                    }
                  }}
                  onSwitchToLogin={() => setCurrentView('login')}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Features */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 hidden lg:flex space-x-8">
        <div className="bg-black bg-opacity-70 p-4 rounded-lg border border-yellow-400 backdrop-blur-sm">
          <TrendingUp className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <p className="text-white text-sm text-center">Progress Tracking</p>
        </div>
        <div className="bg-black bg-opacity-70 p-4 rounded-lg border border-yellow-400 backdrop-blur-sm">
          <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <p className="text-white text-sm text-center">Achievement System</p>
        </div>
        <div className="bg-black bg-opacity-70 p-4 rounded-lg border border-yellow-400 backdrop-blur-sm">
          <Bot className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <p className="text-white text-sm text-center">AI Powered</p>
        </div>
      </div>
    </div>
  );
}

export default App;