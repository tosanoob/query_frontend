'use client';

import { useAuth } from '@/app/lib/context/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isAdmin, isLoading, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('Auth state:', { isLoading, isAuthenticated, isAdmin, user });
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/');
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, router, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-medium text-gray-800">Đang tải...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col">
        <h1 className="text-xl font-bold mb-4 text-gray-900">Không có quyền truy cập</h1>
        <p className="mb-4 text-gray-800">Tài khoản của bạn không có quyền truy cập vào trang quản trị.</p>
        <Link href="/" className="text-primary hover:underline">Quay lại trang chủ</Link>
      </div>
    );
  }

  const isActive = (path: string) => {
    return pathname.startsWith(path) ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-800 hover:bg-gray-100';
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Admin Dashboard</h2>
          <p className="text-sm text-gray-800">Xin chào, {user?.username}</p>
        </div>

        <nav className="p-4 space-y-1">
          <Link 
            href="/admin" 
            className={`block px-4 py-2 rounded-md ${pathname === '/admin' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-800 hover:bg-gray-100'}`}
          >
            Tổng quan
          </Link>
          <Link 
            href="/admin/domains" 
            className={`block px-4 py-2 rounded-md ${isActive('/admin/domains')}`}
          >
            Quản lý Domain
          </Link>
          <Link 
            href="/admin/diseases" 
            className={`block px-4 py-2 rounded-md ${isActive('/admin/diseases')}`}
          >
            Quản lý Bệnh
          </Link>
          <Link 
            href="/admin/articles" 
            className={`block px-4 py-2 rounded-md ${isActive('/admin/articles')}`}
          >
            Quản lý Bài viết
          </Link>
          <Link 
            href="/admin/clinics" 
            className={`block px-4 py-2 rounded-md ${isActive('/admin/clinics')}`}
          >
            Quản lý Phòng khám
          </Link>
          
          <button 
            onClick={() => logout().then(() => router.push('/login'))}
            className="w-full text-left px-4 py-2 rounded-md text-red-600 hover:bg-red-50 mt-8"
          >
            Đăng xuất
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-gray-50">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
} 