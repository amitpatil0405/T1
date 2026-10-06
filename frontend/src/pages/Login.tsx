import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, User, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Authentication failed');
      }

      const data = await res.json();
      login(data.user_id);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#151921] border border-[#2A303C] rounded-xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-blue-600/10 border border-blue-500/30 rounded-xl flex items-center justify-center mb-3">
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-100 tracking-tight">DeltaFox Terminal</h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Institutional Trading Suite</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-sm text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              User ID
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter User ID"
                className="w-full bg-[#0B0E14] border border-[#2A303C] rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-100 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0B0E14] border border-[#2A303C] rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-100 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {submitting ? 'Authenticating...' : 'Access Dashboard'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#2A303C]/50 text-center text-xs text-gray-500">
          Protected by DeltaFox End-to-End Encryption
        </div>
      </div>
    </div>
  );
};
