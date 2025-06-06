'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface EmployeeContextType {
  employeeCode: string;
  isLoggedIn: boolean;
  setEmployeeCode: (code: string) => void;
  setIsLoggedIn: (status: boolean) => void;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export function EmployeeProvider({ children }: { children: ReactNode }) {
  const [employeeCode, setEmployeeCode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const storedCode = localStorage.getItem('employeeCode');
      return storedCode && storedCode.trim() !== '' ? storedCode : '';
    }
    return '';
  });
  
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const storedCode = localStorage.getItem('employeeCode');
      const loginStatus = localStorage.getItem('isLoggedIn') === 'true';
      return Boolean(loginStatus && storedCode && storedCode.trim() !== '');
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!isLoggedIn) {
        // ログアウト時はlocalStorageをクリア
        localStorage.removeItem('employeeCode');
        localStorage.removeItem('isLoggedIn');
      } else if (employeeCode && employeeCode.trim() !== '') {
        // ログイン時は情報を保存
        localStorage.setItem('employeeCode', employeeCode);
        localStorage.setItem('isLoggedIn', 'true');
      } else {
        // 無効な状態の場合はログアウト
        setIsLoggedIn(false);
        localStorage.removeItem('employeeCode');
        localStorage.removeItem('isLoggedIn');
      }
    }
  }, [employeeCode, isLoggedIn]);

  const handleSetEmployeeCode = (code: string) => {
    setEmployeeCode(code);
  };

  const handleSetIsLoggedIn = (status: boolean) => {
    setIsLoggedIn(status);
  };

  const contextValue: EmployeeContextType = {
    employeeCode,
    isLoggedIn,
    setEmployeeCode: handleSetEmployeeCode,
    setIsLoggedIn: handleSetIsLoggedIn,
  };

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