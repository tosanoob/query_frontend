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
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!isLoading && isAuthenticated && !isAdmin) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Đang tải...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const isActive = (path: string) => {
    return pathname.startsWith(path) ? 'bg-gray-100 text-primary font-medium' : '';
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Admin Dashboard</h2>
          <p className="text-sm text-gray-600">Xin chào, {user?.username}</p>
        </div>

        <nav className="p-4 space-y-1">
          <Link 
            href="/admin" 
            className={`block px-4 py-2 rounded-md hover:bg-gray-100 ${isActive('/admin')}`}
          >
            Tổng quan
          </Link>
          <Link 
            href="/admin/domains" 
            className={`block px-4 py-2 rounded-md hover:bg-gray-100 ${isActive('/admin/domains')}`}
          >
            Quản lý Domain Bệnh
          </Link>
          <Link 
            href="/admin/articles" 
            className={`block px-4 py-2 rounded-md hover:bg-gray-100 ${isActive('/admin/articles')}`}
          >
            Quản lý Bài đăng
          </Link>
          <Link 
            href="/admin/clinics" 
            className={`block px-4 py-2 rounded-md hover:bg-gray-100 ${isActive('/admin/clinics')}`}
          >
            Quản lý Phòng khám
          </Link>
          
          <button 
            onClick={() => logout().then(() => router.push('/login'))}
            className="w-full text-left px-4 py-2 rounded-md text-red-500 hover:bg-red-50 mt-8"
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