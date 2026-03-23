'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';

export function LoginScreen() {
  const { signIn } = useStore();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    const err = await signIn(email.trim());
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🔥</div>
          <h1 className="text-2xl font-bold text-white tracking-wide">TRAINFLOW</h1>
          <p className="text-sm text-gray-500 mt-1">你的健身与规划助手</p>
        </div>

        {sent ? (
          <div className="text-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <div className="text-3xl mb-3">📬</div>
            <p className="text-white font-medium mb-1">登录链接已发送</p>
            <p className="text-sm text-gray-500">请查收 <span className="text-gray-300">{email}</span> 的邮件，点击链接即可登录</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="输入你的邮箱"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white text-sm focus:outline-none focus:border-red-500 placeholder-gray-600"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
            >
              {loading ? '发送中...' : '发送登录链接'}
            </button>
            <p className="text-xs text-gray-600 text-center">
              无需注册，输入邮箱收到链接直接登录
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
