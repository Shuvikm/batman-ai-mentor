import React, { useState } from 'react';
import {
  Shield, BookOpen, Users, MessageSquare, Upload, Youtube,
  TrendingUp, LogOut, Brain, Target, Zap,
  Calendar, Award, Menu, X
} from 'lucide-react';
import LearningPaths from './features/LearningPaths';
import ImprovedChatAssistant from './features/ImprovedChatAssistant';
import StudyMaterials from './features/StudyMaterials';
import SimpleQuizGenerator from './features/SimpleQuizGenerator';
import EnhancedQuizGenerator from './features/EnhancedQuizGenerator';
import EnhancedMindmapGenerator from './features/EnhancedMindmapGenerator';
import BookingSession from './features/BookingSession';
import BatmanLogo from './ui/BatmanLogo';

interface DashboardProps {
  user: {
    id: string;
    email: string;
    username: string;
    level: number;
    points: number;
  };
  onLogout: () => void;
  onNavigateToTeacher?: () => void;
  onNavigateToSessions?: () => void;
}

type ActiveFeature = 'overview' | 'learning-paths' | 'chat' | 'study-materials' | 'quiz' | 'enhanced-quiz' | 'mindmap' | 'career' | 'youtube' | 'meetings' | 'teacher' | 'sessions';

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  onLogout, 
  onNavigateToTeacher, 
  onNavigateToSessions 
}) => {
  const [activeFeature, setActiveFeature] = useState<ActiveFeature>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const features = [
    { id: 'overview', icon: Shield, label: 'Command Center', description: 'Your learning hub overview' },
    { id: 'learning-paths', icon: Brain, label: 'Learning Paths', description: 'AI-generated learning journeys' },
    { id: 'mindmap', icon: Target, label: 'Learning Mindmaps', description: 'Visual learning path generation' },
    { id: 'chat', icon: MessageSquare, label: 'AI Assistant', description: 'Chat with enhanced search features' },
    { id: 'study-materials', icon: BookOpen, label: 'Study Materials', description: 'Find resources and materials' },
    { id: 'quiz', icon: Upload, label: 'Quiz Generator', description: 'Generate quizzes from documents' },
    { id: 'enhanced-quiz', icon: Zap, label: 'AI Quiz Creator', description: 'Generate quizzes for any subject' },
    { id: 'career', icon: Target, label: 'Career Guide', description: 'Get career recommendations' },
    { id: 'youtube', icon: Youtube, label: 'Video Summaries', description: 'Summarize YouTube videos' },
    { id: 'meetings', icon: Users, label: '1-on-1 Sessions', description: 'Schedule mentoring sessions' },
    { id: 'teacher', icon: Award, label: 'Become Teacher', description: 'Teach and earn money' },
    { id: 'sessions', icon: Calendar, label: 'My Sessions', description: 'Manage your sessions' }
  ];

  const renderActiveFeature = () => {
    switch (activeFeature) {
      case 'learning-paths':
        return <LearningPaths user={user} />;
      case 'mindmap':
        return <EnhancedMindmapGenerator />;
      case 'chat':
        return <ImprovedChatAssistant user={user} />;
      case 'study-materials':
        return <StudyMaterials user={user} />;
      case 'quiz':
        return <SimpleQuizGenerator />;
      case 'enhanced-quiz':
        return <EnhancedQuizGenerator />;
      case 'meetings':
        return <BookingSession />;
      case 'teacher':
        if (onNavigateToTeacher) {
          onNavigateToTeacher();
          return null;
        }
        return <div className="text-white">Teacher dashboard loading...</div>;
      case 'sessions':
        if (onNavigateToSessions) {
          onNavigateToSessions();
          return null;
        }
        return <div className="text-white">Sessions loading...</div>;
      default:
        return <OverviewContent user={user} onNavigateToTeacher={onNavigateToTeacher} onNavigateToSessions={onNavigateToSessions} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <header className="bg-black bg-opacity-80 backdrop-blur-sm border-b border-yellow-400 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <BatmanLogo size="medium" />
              <div className="bg-yellow-400 p-2 rounded-full">
                <Shield className="w-6 h-6 text-black" />
              </div>
              <h1 className="text-2xl font-bold text-white batman-title">AI MENTOR</h1>
              <BatmanLogo size="medium" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {features.slice(0, 4).map((feature) => {
                const Icon = feature.icon;
                return (
                  <button
                    key={feature.id}
                    onClick={() => setActiveFeature(feature.id as ActiveFeature)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      activeFeature === feature.id
                        ? 'bg-yellow-400 text-black'
                        : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{feature.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* User Info and Controls */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                <BatmanLogo size="small" />
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{user.username}</p>
                  <p className="text-xs text-yellow-400">Level {user.level} • {user.points} XP</p>
                </div>
              </div>
              
              <button
                onClick={onLogout}
                className="text-gray-300 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-gray-300 hover:text-yellow-400 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-black bg-opacity-95 border-t border-yellow-400">
            <div className="px-4 py-3 space-y-2">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <button
                    key={feature.id}
                    onClick={() => {
                      setActiveFeature(feature.id as ActiveFeature);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                      activeFeature === feature.id
                        ? 'bg-yellow-400 text-black'
                        : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium">{feature.label}</p>
                      <p className="text-xs opacity-75">{feature.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveFeature()}
      </main>
    </div>
  );
};

// Overview Content Component
const OverviewContent: React.FC<{ 
  user: any; 
  onNavigateToTeacher?: () => void; 
  onNavigateToSessions?: () => void; 
}> = ({ user, onNavigateToTeacher, onNavigateToSessions }) => {
  const stats = [
    { label: 'Learning Paths Completed', value: '12', icon: Brain, color: 'text-blue-400' },
    { label: 'Study Sessions', value: '48', icon: BookOpen, color: 'text-green-400' },
    { label: 'Quizzes Taken', value: '24', icon: Award, color: 'text-purple-400' },
    { label: 'Current Streak', value: '7 days', icon: Zap, color: 'text-yellow-400' },
  ];

  const recentActivities = [
    { action: 'Completed', item: 'JavaScript Advanced Concepts', time: '2 hours ago', type: 'learning' },
    { action: 'Generated Quiz', item: 'React Hooks Document', time: '1 day ago', type: 'quiz' },
    { action: 'Chat Session', item: 'Career Guidance Discussion', time: '2 days ago', type: 'chat' },
    { action: 'Study Materials', item: 'Machine Learning Resources', time: '3 days ago', type: 'study' }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="comic-panel p-8 text-center">
        <img 
          src="https://images.pexels.com/photos/159823/bat-bats-batman-logo-159823.jpeg?auto=compress&cs=tinysrgb&w=400" 
          alt="Batman Logo" 
          className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-yellow-400 object-cover"
        />
        <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user.username}!</h2>
        <p className="text-gray-300 text-lg">Ready to continue your hero training?</p>
        <div className="mt-6 flex justify-center items-center space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">Level {user.level}</div>
            <div className="text-sm text-gray-400">Current Level</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{user.points}</div>
            <div className="text-sm text-gray-400">Total XP</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">85%</div>
            <div className="text-sm text-gray-400">Progress</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="dashboard-card p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 ${stat.color}`} />
                <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
              </div>
              <p className="text-gray-300 text-sm font-medium">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="dashboard-card p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 text-yellow-400 mr-2" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-800 bg-opacity-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white font-medium">
                    {activity.action} <span className="text-yellow-400">{activity.item}</span>
                  </p>
                  <p className="text-gray-400 text-sm">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Zap className="w-6 h-6 text-yellow-400 mr-2" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <Brain className="w-5 h-5" />
              <span>Generate Learning Path</span>
            </button>
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Start AI Chat</span>
            </button>
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Upload for Quiz</span>
            </button>
            <button 
              onClick={onNavigateToSessions}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Calendar className="w-5 h-5" />
              <span>Book 1-on-1 Session</span>
            </button>
            <button 
              onClick={onNavigateToTeacher}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Award className="w-5 h-5" />
              <span>Become a Teacher</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;