'use client';

import Link from 'next/link';
import { useAuth } from '@/app/lib/context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Tổng quan Hệ thống</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard 
          title="Quản lý Domain" 
          description="Thêm, sửa, xóa các domain bệnh trong hệ thống" 
          link="/admin/domains"
          icon="🧠"
        />
        
        <DashboardCard 
          title="Quản lý Bệnh" 
          description="Quản lý thông tin các loại bệnh trong hệ thống" 
          link="/admin/diseases"
          icon="🦠"
        />
        
        <DashboardCard 
          title="Quản lý Bài viết" 
          description="Quản lý các bài viết về bệnh và chẩn đoán" 
          link="/admin/articles"
          icon="📝"
        />
        
        <DashboardCard 
          title="Quản lý Phòng khám" 
          description="Quản lý thông tin các phòng khám đối tác" 
          link="/admin/clinics"
          icon="🏥"
        />
      </div>
      
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Thông tin người dùng</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-700 font-medium">Username</p>
              <p className="font-semibold text-gray-900">{user?.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-700 font-medium">Vai trò</p>
              <p className="font-semibold text-gray-900">{user?.role || 'Không có'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-700 font-medium">ID</p>
              <p className="font-mono text-sm text-gray-800">{user?.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
  link: string;
  icon: string;
}

function DashboardCard({ title, description, link, icon }: DashboardCardProps) {
  return (
    <Link 
      href={link}
      className="bg-white p-6 rounded-lg shadow transition-transform hover:scale-105 hover:shadow-md border border-gray-100 flex flex-col"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-700 text-sm mb-4">{description}</p>
      <div className="mt-auto">
        <span className="text-primary text-sm font-medium">
          Truy cập &rarr;
        </span>
      </div>
    </Link>
  );
} 