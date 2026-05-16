'use client';

import { useState } from 'react';
import { useAdminAuth } from '@/app/context/adminAuth';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(password);

    if (success) {
      setPassword('');
    } else {
      setError('Contraseña incorrecta');
      setPassword('');
    }
    setIsLoading(false);
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-background to-gray-100">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-[#1a1a1a]">
            Panel de Admin
          </h1>
          <p className="text-center text-gray-500 mb-8">Ingresa la contraseña para acceder</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full bg-white rounded-full px-6 py-4 text-center text-lg font-normal text-gray-700 border-2 border-transparent focus:border-[#4CAF50] focus:border-2 focus:outline-none transition-colors duration-200 disabled:opacity-50"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm font-medium text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full bg-[#4CAF50] hover:bg-[#45a049] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-full transition-colors duration-200"
            >
              {isLoading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
