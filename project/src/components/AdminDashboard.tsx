import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, Calendar, DollarSign, CheckCircle, XCircle, Eye, Settings } from 'lucide-react';

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
}

interface PendingTeacher {
  _id: string;
  username: string;
  email: string;
  specializations: string[];
  hourlyRate: number;
  bio: string;
  experience: string;
  qualifications: string[];
  createdAt: string;
}

interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  pendingTeachers: number;
  totalSessions: number;
  totalRevenue: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingTeachers, setPendingTeachers] = useState<PendingTeacher[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    pendingTeachers: 0,
    totalSessions: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPendingTeachers();
    loadDashboardStats();
  }, []);

  const loadPendingTeachers = async () => {
    try {
      const token = localStorage.getItem('batman_token');
      const response = await fetch('/api/admin/teachers/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPendingTeachers(data.teachers || []);
        setStats(prev => ({ ...prev, pendingTeachers: data.count || 0 }));
      }
    } catch (error) {
      console.error('Error loading pending teachers:', error);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const token = localStorage.getItem('batman_token');
      
      // Load users stats
      const usersResponse = await fetch('/api/admin/users?limit=1', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setStats(prev => ({ 
          ...prev, 
          totalUsers: usersData.pagination?.totalUsers || 0 
        }));
      }

      // Load sessions stats
      const sessionsResponse = await fetch('/api/admin/sessions?limit=1', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setStats(prev => ({ 
          ...prev, 
          totalSessions: sessionsData.pagination?.totalSessions || 0 
        }));
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const handleTeacherApproval = async (teacherId: string, approved: boolean) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('batman_token');
      const response = await fetch(`/api/admin/teachers/${teacherId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approved })
      });

      if (response.ok) {
        // Remove from pending list
        setPendingTeachers(prev => prev.filter(teacher => teacher._id !== teacherId));
        setStats(prev => ({ ...prev, pendingTeachers: prev.pendingTeachers - 1 }));
        
        alert(`Teacher ${approved ? 'approved' : 'rejected'} successfully!`);
      } else {
        alert('Failed to update teacher status');
      }
    } catch (error) {
      console.error('Error updating teacher status:', error);
      alert('Error updating teacher status');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'teachers', label: 'Teacher Approvals', icon: Users },
    { id: 'sessions', label: 'Sessions', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black">
      {/* Header */}
      <div className="bg-black/50 border-b border-red-500/30 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400">Welcome back, {user.username}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Teachers</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.pendingTeachers}</p>
              </div>
              <GraduationCap className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Sessions</p>
                <p className="text-2xl font-bold text-green-400">{stats.totalSessions}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Platform Revenue</p>
                <p className="text-2xl font-bold text-purple-400">${stats.totalRevenue}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-400" />
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
                        ? 'border-red-500 text-red-400'
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
                <h3 className="text-xl font-semibold text-white">Platform Overview</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-white mb-4">Recent Activity</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-gray-300 text-sm">New student registered</span>
                        <span className="text-gray-500 text-xs">2 min ago</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-gray-300 text-sm">Teacher application received</span>
                        <span className="text-gray-500 text-xs">5 min ago</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-gray-300 text-sm">Session completed</span>
                        <span className="text-gray-500 text-xs">10 min ago</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-white mb-4">Quick Actions</h4>
                    <div className="space-y-3">
                      <button
                        onClick={() => setActiveTab('teachers')}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors text-left"
                      >
                        Review Pending Teachers ({stats.pendingTeachers})
                      </button>
                      <button
                        onClick={() => setActiveTab('sessions')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-left"
                      >
                        Manage Sessions
                      </button>
                      <button
                        onClick={() => setActiveTab('settings')}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-left"
                      >
                        Platform Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'teachers' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-white">Teacher Approvals</h3>
                  <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm">
                    {pendingTeachers.length} Pending
                  </span>
                </div>

                {pendingTeachers.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <p className="text-gray-400">No pending teacher applications</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingTeachers.map((teacher) => (
                      <div key={teacher._id} className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-white">{teacher.username}</h4>
                            <p className="text-gray-400">{teacher.email}</p>
                            <p className="text-sm text-gray-500">Applied: {new Date(teacher.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-green-400 font-semibold">${teacher.hourlyRate}/hour</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-300 mb-2">Specializations</h5>
                            <div className="flex flex-wrap gap-2">
                              {teacher.specializations.map((spec, index) => (
                                <span key={index} className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs">
                                  {spec}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h5 className="text-sm font-medium text-gray-300 mb-2">Qualifications</h5>
                            <div className="flex flex-wrap gap-2">
                              {teacher.qualifications.map((qual, index) => (
                                <span key={index} className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded text-xs">
                                  {qual}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-300 mb-2">Experience</h5>
                          <p className="text-gray-400 text-sm">{teacher.experience}</p>
                        </div>

                        {teacher.bio && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-gray-300 mb-2">Bio</h5>
                            <p className="text-gray-400 text-sm">{teacher.bio}</p>
                          </div>
                        )}

                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleTeacherApproval(teacher._id, true)}
                            disabled={loading}
                            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleTeacherApproval(teacher._id, false)}
                            disabled={loading}
                            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sessions' && (
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Session management coming soon...</p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="text-center py-8">
                <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Platform settings coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;