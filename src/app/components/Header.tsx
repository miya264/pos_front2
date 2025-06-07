'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEmployee } from '../contexts/EmployeeContext';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { employeeCode, isLoggedIn, setIsLoggedIn, setEmployeeCode } = useEmployee();

  const handleLogoClick = () => {
    if (pathname === '/transaction' || pathname === '/login') {
      router.push('/');
      return;
    }
    
    router.push('/login');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmployeeCode('');
    router.push('/');
  };

  return (
    <div className="w-full bg-white shadow-md">
      <div className="p-4 relative z-10 flex justify-between items-center max-w-screen-2xl h-[60px]">
        <div className="flex items-center h-full">
          <button 
            onClick={handleLogoClick}
            className="text-xl font-bold hover:text-blue-600 transition-colors px-6 h-full"
          >
            POS System
          </button>
          {isLoggedIn && (
            <span className="text-gray-600 ml-4">
              店員: {employeeCode}
            </span>
          )}
        </div>
        {isLoggedIn && (
          <div className="h-full flex items-center">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              ログアウト
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 