"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

interface BarcodeScannerProps {
  onDetected: (code: string) => void;
}

export default function BarcodeScanner({ onDetected }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [debug, setDebug] = useState<string>('');

  const handleScan = useCallback(async (detectedCodes: Array<{ rawValue: string }>) => {
    if (!isScanning) return;

    for (const code of detectedCodes) {
      if (code.rawValue) {
        const barcode = code.rawValue.trim();
        console.log("バーコード検出:", barcode);
        setDebug(prev => `${prev}\nバーコード検出: ${barcode}`);
        
        // 検出時にビープ音を鳴らす
        try {
          const beep = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRA0PVqzn77BdGAg+ltryxnMpBSl+zPLaizsIGGS57OihUBELTKXh8bllHgU2jdXzzn0vBSF1xe/glEILElyx6OyrWBUIQ5zd8sFuJAUuhM/z1YU2Bhxqvu7mnEYODlOq5O+zYBoGPJPY88p2KwUme8rx3I4+CRZiturqpVITC0mi4PK8aB8GM4nU8tGAMQYfcsLu45ZFDBFYr+ftrVoXCECY3PLEcSYELIHO8diJOQgZaLvt559NEAxPqOPwtmMcBjiP1/PMeS0GI3fH8N2RQAoUXrTp66hVFApGnt/yvmwhBTCG0fPTgjQGHW/A7eSaRQ0PVqzl77BeGQc9ltvyxnUoBSh+zPDaizsIGGS56+mjTxELTKXh8bllHgU1jdT0z3wvBSJ1xe/glEILElyx6OyrWRUIRJve8sFuJAUug8/z1oU2Bhxqvu3mnEYODlOq5O+zYRsGPJPY88p3KgUme8rx3I4+CRVht+rqpVMSC0mh4PK8aiAFM4nU8tGAMQYfccPu45ZFDBFYr+ftrVwWCECY3PLEcSYELIDP8tiIOQgZZ7zs56BODwxPqOPxtmQcBjiP1/PMeS0GI3fH8N+RQAoUXrTp66hWEwlGnt/yv2wiBDCG0fPTgzQHHG3A7eSaSw0PVqzl77BeGQc9ltrzxnUoBSh9y/HajDsIF2W56+mjUREKTKPi8blnHgU1jdTy0HwvBSJ0xe/glUQKElux5+yrWRUJQ5vd88FwJAQug8/z1oY2Bhxqvu3mnUYODlKp5e+zYRsGOpPY88p3KgUmecnw3Y4/CBVhtuvqp1UTC0mf4PK9aiAFM4nU8tGBMQYfccLv45dGDRBYrufur1sYB0CX2/PEcicELH/P8tiKOggZZ7vt56BODwxPpuPxtmQdBTiP1/PMei4GI3bH8N+RQQkUXbPq66hWFQlGnt/yv2wiBDCG0PPThDUGHG3A7eSbTA0PVKvl77BeGQc9lNryynYpBSh9y/HajT0IF2S46+mjUREKTKPi8bpoHgU1jdTy0H4wBSJ0xe/glUQKElux5+yrWhYJQ5vd88NxJAQug8/z1oY3Bhtpve3mnkcPDlKp5e+0YhsGOpHY88p5LAUlecnw3Y8/CBVhtuvqp1UTC0mf4PK9aiAFM4nU8tGBMQYfccLv45dGDRBYrufur10XB0CX2/PEcycELH7O8tiKOwgZZrvt56BOEQxPpuPxt2UdBTeP1/PMei4GI3bH79+RQQsUXbTo7KlXFQlGnN/yv24jBDCF0PPThDUGHG3A7eSbTA0PVKvl77BgGgc9lNryynYpBSh7y/HajT0IF2S46+mjUhEKTKLh8bpoHwU1jdTy0H4wBSF0xPDglkUKElux5+yrWhYJQ5rb88NyJQQug87z1oY3Bhtpve3mnkcPDlKp5e+0YhsGOpHY8sp5LAUleMnw3Y9ACBVhtuvqp1UTC0mf4PK9bCEFMojT89GBMgcfccLv45dGDRBYrufur10XB0CX2/PEcycELH7O8tiKOwgZZrvt56BOEQxPpuPxt2UdBTeO1/PMei8GI3bH79+RQQsUXbTo7KlXFQlGnN/yv24jBDCF0PPThDUGHG3A7eSbTA0PVKvl77BgGgc9lNryynYpBSh7y/HajT0IF2S46+mjUhEKTKLh8bpoHwU1");
          await beep.play();
        } catch (err) {
          if (process.env.NODE_ENV === 'development') {
            console.error("ビープ音再生エラー:", err);
          }
        }

        onDetected(barcode);
        return;
      }
    }
  }, [isScanning, onDetected]);

  const handleScannerError = useCallback((error: unknown) => {
    let message = "スキャンエラーが発生しました。";
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }
    setError(message);
    setDebug(prev => `${prev}\nスキャンエラー: ${message}`);
  }, []);

  useEffect(() => {
    setIsScanning(true);
    setError(null);
    setDebug('スキャナー初期化...');

    return () => {
      setIsScanning(false);
    };
  }, []);

  return (
    <div className="w-full">
      <div className="relative aspect-[4/3] w-full bg-black">
        {isScanning && (
          <div className="w-full h-full">
            <Scanner
              onScan={handleScan}
              onError={handleScannerError}
              paused={!isScanning}
              formats={[
                "ean_13",
                "ean_8",
                "upc_a",
                "upc_e",
                "code_128",
                "code_39",
              ]}
              styles={{
                container: { width: '100%', height: '100%', position: 'relative' },
                video: { width: '100%', height: '100%', objectFit: 'cover' }
              }}
              constraints={{
                width: { ideal: 1280, max: 1920 },
                height: { ideal: 720, max: 1080 },
                facingMode: "environment",
                aspectRatio: { ideal: 4/3 },
                frameRate: { ideal: 30 }
              }}
              scanDelay={100}
            />
            {/* スキャン枠オーバーレイ */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-4/11 w-[80%] max-w-[400px] h-[130px]">
                <div className="relative w-full h-full border-2 border-blue-500 rounded-md">
                  {/* コーナーマーカー */}
                  <div className="absolute top- left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500" />
                  {/* スキャンライン */}
                  <div
                    className="absolute left-0 w-full h-0.5 bg-red-500 animate-scan"
                    style={{ top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
              </div>
              {/* ガイダンステキスト */}
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <div className="inline-block px-4 py-2 bg-black bg-opacity-50 rounded-full">
                  <span className="text-sm text-white font-medium">
                    バーコードをスキャン枠に合わせてください
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-2 p-2 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      {debug && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono whitespace-pre-wrap">
          {debug}
        </div>
      )}
    </div>
  );
}