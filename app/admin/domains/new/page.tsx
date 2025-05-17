'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/context/AuthContext';
import { DomainCreate, createDomain } from '@/app/lib/api/domain';
import Link from 'next/link';

export default function NewDomain() {
  const router = useRouter();
  const { token, user } = useAuth();
  
  const [formData, setFormData] = useState<DomainCreate>({
    domain: '',
    description: '',
    created_by: user?.username || null,
  });
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Bạn cần đăng nhập để thực hiện thao tác này');
      return;
    }
    
    if (!formData.domain.trim()) {
      setError('Tên domain không được để trống');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await createDomain(token, formData);
      router.push('/admin/domains');
    } catch (err) {
      setError((err as Error).message || 'Có lỗi xảy ra khi tạo domain');
      console.error('Error creating domain:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl text-gray-900 font-bold">Thêm domain mới</h1>
        <Link
          href="/admin/domains"
          className="text-gray-600 hover:text-gray-900"
        >
          &larr; Quay lại danh sách
        </Link>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
                Tên domain <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="domain"
                name="domain"
                value={formData.domain}
                onChange={handleChange}
                className="w-full px-4 text-gray-900 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 text-gray-900 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              ></textarea>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <Link
              href="/admin/domains"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary text-gray-900 rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? 'Đang xử lý...' : 'Lưu domain'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 