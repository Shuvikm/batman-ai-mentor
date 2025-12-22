import React, { useState } from 'react';
import { Mail, Lock, User, GraduationCap, Users, Shield, DollarSign, FileText } from 'lucide-react';
import { authService } from '../lib/mongodb';

interface RoleBasedSignupProps {
  onSignupSuccess: (user: any, token: string) => void;
  onSwitchToLogin: () => void;
}

const RoleBasedSignup: React.FC<RoleBasedSignupProps> = ({ onSignupSuccess, onSwitchToLogin }) => {
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Common form data
  const [commonData, setCommonData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  // Teacher-specific form data
  const [teacherData, setTeacherData] = useState({
    specializations: '',
    hourlyRate: '',
    bio: '',
    experience: '',
    qualifications: ''
  });

  const userTypes = [
    { 
      id: 'student' as const, 
      label: 'Student', 
      icon: GraduationCap, 
      description: 'Learn with AI-powered mentorship and interactive courses',
      color: 'blue'
    },
    { 
      id: 'teacher' as const, 
      label: 'Teacher', 
      icon: Users, 
      description: 'Share your expertise and mentor students globally',
      color: 'green'
    },
    { 
      id: 'admin' as const, 
      label: 'Admin', 
      icon: Shield, 
      description: 'Manage platform operations and user accounts',
      color: 'red'
    }
  ];

  const handleCommonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommonData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleTeacherChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTeacherData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (commonData.password !== commonData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (commonData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      let result;

      if (selectedRole === 'teacher') {
        // Teacher registration with additional fields
        const teacherRegistrationData = {
          email: commonData.email,
          username: commonData.username,
          password: commonData.password,
          specializations: teacherData.specializations.split(',').map(s => s.trim()).filter(s => s),
          hourlyRate: parseFloat(teacherData.hourlyRate) || 0,
          bio: teacherData.bio,
          experience: teacherData.experience,
          qualifications: teacherData.qualifications.split(',').map(q => q.trim()).filter(q => q)
        };
        
        result = await authService.signUpTeacher(teacherRegistrationData);
      } else {
        // Student or Admin registration
        result = await authService.signUp(
          commonData.email,
          commonData.username,
          commonData.password,
          selectedRole
        );
      }

      if (result.success && result.user && result.token) {
        setSuccess(result.message || 'Registration successful!');
        setTimeout(() => {
          onSignupSuccess(result.user!, result.token!);
        }, 1500);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-black py-8">
      <div className="max-w-2xl w-full mx-4">
        <div className="batman-card p-8 rounded-2xl shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-yellow-400 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-black" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Join Wayne Tech Academy</h2>
            <p className="text-gray-400">Choose your role and start your journey</p>
          </div>

          {/* Role Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">I want to join as:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {userTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedRole(type.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedRole === type.id
                        ? 'border-yellow-400 bg-yellow-400/10'
                        : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${
                      selectedRole === type.id ? 'text-yellow-400' : 'text-gray-400'
                    }`} />
                    <h4 className={`font-semibold mb-1 ${
                      selectedRole === type.id ? 'text-yellow-400' : 'text-white'
                    }`}>
                      {type.label}
                    </h4>
                    <p className="text-sm text-gray-400">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-900/50 border border-green-500 rounded-lg">
              <p className="text-green-300 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={commonData.email}
                    onChange={handleCommonChange}
                    className="batman-input w-full pl-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  Username *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={commonData.username}
                    onChange={handleCommonChange}
                    className="batman-input w-full pl-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="Choose a username"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={commonData.password}
                    onChange={handleCommonChange}
                    className="batman-input w-full pl-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="Create a password"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={commonData.confirmPassword}
                    onChange={handleCommonChange}
                    className="batman-input w-full pl-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Teacher-specific fields */}
            {selectedRole === 'teacher' && (
              <div className="space-y-4 border-t border-gray-700 pt-6">
                <h4 className="text-lg font-semibold text-white">Teacher Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="specializations" className="block text-sm font-medium text-gray-300 mb-2">
                      Specializations (comma-separated) *
                    </label>
                    <input
                      type="text"
                      id="specializations"
                      name="specializations"
                      value={teacherData.specializations}
                      onChange={handleTeacherChange}
                      className="batman-input w-full py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="e.g., Python, Web Development, Mathematics"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-300 mb-2">
                      Hourly Rate ($USD)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        id="hourlyRate"
                        name="hourlyRate"
                        value={teacherData.hourlyRate}
                        onChange={handleTeacherChange}
                        className="batman-input w-full pl-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="50"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-300 mb-2">
                    Experience & Qualifications *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <textarea
                      id="experience"
                      name="experience"
                      value={teacherData.experience}
                      onChange={handleTeacherChange}
                      rows={3}
                      className="batman-input w-full pl-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                      placeholder="Describe your teaching experience, certifications, and qualifications..."
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
                    Professional Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={teacherData.bio}
                    onChange={handleTeacherChange}
                    rows={3}
                    className="batman-input w-full py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                    placeholder="Tell students about yourself, your teaching style, and what makes you unique..."
                  />
                </div>

                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-yellow-300 text-sm">
                    <strong>Note:</strong> Teacher accounts require admin approval before you can start teaching. 
                    You'll receive an email notification once your account is approved.
                  </p>
                </div>
              </div>
            )}

            {selectedRole === 'admin' && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-300 text-sm">
                  <strong>Admin Access:</strong> Admin accounts have full platform management capabilities. 
                  Please ensure you have proper authorization to create an admin account.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="batman-button w-full py-3 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                'Creating Account...'
              ) : (
                `Create ${userTypes.find(t => t.id === selectedRole)?.label} Account`
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleBasedSignup;