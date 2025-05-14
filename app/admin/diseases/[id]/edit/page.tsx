'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/context/AuthContext';
import { Disease, DiseaseUpdate, getDisease, updateDisease } from '@/app/lib/api/disease';
import { Domain, getDomains } from '@/app/lib/api/domain';
import Link from 'next/link';
import { use } from 'react';

export default function EditDisease({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { token } = useAuth();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [disease, setDisease] = useState<Disease | null>(null);
  const [formData, setFormData] = useState<DiseaseUpdate>({
    label: '',
    description: '',
    included_in_diagnosis: true,
  });
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        // Fetch disease without requiring token
        const diseaseData = await getDisease(id);
        setDisease(diseaseData);
        
        // Initialize form data with all available fields
        // Note: domain_id and article_id are not included as they're not editable
        setFormData({
          label: diseaseData.label || '',
          description: diseaseData.description || '',
          included_in_diagnosis: diseaseData.included_in_diagnosis || false,
        });
      } catch (err) {
        console.error('Error fetching disease data:', err);
        setError((err as Error).message || 'Không thể tải thông tin bệnh');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, token]);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Bạn cần đăng nhập để thực hiện thao tác này');
      return;
    }
    
    if (!id) {
      setError('Không tìm thấy ID bệnh');
      return;
    }
    
    if (!formData.label?.trim()) {
      setError('Tên bệnh không được để trống');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    // Send only editable fields in the update
    const dataToSubmit: DiseaseUpdate = {
      label: formData.label,
      description: formData.description || null,
      included_in_diagnosis: formData.included_in_diagnosis,
    };
    
    try {
      await updateDisease(token, id, dataToSubmit);
      router.push('/admin/diseases');
    } catch (err) {
      setError((err as Error).message || 'Có lỗi xảy ra khi cập nhật bệnh');
      console.error('Error updating disease:', err);
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
  
  if (!disease && !isLoading) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        <p>Không tìm thấy bệnh với ID: {id}</p>
        <Link 
          href="/admin/diseases"
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
        <h1 className="text-2xl text-gray-700 font-bold">Chỉnh sửa bệnh</h1>
        <Link
          href="/admin/diseases"
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
              <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
                Tên bệnh <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="label"
                name="label"
                value={formData.label || ''}
                onChange={handleChange}
                className="w-full text-gray-700 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Domain <span className="text-xs text-gray-500">(Không thể chỉnh sửa)</span>
              </label>
              <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
                {disease?.domain?.domain || 'Không có domain'}
              </div>
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
                rows={8}
                className="w-full text-gray-700 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              ></textarea>
            </div>
            
            {disease?.article_id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID bài viết <span className="text-xs text-gray-500">(Không thể chỉnh sửa)</span>
                </label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
                  {disease.article_id || 'Không có'}
                </div>
              </div>
            )}
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="included_in_diagnosis"
                name="included_in_diagnosis"
                checked={!!formData.included_in_diagnosis}
                onChange={e => setFormData(prev => ({ ...prev, included_in_diagnosis: e.target.checked }))}
                className="h-4 w-4 text-primary focus:ring-primary/50 border-gray-300 rounded"
              />
              <label htmlFor="included_in_diagnosis" className="ml-2 block text-sm text-gray-700">
                Sử dụng trong chẩn đoán
              </label>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <Link
              href="/admin/diseases"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-primary text-indigo-500 rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 