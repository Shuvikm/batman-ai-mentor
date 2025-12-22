import React, { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Star, BookOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface TeacherDashboardProps {
  user: any;
  onLogout: () => void;
}

interface Session {
  _id: string;
  student: {
    username: string;
    email: string;
  };
  subject: string;
  scheduledTime: string;
  duration: number;
  status: string;
  amount: number;
  paymentStatus: string;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    totalEarnings: 0,
    avgRating: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('batman_token');
      const response = await fetch('/api/teacher/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
        
        // Calculate stats
        const totalSessions = data.sessions.length;
        const completedSessions = data.sessions.filter((s: Session) => s.status === 'completed').length;
        const upcomingSessions = data.sessions.filter((s: Session) => s.status === 'confirmed' || s.status === 'pending').length;
        const totalEarnings = data.sessions
          .filter((s: Session) => s.paymentStatus === 'paid')
          .reduce((sum: number, s: Session) => sum + s.amount, 0);

        setStats({
          totalSessions,
          completedSessions,
          upcomingSessions,
          totalEarnings,
          avgRating: user.rating || 0
        });
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'confirmed': return 'text-blue-400';
      case 'pending': return 'text-yellow-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'confirmed': return <Calendar className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'sessions', label: 'My Sessions', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: Users },
    { id: 'earnings', label: 'Earnings', icon: DollarSign }
  ];

  if (!user.isApproved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-black flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-gray-800/50 border border-yellow-500 rounded-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Account Pending Approval</h2>
            <p className="text-gray-300 mb-6">
              Thank you for applying to become a teacher at Wayne Tech Academy! 
              Your account is currently under review by our admin team.
            </p>
            <p className="text-gray-400 text-sm mb-6">
              You'll receive an email notification once your account is approved and you can start teaching.
            </p>
            <button
              onClick={onLogout}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-black">
      {/* Header */}
      <div className="bg-black/50 border-b border-green-500/30 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Teacher Dashboard</h1>
              <p className="text-gray-400">Welcome back, {user.username}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Sessions</p>
                <p className="text-2xl font-bold text-white">{stats.totalSessions}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-2xl font-bold text-green-400">{stats.completedSessions}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Upcoming</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.upcomingSessions}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold text-green-400">${stats.totalEarnings}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Rating</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.avgRating.toFixed(1)}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg">
          <div className="border-b border-gray-700">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-400'
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white">Teaching Overview</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-white mb-4">Recent Sessions</h4>
                    <div className="space-y-3">
                      {sessions.slice(0, 3).map((session) => (
                        <div key={session._id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                          <div>
                            <p className="text-white font-medium">{session.subject}</p>
                            <p className="text-gray-400 text-sm">with {session.student.username}</p>
                          </div>
                          <div className={`flex items-center space-x-1 ${getStatusColor(session.status)}`}>
                            {getStatusIcon(session.status)}
                            <span className="text-sm capitalize">{session.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-white mb-4">Your Profile</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm">Specializations</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {user.specializations?.map((spec: string, index: number) => (
                            <span key={index} className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Hourly Rate</p>
                        <p className="text-white font-medium">${user.hourlyRate}/hour</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Total Sessions</p>
                        <p className="text-white font-medium">{user.totalSessions || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sessions' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white">My Sessions</h3>
                
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Loading sessions...</p>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No sessions scheduled yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div key={session._id} className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-white">{session.subject}</h4>
                            <p className="text-gray-400">Student: {session.student.username}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(session.scheduledTime).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`flex items-center space-x-1 ${getStatusColor(session.status)} mb-2`}>
                              {getStatusIcon(session.status)}
                              <span className="text-sm capitalize">{session.status}</span>
                            </div>
                            <p className="text-green-400 font-semibold">${session.amount}</p>
                            <p className="text-xs text-gray-500">{session.duration} minutes</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            session.paymentStatus === 'paid' 
                              ? 'bg-green-600/20 text-green-300' 
                              : 'bg-yellow-600/20 text-yellow-300'
                          }`}>
                            Payment: {session.paymentStatus}
                          </span>
                          
                          {session.status === 'confirmed' && (
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                              Join Session
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white">Teacher Profile</h3>
                <div className="bg-gray-900/50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium text-white mb-4">Basic Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-gray-400 text-sm">Username</label>
                          <p className="text-white">{user.username}</p>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Email</label>
                          <p className="text-white">{user.email}</p>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Hourly Rate</label>
                          <p className="text-white">${user.hourlyRate}/hour</p>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">Rating</label>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-white">{user.rating || 0}/5</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-white mb-4">Specializations</h4>
                      <div className="flex flex-wrap gap-2">
                        {user.specializations?.map((spec: string, index: number) => (
                          <span key={index} className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {user.bio && (
                    <div className="mt-6">
                      <h4 className="text-lg font-medium text-white mb-2">Bio</h4>
                      <p className="text-gray-300">{user.bio}</p>
                    </div>
                  )}

                  {user.experience && (
                    <div className="mt-6">
                      <h4 className="text-lg font-medium text-white mb-2">Experience</h4>
                      <p className="text-gray-300">{user.experience}</p>
                    </div>
                  )}

                  <div className="mt-6">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'earnings' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white">Earnings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-900/50 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-white mb-2">Total Earnings</h4>
                    <p className="text-3xl font-bold text-green-400">${stats.totalEarnings}</p>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-white mb-2">This Month</h4>
                    <p className="text-3xl font-bold text-blue-400">$0</p>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-white mb-2">Average per Session</h4>
                    <p className="text-3xl font-bold text-purple-400">
                      ${stats.completedSessions > 0 ? (stats.totalEarnings / stats.completedSessions).toFixed(0) : 0}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-white mb-4">Recent Payments</h4>
                  <div className="space-y-3">
                    {sessions
                      .filter(s => s.paymentStatus === 'paid')
                      .slice(0, 5)
                      .map((session) => (
                        <div key={session._id} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                          <div>
                            <p className="text-white">{session.subject}</p>
                            <p className="text-gray-400 text-sm">
                              {new Date(session.scheduledTime).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-green-400 font-semibold">+${session.amount}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;