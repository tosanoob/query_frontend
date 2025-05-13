'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/context/AuthContext';
import { Clinic, ClinicUpdate, getClinic, updateClinic } from '@/app/lib/api/clinic';
import Link from 'next/link';

export default function EditClinic({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { token } = useAuth();
  const { id } = params;
  
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [formData, setFormData] = useState<ClinicUpdate>({
    name: '',
    description: '',
    location: '',
    phone_number: '',
    website: '',
  });
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const fetchClinicData = async () => {
      if (!id) return;
      
      try {
        const data = await getClinic(id);
        setClinic(data);
        setFormData({
          name: data.name,
          description: data.description,
          location: data.location,
          phone_number: data.phone_number,
          website: data.website,
        });
      } catch (err) {
        setError((err as Error).message || 'Không thể tải thông tin phòng khám');
        console.error('Error fetching clinic:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClinicData();
  }, [id]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Bạn cần đăng nhập để thực hiện thao tác này');
      return;
    }
    
    if (!id) {
      setError('Không tìm thấy ID phòng khám');
      return;
    }
    
    if (!formData.name?.trim()) {
      setError('Tên phòng khám không được để trống');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      await updateClinic(token, id, formData);
      router.push('/admin/clinics');
    } catch (err) {
      setError((err as Error).message || 'Có lỗi xảy ra khi cập nhật phòng khám');
      console.error('Error updating clinic:', err);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Đang tải...</p>
      </div>
    );
  }
  
  if (!clinic && !isLoading) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        <p>Không tìm thấy phòng khám với ID: {id}</p>
        <Link 
          href="/admin/clinics"
          className="text-primary hover:underline mt-2 inline-block"
        >
          &larr; Quay lại danh sách
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Chỉnh sửa phòng khám</h1>
        <Link
          href="/admin/clinics"
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Tên phòng khám <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="text"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="https://example.com"
              />
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <Link
              href="/admin/clinics"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 