'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/lib/context/AuthContext';
import { Disease, getDisease, deleteDisease } from '@/app/lib/api/disease';
import { Domain, getDomain } from '@/app/lib/api/domain';
import { useRouter } from 'next/navigation';

export default function DiseaseDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { token } = useAuth();
  const { id } = params;
  
  const [disease, setDisease] = useState<Disease | null>(null);
  const [domain, setDomain] = useState<Domain | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  useEffect(() => {
    const fetchDiseaseData = async () => {
      if (!token || !id) return;
      
      try {
        const diseaseData = await getDisease(id, token);
        setDisease(diseaseData);
        
        // If disease has a domain_id, fetch the domain details
        if (diseaseData.domain_id) {
          try {
            const domainData = await getDomain(token, diseaseData.domain_id);
            setDomain(domainData);
          } catch (err) {
            console.error('Error fetching domain:', err);
          }
        }
      } catch (err) {
        setError((err as Error).message || 'Không thể tải thông tin bệnh');
        console.error('Error fetching disease:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDiseaseData();
  }, [id, token]);
  
  const handleDelete = async () => {
    if (!token) {
      setError('Bạn cần đăng nhập để thực hiện thao tác này');
      return;
    }
    
    try {
      await deleteDisease(token, id);
      router.push('/admin/diseases');
    } catch (err) {
      setError((err as Error).message || 'Lỗi khi xóa bệnh');
      setShowDeleteModal(false);
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
        <h1 className="text-2xl font-bold">{disease?.label}</h1>
        <div className="flex space-x-3">
          <Link
            href="/admin/diseases"
            className="text-gray-600 hover:text-gray-900"
          >
            &larr; Quay lại danh sách
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Thông tin chung</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Tên bệnh</p>
                <p className="font-medium">{disease?.label}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Mô tả</p>
                <p>{disease?.description || 'Không có mô tả'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Domain</p>
                {domain ? (
                  <div>
                    <p>{domain.domain}</p>
                    {domain.description && (
                      <p className="text-sm text-gray-500 mt-1">{domain.description}</p>
                    )}
                  </div>
                ) : (
                  <p>Không có domain</p>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Thông tin thêm</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Sử dụng trong chẩn đoán</p>
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    disease?.included_in_diagnosis
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {disease?.included_in_diagnosis ? 'Có' : 'Không'}
                </span>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Bài viết liên quan</p>
                {disease?.article_id ? (
                  <Link
                    href={`/admin/articles/${disease.article_id}`}
                    className="text-primary hover:underline"
                  >
                    Xem bài viết (ID: {disease.article_id})
                  </Link>
                ) : (
                  <p>Không có bài viết liên quan</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6">
          <h2 className="text-lg font-semibold mb-4">Thông tin quản trị</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Ngày tạo</p>
              <p>{disease?.created_at ? new Date(disease.created_at).toLocaleDateString('vi-VN') : 'N/A'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Cập nhật lần cuối</p>
              <p>{disease?.updated_at ? new Date(disease.updated_at).toLocaleDateString('vi-VN') : 'N/A'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">ID</p>
              <p className="font-mono text-sm">{disease?.id}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <Link
          href={`/admin/diseases/${id}/edit`}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Chỉnh sửa
        </Link>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Xóa
        </button>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Xác nhận xóa
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Bạn có chắc chắn muốn xóa bệnh "{disease?.label}"? Hành động này không thể hoàn tác.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDelete}
                >
                  Xóa
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 