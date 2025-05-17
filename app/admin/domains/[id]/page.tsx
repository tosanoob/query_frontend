'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/context/AuthContext';
import { Domain, getDomain, deleteDomain } from '@/app/lib/api/domain';
import Link from 'next/link';

export default function DomainDetail() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const domainId = params.id as string;
  
  const [domain, setDomain] = useState<Domain | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchDomain = async () => {
      if (!token) return;
      
      setIsLoading(true);
      try {
        const data = await getDomain(token, domainId);
        setDomain(data);
        setError(null);
      } catch (err) {
        setError((err as Error).message || 'Không thể tải thông tin domain');
        console.error('Error fetching domain:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDomain();
  }, [domainId, token]);

  const handleDelete = async () => {
    if (!token) return;
    
    try {
      await deleteDomain(token, domainId);
      router.push('/admin/domains');
    } catch (err) {
      setError((err as Error).message || 'Không thể xóa domain');
      console.error('Error deleting domain:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          {error}
        </div>
        <Link href="/admin/domains" className="text-primary hover:underline">
          &larr; Quay lại danh sách domain
        </Link>
      </div>
    );
  }

  if (!domain) {
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
        <h1 className="text-2xl text-gray-900 font-bold">Chi tiết Domain</h1>
        <div className="flex space-x-3">
          <Link
            href="/admin/domains"
            className="text-gray-600 hover:text-gray-900"
          >
            &larr; Quay lại danh sách
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold text-gray-700 mb-2">Thông tin cơ bản</h2>
            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-3 border-b">
                <div className="px-4 py-3 bg-gray-50 font-medium text-gray-700">Tên Domain</div>
                <div className="px-4 py-3 text-gray-900 col-span-2">{domain.domain}</div>
              </div>
              <div className="grid grid-cols-3 border-b">
                <div className="px-4 py-3 bg-gray-50 font-medium text-gray-700">Mô tả</div>
                <div className="px-4 py-3 text-gray-900 col-span-2">{domain.description || 'Không có mô tả'}</div>
              </div>
              <div className="grid grid-cols-3 border-b">
                <div className="px-4 py-3 bg-gray-50 font-medium text-gray-700">ID</div>
                <div className="px-4 py-3 text-gray-900 col-span-2">{domain.id}</div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-gray-700 mb-2">Thông tin thêm</h2>
            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-3 border-b">
                <div className="px-4 py-3 bg-gray-50 font-medium text-gray-700">Tạo bởi</div>
                <div className="px-4 py-3 text-gray-900 col-span-2">{domain.created_by || 'N/A'}</div>
              </div>
              <div className="grid grid-cols-3 border-b">
                <div className="px-4 py-3 bg-gray-50 font-medium text-gray-700">Ngày tạo</div>
                <div className="px-4 py-3 text-gray-900 col-span-2">
                  {domain.created_at 
                    ? new Date(domain.created_at).toLocaleString('vi-VN') 
                    : 'N/A'}
                </div>
              </div>
              <div className="grid grid-cols-3 border-b">
                <div className="px-4 py-3 bg-gray-50 font-medium text-gray-700">Cập nhật bởi</div>
                <div className="px-4 py-3 text-gray-900 col-span-2">{domain.updated_by || 'N/A'}</div>
              </div>
              <div className="grid grid-cols-3 border-b">
                <div className="px-4 py-3 bg-gray-50 font-medium text-gray-700">Ngày cập nhật</div>
                <div className="px-4 py-3 text-gray-900 col-span-2">
                  {domain.updated_at 
                    ? new Date(domain.updated_at).toLocaleString('vi-VN') 
                    : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <Link
            href={`/admin/domains/${domain.id}/edit`}
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
                      <p className="text-sm text-gray-700">
                        Bạn có chắc chắn muốn xóa domain này? Hành động này không thể hoàn tác.
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