'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/lib/context/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-blue-700">DermaAI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600">
              Trang chủ
            </Link>
            <Link href="/articles" className="text-gray-700 hover:text-blue-600">
              Bài viết
            </Link>
            <Link href="/diseases" className="text-gray-700 hover:text-blue-600">
              Bệnh da liễu
            </Link>
            <Link href="/diagnosis" className="text-gray-700 hover:text-blue-600">
              Chẩn đoán
            </Link>
            <Link href="/clinics" className="text-gray-700 hover:text-blue-600">
              Phòng khám
            </Link>
          </nav>

          {/* Authentication */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link 
                    href="/admin" 
                    className="text-gray-700 hover:text-blue-600"
                  >
                    Quản trị
                  </Link>
                )}
                <button 
                  onClick={() => logout()}
                  className="text-gray-700 hover:text-blue-600"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link 
                href="/login" 
                className="text-gray-700 hover:text-blue-600"
              >
                Đăng nhập
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16" 
              />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="mt-4 space-y-2 md:hidden">
            <Link 
              href="/" 
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Trang chủ
            </Link>
            <Link 
              href="/articles" 
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Bài viết
            </Link>
            <Link 
              href="/diseases" 
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Bệnh da liễu
            </Link>
            <Link 
              href="/diagnosis" 
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Chẩn đoán
            </Link>
            <Link 
              href="/clinics" 
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Phòng khám
            </Link>
            
            {/* Mobile Authentication */}
            <div className="pt-2 border-t border-gray-200">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link 
                      href="/admin" 
                      className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Quản trị
                    </Link>
                  )}
                  <button 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <Link 
                  href="/login" 
                  className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header; 