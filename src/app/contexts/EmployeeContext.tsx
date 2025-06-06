'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface EmployeeContextType {
  employeeCode: string;
  setEmployeeCode: (code: string) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (status: boolean) => void;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export function EmployeeProvider({ children }: { children: ReactNode }) {
  // localStorageから初期値を取得
  const [employeeCode, setEmployeeCode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const storedCode = localStorage.getItem('employeeCode');
      console.log('初期店員コード取得:', storedCode);
      return storedCode && storedCode.trim() !== '' ? storedCode : '';
    }
    return '';
  });
  
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const storedCode = localStorage.getItem('employeeCode');
      const loginStatus = localStorage.getItem('isLoggedIn') === 'true';
      console.log('初期ログイン状態チェック:', {
        storedCode,
        loginStatus,
        結果: Boolean(loginStatus && storedCode && storedCode.trim() !== '')
      });
      return Boolean(loginStatus && storedCode && storedCode.trim() !== '');
    }
    return false;
  });

  // 状態が変更されたらlocalStorageを更新
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('状態変更を検知:', {
        isLoggedIn,
        employeeCode,
        現在のLocalStorage: {
          employeeCode: localStorage.getItem('employeeCode'),
          isLoggedIn: localStorage.getItem('isLoggedIn')
        }
      });

      if (!isLoggedIn) {
        // ログアウト時はlocalStorageをクリア
        localStorage.removeItem('employeeCode');
        localStorage.removeItem('isLoggedIn');
        console.log('ログアウト：従業員情報をクリア完了');
      } else if (employeeCode && employeeCode.trim() !== '') {
        // ログイン時は情報を保存（店員コードが有効な場合のみ）
        localStorage.setItem('employeeCode', employeeCode);
        localStorage.setItem('isLoggedIn', 'true');
        console.log('ログイン情報を保存完了:', { employeeCode, isLoggedIn });
      } else {
        // 無効な状態の場合はログアウト
        console.log('無効な状態を検知：ログアウト処理を実行');
        setIsLoggedIn(false);
        localStorage.removeItem('employeeCode');
        localStorage.removeItem('isLoggedIn');
      }
    }
  }, [employeeCode, isLoggedIn]);

  const handleSetEmployeeCode = (code: string) => {
    console.log('店員コードを設定（変更前）:', employeeCode);
    console.log('店員コードを設定（変更後）:', code);
    setEmployeeCode(code);
  };

  const handleSetIsLoggedIn = (status: boolean) => {
    console.log('ログイン状態を設定（詳細）:', {
      現在のログイン状態: isLoggedIn,
      新しいログイン状態: status,
      現在の店員コード: employeeCode,
      localStorage状態: {
        employeeCode: localStorage.getItem('employeeCode'),
        isLoggedIn: localStorage.getItem('isLoggedIn')
      }
    });
    if (!status) {
      // ログアウト時は店員コードもクリア
      setEmployeeCode('');
    }
    setIsLoggedIn(status);
  };

  const contextValue = {
    employeeCode,
    setEmployeeCode: handleSetEmployeeCode,
    isLoggedIn,
    setIsLoggedIn: handleSetIsLoggedIn
  };

  console.log('EmployeeContext現在の状態:', contextValue);

  return (
    <EmployeeContext.Provider value={contextValue}>
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployee() {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error('useEmployee must be used within a EmployeeProvider');
  }
  return context;
} 