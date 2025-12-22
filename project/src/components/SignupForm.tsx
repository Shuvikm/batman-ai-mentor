import React, { useState } from 'react';
import { Mail, Lock, User, Shield, Eye, EyeOff } from 'lucide-react';

interface SignupFormProps {
  onSignup: (email: string, username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onSwitchToLogin: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSignup, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const result = await onSignup(formData.email, formData.username, formData.password);
    
    if (!result.success) {
      setError(result.error || 'Signup failed');
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
        <h2 className="text-3xl font-bold text-white mb-2 font-orbitron">JOIN THE LEAGUE</h2>
        <p className="text-gray-400">Create your hero profile and begin your journey</p>
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
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="batman-input w-full pl-12 pr-4 py-3 rounded-lg focus:outline-none"
              placeholder="your.email@waynetech.com"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Username Field */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
            Hero Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="batman-input w-full pl-12 pr-4 py-3 rounded-lg focus:outline-none"
              placeholder="YourHeroName"
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="batman-input w-full pl-12 pr-12 py-3 rounded-lg focus:outline-none"
              placeholder="Create a strong password"
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

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="batman-input w-full pl-12 pr-12 py-3 rounded-lg focus:outline-none"
              placeholder="Confirm your password"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="text-xs text-gray-400">
          By creating an account, you agree to Wayne Enterprises Terms of Service and acknowledge that you will use your powers responsibly.
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
              <span>Creating Hero Profile...</span>
            </div>
          ) : (
            'BEGIN YOUR HERO JOURNEY'
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="mt-8 text-center">
        <p className="text-gray-400 text-sm mb-4">
          Already have a Wayne Tech account?
        </p>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors duration-200 underline"
        >
          Access Your Batcave
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

export default SignupForm;