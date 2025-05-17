'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/context/AuthContext';
import { DiseaseCreate, createDisease } from '@/app/lib/api/disease';
import { Domain, getDomains } from '@/app/lib/api/domain';
import Link from 'next/link';

export default function NewDisease() {
  const router = useRouter();
  const { token } = useAuth();
  
  const [formData, setFormData] = useState<DiseaseCreate>({
    label: '',
    domain_id: '',
    description: '',
    included_in_diagnosis: true,
    article_id: '',
  });
  
  const [domains, setDomains] = useState<Domain[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDomains, setIsLoadingDomains] = useState(true);
  
  // Fetch domains on component mount
  useEffect(() => {
    const fetchDomains = async () => {
      if (!token) return;
      
      try {
        const domainsData = await getDomains(token);
        setDomains(domainsData);
      } catch (err) {
        console.error('Error fetching domains:', err);
      } finally {
        setIsLoadingDomains(false);
      }
    };
    
    fetchDomains();
  }, [token]);
  
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
    
    if (!formData.label.trim()) {
      setError('Tên bệnh không được để trống');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    // If domain_id is empty string, set it to null
    const dataToSubmit = {
      ...formData,
      domain_id: formData.domain_id || null,
      article_id: formData.article_id || null,
    };
    
    try {
      await createDisease(token, dataToSubmit);
      router.push('/admin/diseases');
    } catch (err) {
      setError((err as Error).message || 'Có lỗi xảy ra khi tạo bệnh');
      console.error('Error creating disease:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl text-gray-900 font-bold">Thêm bệnh mới</h1>
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
                value={formData.label}
                onChange={handleChange}
                className="w-full px-4 text-gray-900 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                className="w-full px-4 text-gray-900 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">-- Chọn domain --</option>
                {isLoadingDomains ? (
                  <option disabled>Đang tải...</option>
                ) : (
                  domains.map(domain => (
                    <option key={domain.id} value={domain.id}>
                      {domain.domain}
                    </option>
                  ))
                )}
              </select>
              {!isLoadingDomains && domains.length === 0 && (
                <p className="mt-1 text-sm text-red-500">
                  Không có domain nào. Vui lòng <Link href="/admin/domains/new" className="underline">tạo domain</Link> trước.
                </p>
              )}
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
                checked={formData.included_in_diagnosis}
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
              disabled={isLoading}
              className="px-4 py-2 bg-primary text-gray-900 rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? 'Đang xử lý...' : 'Lưu bệnh'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 