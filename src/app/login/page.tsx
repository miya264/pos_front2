"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEmployee } from '../contexts/EmployeeContext';
import axios from 'axios';
import Header from '../components/Header';

export default function LoginPage() {
  const [employeeCode, setEmployeeCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { setEmployeeCode: setGlobalEmployeeCode, setIsLoggedIn, isLoggedIn } = useEmployee();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 従業員コードの検証
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/employees/${employeeCode}`);
      
      if (response.data) {
        // ログイン成功時の処理
        setGlobalEmployeeCode(employeeCode);
        setIsLoggedIn(true);
        
        // 更新後の確認のため少し待機
        await new Promise(resolve => setTimeout(resolve, 100));
        
        router.push('/transaction');
      } else {
        setError('無効な店員番号です');
      }
    } catch (err) {
      setError('店員番号が見つかりません');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="absolute inset-0 flex justify-center items-center">
        <div className="w-full max-w-md px-4 mt-16">
          <h1 className="text-2xl sm:text-3xl md:text-4xl text-center mb-8">店員番号</h1>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="text"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                placeholder="こちらに入力"
                className="w-full p-4 text-xl sm:text-2xl md:text-3xl border border-gray-300 rounded-xl text-center shadow-md"
                required
              />
              {error && (
                <p className="mt-2 text-red-500 text-center">{error}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white text-xl sm:text-2xl md:text-3xl py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-colors"
            >
              ログイン
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
