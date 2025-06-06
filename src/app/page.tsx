'use client';

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 relative z-10">
        <button 
          onClick={() => router.push('/login')}
          className="bg-blue-600 text-white text-base sm:text-lg md:text-xl px-4 py-2 rounded-xl shadow-md hover:bg-blue-700 transition-colors"
        >
          Pop up Store
        </button>
      </div>
      <div className="absolute inset-0 flex justify-center items-center">
        <button 
          onClick={() => router.push('/transaction')}
          className="bg-blue-600 text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 
                     font-bold px-6 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10 
                     rounded-xl shadow-lg hover:bg-blue-700 transition-colors
                     mx-4 text-center"
        >
          お会計を<br className="sm:hidden" />始める
        </button>
      </div>
    </div>
  );
}
