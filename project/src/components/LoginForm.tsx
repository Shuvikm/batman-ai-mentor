import React, { useState } from 'react';
import { Mail, Lock, Shield, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onSwitchToSignup: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await onLogin(email, password);
    
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="auth-form p-8 w-full max-w-md fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="bg-yellow-400 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Shield className="w-8 h-8 text-black" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2 font-orbitron">ACCESS GRANTED</h2>
        <p className="text-gray-400">Enter the Batcave Learning Hub</p>
      </div>

      {error && (
        <div className="bg-red-900 bg-opacity-50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="batman-input w-full pl-12 pr-4 py-3 rounded-lg focus:outline-none"
              placeholder="bruce.wayne@waynetech.com"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="batman-input w-full pl-12 pr-12 py-3 rounded-lg focus:outline-none"
              placeholder="Enter your secret password"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="batman-button w-full py-3 px-6 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
              <span>Accessing Batcave...</span>
            </div>
          ) : (
            'ENTER THE BATCAVE'
          )}
        </button>
      </form>

      {/* Demo Credentials */}
      <div className="mt-6 p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-600">
        <h4 className="text-sm font-medium text-yellow-400 mb-2">Demo Credentials:</h4>
        <div className="text-xs text-gray-300 space-y-1">
          <div>Email: demo@waynetech.com</div>
          <div>Password: batman123</div>
        </div>
      </div>

      {/* Switch to Signup */}
      <div className="mt-8 text-center">
        <p className="text-gray-400 text-sm mb-4">
          New to Wayne Tech Learning Hub?
        </p>
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors duration-200 underline"
        >
          Create Your Hero Profile
        </button>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          Powered by Wayne Enterprises © 2025
        </p>
      </div>
    </div>
  );
};

export default LoginForm;