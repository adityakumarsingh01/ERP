import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success) {
        login(data.data.token, data.data.user);
        window.location.href = '/';
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] p-4 font-sans text-slate-900">
      <div className="max-w-md w-full border-2 border-slate-900 p-8 sm:p-12 bg-white shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
        <div className="mb-10">
          <h2 className="text-4xl font-black tracking-tighter uppercase mb-2">FUNDSROOM.</h2>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Operations Portal</p>
        </div>
        
        {error && (
          <div className="bg-rose-100 text-rose-700 p-4 border-2 border-rose-700 mb-8 font-bold text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-900 text-xs font-bold uppercase tracking-wider mb-2">Email</label>
            <input 
              type="email" 
              className="w-full p-4 border-2 border-slate-900 bg-slate-50 focus:outline-none focus:bg-white focus:ring-0 transition-colors rounded-none font-medium" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@fundsroom.com"
              required
            />
          </div>
          <div>
            <label className="block text-slate-900 text-xs font-bold uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              className="w-full p-4 border-2 border-slate-900 bg-slate-50 focus:outline-none focus:bg-white focus:ring-0 transition-colors rounded-none font-medium" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-slate-900 text-white font-bold py-4 px-4 border-2 border-slate-900 hover:bg-white hover:text-slate-900 transition-colors uppercase tracking-widest text-sm mt-4"
          >
            Authenticate
          </button>
        </form>
        
        <div className="mt-12 pt-8 border-t-2 border-slate-100">
          <p className="font-bold text-slate-900 text-xs uppercase tracking-widest mb-4">Demo Access</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-slate-500 w-24">Admin</span>
              <span className="font-mono text-xs">admin@fundsroom.com</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-slate-500 w-24">Sales</span>
              <span className="font-mono text-xs">sales@fundsroom.com</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-slate-500 w-24">Warehouse</span>
              <span className="font-mono text-xs">warehouse@fundsroom.com</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-slate-500 w-24">Accounts</span>
              <span className="font-mono text-xs">accounts@fundsroom.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
