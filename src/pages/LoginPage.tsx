"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
import { Home } from '@/components/Icons';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (login(username, password)) {
      navigate('/');
    } else {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100 w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-200">
            <Home className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-[900] text-slate-900 tracking-tight">
              Maryana_Ivshyna
            </h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em]">
              Вход в CRM
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-left text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2">Логин</label>
            <input
              type="text"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 outline-none font-bold text-slate-700 transition"
              placeholder="Введите логин"
              required
            />
          </div>
          <div>
            <label className="block text-left text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 outline-none font-bold text-slate-700 transition"
              placeholder="Введите пароль"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold uppercase tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-95"
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;