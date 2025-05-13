'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/context/AuthContext';
import { Disease, DiseaseUpdate, getDisease, updateDisease } from '@/app/lib/api/disease';
import { Domain, getDomains } from '@/app/lib/api/domain';
import Link from 'next/link';

export default function EditDisease({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { token } = useAuth();
  const { id } = params;
  
  const [disease, setDisease] = useState<Disease | null>(null);
  const [formData, setFormData] = useState<DiseaseUpdate>({
    label: '',
    domain_id: '',
    description: '',
    included_in_diagnosis: true,
    article_id: '',
  });
  
  const [domains, setDomains] = useState<Domain[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!token || !id) return;
      
      try {
        // Fetch disease and domains in parallel
        const [diseaseData, domainsData] = await Promise.all([
          getDisease(id, token),
          getDomains(token)
        ]);
        
        setDisease(diseaseData);
        setDomains(domainsData);
        
        // Initialize form data
        setFormData({
          label: diseaseData.label,
          domain_id: diseaseData.domain_id,
          description: diseaseData.description,
          included_in_diagnosis: diseaseData.included_in_diagnosis,
          article_id: diseaseData.article_id,
        });
      } catch (err) {
        setError((err as Error).message || 'Không thể tải thông tin bệnh hoặc danh sách domain');
        console.error('Error fetching data:', err);
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
    
    // If domain_id is empty string, set it to null
    const dataToSubmit: DiseaseUpdate = {
      ...formData,
      domain_id: formData.domain_id || null,
      article_id: formData.article_id || null,
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
        <h1 className="text-2xl font-bold">Chỉnh sửa bệnh</h1>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            
            <div>
              <label htmlFor="domain_id" className="block text-sm font-medium text-gray-700 mb-1">
                Domain
              </label>
              <select
                id="domain_id"
                name="domain_id"
                value={formData.domain_id || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">-- Chọn domain --</option>
                {domains.map(domain => (
                  <option key={domain.id} value={domain.id}>
                    {domain.domain}
                  </option>
                ))}
              </select>
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
              <label htmlFor="article_id" className="block text-sm font-medium text-gray-700 mb-1">
                ID bài viết
              </label>
              <input
                type="text"
                id="article_id"
                name="article_id"
                value={formData.article_id || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Nhập ID bài viết (nếu có)"
              />
            </div>
            
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