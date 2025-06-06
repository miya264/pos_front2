"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEmployee } from '../contexts/EmployeeContext';
import axios from 'axios';

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
        // ログイン成功
        console.log('ログイン成功:', employeeCode);
        console.log('従業員データ:', response.data);
        
        // 状態を更新する前に現在の状態をログ
        console.log('現在の状態:', { 
          currentEmployeeCode: employeeCode,
          isCurrentlyLoggedIn: isLoggedIn 
        });
        
        // 状態を更新
        setGlobalEmployeeCode(employeeCode);
        setIsLoggedIn(true);
        
        // 更新後の確認のため少し待機
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('グローバル状態を設定:', { 
          employeeCode,
          isLoggedIn: true 
        });
        
        router.push('/transaction');
      } else {
        setError('無効な店員番号です');
      }
    } catch (err) {
      console.error('ログインエラー:', err);
      setError('店員番号が見つかりません');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="p-4 relative z-10 flex justify-between items-center">
        <button 
          onClick={() => router.push('/')}
          className="bg-blue-600 text-white text-base sm:text-lg md:text-xl px-4 py-2 rounded-xl shadow-md hover:bg-blue-700 transition-colors"
        >
          Pop up Store
        </button>
        <button 
          onClick={() => router.push('/')}
          className="bg-blue-400 text-white text-base sm:text-lg md:text-xl px-4 py-2 rounded-xl shadow-md hover:bg-blue-500 transition-colors"
        >
          戻る
        </button>
      </div>

      {/* メインコンテンツ */}
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
