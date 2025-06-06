"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import BarcodeScanner from "../components/BarcodeScanner";
import { TrashIcon, ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useEmployee } from "../contexts/EmployeeContext";

// APIエンドポイントの設定
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

// 型定義
interface Product {
  prd_id: number;
  code: string;
  name: string;
  price: number;
  quantity?: number;
}

interface CartItem extends Product {
  quantity: number;
}

export default function TransactionPage() {
  const [code, setCode] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [completedAmount, setCompletedAmount] = useState(0);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const { employeeCode, isLoggedIn, setIsLoggedIn, setEmployeeCode } = useEmployee();
  const router = useRouter();
  const [hasScannedOnce, setHasScannedOnce] = useState(false);
  
  useEffect(() => {
    const path = window.location.pathname;
    if (!isLoggedIn && !employeeCode) {
      // ゲストユーザーとして取引を開始
    }
  }, [isLoggedIn, employeeCode]);

  const handleSearch = async () => {
    try {
      if (!code) return;
      const requestUrl = `${API_ENDPOINT}/products/code/${encodeURIComponent(code)}`;
      const response = await axios.get(requestUrl);
      setProduct(response.data);
      setError("");
    } catch (err) {
      setProduct(null);
      setError("商品が見つかりません");
    }
  };

  const handleBarcodeDetected = async (detectedCode: string) => {
    setCode(detectedCode);
    setIsScannerActive(false);
    try {
      const requestUrl = `${API_ENDPOINT}/products/code/${encodeURIComponent(detectedCode)}`;
      const response = await axios.get(requestUrl);
      setProduct(response.data);
      setError("");
    } catch (err) {
      setProduct(null);
      setError("商品が見つかりません");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 13) {
      setCode(value);
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && code.length > 0) {
      handleSearch();
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.code === product.code);
      
      if (existingItemIndex !== -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += (product.quantity || 1);
        return updatedItems;
      }

      return [...prevItems, { ...product, quantity: product.quantity || 1 }];
    });

    setCode("");
    setProduct(null);
    setError("");
    setShowScanner(false);
    setIsScannerActive(false);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handlePurchase = async () => {
    if (isProcessing || cartItems.length === 0) return;
    setIsProcessing(true);

    try {
      const empCode = isLoggedIn && employeeCode ? employeeCode : 'GUEST00001';

      const transactionData = cartItems.map(item => ({
        prd_id: item.prd_id,
        code: item.code,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity)
      }));

      const config = {
        headers: {
          'emp-cd': empCode,
          'Content-Type': 'application/json'
        },
        validateStatus: function (status: number) {
          return status >= 200 && status < 300;
        }
      };

      await axios.post(
        `${API_ENDPOINT}/transactions/`,
        transactionData,
        config
      );

      setShowCompletionPopup(true);
      setCompletedAmount(calculateTotal());
      setShowCart(false);
    } catch (err) {
      setError("取引処理中にエラーが発生しました。");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompletionOk = () => {
    setShowCompletionPopup(false);
    if (isLoggedIn) {
      setIsLoggedIn(false);
      setEmployeeCode('');
    }
    setCode("");
    setProduct(null);
    setError("");
    setShowScanner(false);
    setIsScannerActive(false);
    setCartItems([]);
    setCompletedAmount(0);
    
    router.push('/');
  };

  const handleCartQuantityChange = (itemCode: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      setCartItems(prevItems => {
        return prevItems.map(item => {
          if (item.code === itemCode) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
      });
    }
  };

  const handleProductQuantityChange = (newQuantity: number) => {
    if (product && newQuantity >= 1) {
      setProduct({ ...product, quantity: newQuantity });
    }
  };

  const handleRemoveFromCart = (itemCode: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.code !== itemCode));
  };

  const toggleCart = () => {
    setShowCart(!showCart);
  };

  const handleLogout = () => {
    console.log('ログアウトを実行します');
    setIsLoggedIn(false);
    setEmployeeCode('');
    router.push('/');
  };

  const renderHeader = () => (
    <div className="w-full bg-white shadow-md p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold">POS System</h1>
        <span className="text-gray-600">
          店員: {employeeCode}
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
      >
        ログアウト
      </button>
    </div>
  );

  return (
    <div className="flex flex-col w-full h-full relative">
      {isLoggedIn && renderHeader()}
      <div className={`flex flex-col lg:flex-row w-full h-full relative ${isLoggedIn ? 'h-[calc(100vh-64px)]' : 'h-screen'}`}>
        <button
          onClick={toggleCart}
          className="lg:hidden fixed top-4 right-4 z-40 bg-blue-600 text-white p-2 rounded-full shadow-lg"
          aria-label="カートを表示"
        >
          <ShoppingCartIcon className="w-6 h-6" />
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartItems.length}
            </span>
          )}
        </button>

        <div className={`w-full lg:w-1/2 ${isLoggedIn ? 'h-[calc(100vh-64px)]' : 'h-screen'} p-2 lg:p-4 flex flex-col`}>
          <div className="flex-1 flex flex-col">
            <div className="w-full rounded-md bg-gray-100 p-2 flex flex-col flex-[3]">
              <div className="flex flex-col items-center bg-white border border-gray-300 rounded-md m-1 h-full">
                <h1 className="flex flex-col items-center bg-blue-600 rounded-t-md p-4 w-full mx-auto font-bold text-white text-2xl">
                  バーコードスキャン
                </h1>
                <div className="flex flex-col items-center justify-center bg-gray-400 m-4 w-11/12 h-48 rounded-lg relative overflow-hidden">
                {!showScanner ? (
                  <div className="flex flex-col items-center justify-center w-full h-full text-white">
                    <button
                      onClick={() => {
                        setShowScanner(true);
                        setIsScannerActive(true); 
                        setHasScannedOnce(true);  
                      }}
                      className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      スキャナーを起動
                    </button>
                  </div>
                ) : isScannerActive ? (
                  <BarcodeScanner onDetected={handleBarcodeDetected} />
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full text-white">
                    <p>バーコード: {code}</p>
                    <button
                      onClick={() => {
                        setCode(""); 
                        setProduct(null);
                        setIsScannerActive(true);
                      }}
                      className="mt-2 px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {hasScannedOnce ? "再スキャン" : "スキャナーを起動"}
                    </button>
                  </div>
                )}
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <div className="border-t-2 border-l-2 border-white w-8 h-8 absolute top-4 left-4"></div>
                    <div className="border-t-2 border-r-2 border-white w-8 h-8 absolute top-4 right-4"></div>
                    <div className="border-b-2 border-l-2 border-white w-8 h-8 absolute bottom-4 left-4"></div>
                    <div className="border-b-2 border-r-2 border-white w-8 h-8 absolute bottom-4 right-4"></div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center bg-white w-11/12 mx-auto mb-4 space-y-2">
                  <input 
                    type="text" 
                    value={code}
                    onChange={handleInputChange}
                    onKeyPress={handleInputKeyPress}
                    placeholder="バーコードを入力してください"
                    maxLength={13}
                    className="w-full p-3 border border-gray-300 rounded-md text-center text-gray-500 text-2xl"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={!code}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  >
                    検索
                  </button>
                  {error && (
                    <p className="text-red-500">{error}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full rounded-md bg-gray-100 p-2 mt-2 flex flex-col flex-[2]">
              <div className="flex flex-col bg-white rounded-md m-1 h-full">
                <h1 className="text-2xl font-bold p-4 border-b">商品</h1>
                <div className="flex-1 overflow-auto p-4">
                  {product ? (
                    <div className="mb-4">
                      <p className="text-xl font-bold">{product.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleProductQuantityChange((product.quantity || 1) - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                          >-</button>
                          <input
                            type="number"
                            min="1"
                            value={product.quantity || 1}
                            onChange={(e) => handleProductQuantityChange(parseInt(e.target.value) || 1)}
                            className="w-12 text-center border rounded-md"
                          />
                          <button
                            onClick={() => handleProductQuantityChange((product.quantity || 1) + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                          >+</button>
                        </div>
                        <p className="text-2xl text-right">¥{product.price?.toLocaleString()}</p>
                      </div>
                      <p className="text-xl text-right mt-2">
                        小計: ¥{((product.price || 0) * (product.quantity || 1)).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      商品が追加されていません
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-4">
            <button 
              onClick={handleAddToCart}
              disabled={!product}
              className="w-full bg-blue-600 text-white p-4 rounded-md text-xl font-bold disabled:bg-gray-400"
            >
              商品を追加
            </button>
          </div>
        </div>

        <div className={`hidden lg:flex w-1/2 ${isLoggedIn ? 'h-[calc(100vh-64px)]' : 'h-screen'} p-2 lg:p-4`}>
          <div className="w-full h-full rounded-md bg-white flex flex-col">
            <h1 className="text-2xl font-bold p-4 border-b">購入リスト</h1>
            <div className="flex-1 overflow-auto p-4">
              {cartItems.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  商品が追加されていません
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-600">
                          ¥{item.price?.toLocaleString()} × 
                          <div className="inline-flex items-center ml-2">
                            <button
                              onClick={() => handleCartQuantityChange(item.code, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                            >-</button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleCartQuantityChange(item.code, parseInt(e.target.value) || 1)}
                              className="w-12 mx-1 text-center border rounded"
                            />
                            <button
                              onClick={() => handleCartQuantityChange(item.code, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                            >+</button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-xl font-bold">
                          ¥{(item.price * item.quantity).toLocaleString()}
                        </div>
                        <button
                          onClick={() => handleRemoveFromCart(item.code)}
                          className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                          aria-label="商品を削除"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg">小計</span>
                <span className="text-xl">¥{calculateTotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg">税</span>
                <span className="text-xl">¥{Math.floor(calculateTotal() * 0.1).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold">
                <span>合計</span>
                <span>¥{Math.floor(calculateTotal() * 1.1).toLocaleString()}</span>
              </div>
            </div>
            <button 
              onClick={handlePurchase}
              disabled={cartItems.length === 0 || isProcessing}
              className="bg-blue-600 text-white p-4 text-xl font-bold disabled:bg-gray-400"
            >
              購入を確定
            </button>
          </div>
        </div>

        {showCart && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
            <div className="absolute right-0 top-0 h-full w-full sm:w-[400px] bg-white shadow-lg flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h1 className="text-2xl font-bold">購入リスト</h1>
                <button
                  onClick={toggleCart}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  aria-label="カートを閉じる"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                {cartItems.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    商品が追加されていません
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-600">
                            ¥{item.price?.toLocaleString()} × 
                            <div className="inline-flex items-center ml-2">
                              <button
                                onClick={() => handleCartQuantityChange(item.code, item.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                              >-</button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleCartQuantityChange(item.code, parseInt(e.target.value) || 1)}
                                className="w-12 mx-1 text-center border rounded"
                              />
                              <button
                                onClick={() => handleCartQuantityChange(item.code, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                              >+</button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-xl font-bold">
                            ¥{(item.price * item.quantity).toLocaleString()}
                          </div>
                          <button
                            onClick={() => handleRemoveFromCart(item.code)}
                            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                            aria-label="商品を削除"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="border-t p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg">小計</span>
                  <span className="text-xl">¥{calculateTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg">税</span>
                  <span className="text-xl">¥{Math.floor(calculateTotal() * 0.1).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>合計</span>
                  <span>¥{Math.floor(calculateTotal() * 1.1).toLocaleString()}</span>
                </div>
              </div>
              <button 
                onClick={handlePurchase}
                disabled={cartItems.length === 0 || isProcessing}
                className="bg-blue-600 text-white p-4 text-xl font-bold disabled:bg-gray-400"
              >
                購入を確定
              </button>
            </div>
          </div>
        )}

        {showCompletionPopup && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[60]">
            <div className="bg-white rounded-lg p-6 w-[90vw] md:w-96 shadow-lg border border-gray-200 m-4">
              <h2 className="text-2xl font-bold mb-4 text-center">購入完了</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span>小計（税抜き）</span>
                  <span>¥{completedAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>合計</span>
                  <span>¥{Math.floor(completedAmount * 1.1).toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={handleCompletionOk}
                className="w-full bg-blue-600 text-white py-3 rounded-md text-lg font-bold hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}