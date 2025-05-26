'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/context/AuthContext';
import { Domain, getDomain, updateDomain, DomainUpdate } from '@/app/lib/api/domain';
import Link from 'next/link';

export default function EditDomain() {
  const params = useParams();
  const router = useRouter();
  const { token, user } = useAuth();
  const domainId = params.id as string;
  
  const [formData, setFormData] = useState<DomainUpdate>({
    domain: '',
    description: '',
    updated_by: user?.username || null,
  });
  
  const [domain, setDomain] = useState<Domain | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDomain = async () => {
      if (!token) return;
      
      setIsLoading(true);
      try {
        const data = await getDomain(token, domainId);
        setDomain(data);
        setFormData({
          domain: data.domain,
          description: data.description,
          updated_by: user?.username || null,
        });
        setError(null);
      } catch (err) {
        setError((err as Error).message || 'Không thể tải thông tin domain');
        console.error('Error fetching domain:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDomain();
  }, [domainId, token, user?.username]);
  
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
    
    if (!formData.domain?.trim()) {
      setError('Tên domain không được để trống');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      await updateDomain(token, domainId, formData);
      router.push(`/admin/domains/${domainId}`);
    } catch (err) {
      setError((err as Error).message || 'Có lỗi xảy ra khi cập nhật domain');
      console.error('Error updating domain:', err);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p>Đang tải...</p>
      </div>
    );
  }
  
  if (!domain && !isLoading) {
    return (
      <div className="text-center py-10">
        <p>Không tìm thấy thông tin domain</p>
        <Link href="/admin/domains" className="text-primary hover:underline mt-4 inline-block">
          &larr; Quay lại danh sách domain
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl  text-gray-900 font-bold">Chỉnh sửa Domain</h1>
        <div className="flex space-x-3">
          <Link
            href={`/admin/domains/${domainId}`}
            className="text-gray-600 hover:text-gray-900"
          >
            &larr; Quay lại chi tiết
          </Link>
        </div>
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
                value={formData.domain || ''}
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
              href={`/admin/domains/${domainId}`}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-primary text-gray-900 rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 