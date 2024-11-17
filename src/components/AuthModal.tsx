import React, { useState } from 'react';
import { registerUser, signIn, resetPassword } from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        await resetPassword(email);
        setResetSuccess(true);
      } else if (isLogin) {
        await signIn(email, password);
        onSuccess();
        onClose();
      } else {
        await registerUser(email, password, username);
        setRegistrationSuccess(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleBack = () => {
    setIsForgotPassword(false);
    setError('');
    setResetSuccess(false);
  };

  if (registrationSuccess) {
    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={handleModalClick}
      >
        <div className="bg-white rounded-lg p-8 max-w-[400px] w-full text-center">
          <h2 className="text-3xl font-bold mb-6">Registration Successful!</h2>
          <p className="mb-6 text-lg">
            Please check your email to verify your account. You may need to check your spam folder.
          </p>
          <button
            onClick={() => {
              setRegistrationSuccess(false);
              onClose();
            }}
            className="bg-indigo-600 text-white px-8 py-3 rounded-md hover:bg-indigo-700 text-lg font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (isForgotPassword) {
    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={handleModalClick}
      >
        <div className="bg-white rounded-lg p-8 max-w-[400px] w-full">
          <h2 className="text-3xl font-bold mb-6">Reset Password</h2>
          
          {resetSuccess ? (
            <div className="text-center">
              <p className="text-lg mb-6">
                If an account exists with this email, you will receive password reset instructions.
              </p>
              <button
                onClick={onClose}
                className="bg-indigo-600 text-white px-8 py-3 rounded-md hover:bg-indigo-700 text-lg font-semibold"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg p-3"
                  required
                />
              </div>

              {error && (
                <p className="text-red-500 text-base">{error}</p>
              )}

              <div className="flex flex-col space-y-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 disabled:opacity-50 text-lg font-semibold"
                >
                  {loading ? 'Loading...' : 'Send Reset Link'}
                </button>
                
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-indigo-600 hover:text-indigo-800 text-base font-medium"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleModalClick}
    >
      <div className="bg-white rounded-lg p-8 max-w-[400px] w-full">
        <h2 className="text-3xl font-bold mb-6">
          {isLogin ? 'Login' : 'Register'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg p-3"
                required
                minLength={3}
                maxLength={20}
              />
            </div>
          )}
          
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg p-3"
              required
            />
          </div>
          
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg p-3"
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-red-500 text-base">{error}</p>
          )}

          <div className="flex flex-col space-y-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 disabled:opacity-50 text-lg font-semibold"
            >
              {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
            </button>
            
            <div className="flex flex-col space-y-2">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-indigo-600 hover:text-indigo-800 text-base font-medium"
              >
                {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
              </button>
              
              {isLogin && (
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  Forgot password?
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}