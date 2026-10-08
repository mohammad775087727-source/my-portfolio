import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import api from '../api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/admin/login', { username, password });
      localStorage.setItem('token', res.data.access_token);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-950 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>

      <form onSubmit={handleLogin} className="bg-gray-900/80 backdrop-blur-xl p-10 rounded-3xl w-full max-w-md border border-gray-800 shadow-2xl relative z-10">
        <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-blue-500/20 shadow-lg shadow-blue-500/10">
          <Lock size={32} />
        </div>
        <h2 className="text-3xl font-bold mb-8 text-center text-white">تسجيل دخول </h2>

        {error && <div className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-6 text-sm text-center border border-red-500/20">{error}</div>}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">اسم المستخدم</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            required
            dir="ltr"
            placeholder="admin"
          />
        </div>
        <div className="mb-10">
          <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">كلمة المرور</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            required
            dir="ltr"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? 'جاري التحقق...' : 'دخول للوحة التحكم'}
        </button>
      </form>
    </div>
  );
}
