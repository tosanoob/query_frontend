'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/context/AuthContext';
import { Domain, getDomains } from '@/app/lib/api/domain';
import { deleteDataset } from '@/app/lib/api/dataset';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function DomainsManagement() {
  const { token } = useAuth();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const fetchDomains = async () => {
    setIsLoading(true);
    try {
      const response = await getDomains(token || '', (currentPage - 1) * 10, 10);
      setDomains(response.items);
      setTotalPages(response.pagination.pages);
      setHasNext(response.pagination.has_next);
      setHasPrev(response.pagination.has_prev);
      setError(null);
    } catch (err) {
      setError((err as Error).message || 'Không thể tải danh sách domain');
      console.error('Error fetching domains:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDomains();
    }
  }, [token, currentPage]);

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId || !token) return;
    
    const domainToDelete = domains.find(d => d.id === deleteId);
    if (!domainToDelete) {
      setError('Domain not found');
      return;
    }
    
    try {
      // Delete the dataset, which will also delete the domain
      await deleteDataset(token, domainToDelete.domain);
      
      setShowDeleteModal(false);
      setDeleteId(null);
      toast.success(`Domain ${domainToDelete.domain} deleted successfully`);
      fetchDomains(); // Refresh list
    } catch (err) {
      setError((err as Error).message || 'Lỗi khi xóa domain');
      toast.error(`Error deleting domain: ${(err as Error).message || 'Unknown error'}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl text-gray-700 font-bold">Quản lý Domain</h1>
        <Link 
          href="/admin/domains/new" 
          className="bg-primary text-indigo-700 px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Thêm domain mới
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <p>Đang tải...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Tên Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {domains.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-700">
                    Không tìm thấy domain nào
                  </td>
                </tr>
              ) : (
                domains.map((domain) => (
                  <tr key={domain.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{domain.domain}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {domain.description || 'Không có mô tả'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {domain.created_at 
                        ? new Date(domain.created_at).toLocaleDateString('vi-VN') 
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/domains/${domain.id}`}
                        className="text-primary text-gray-400 hover:text-primary/80 mr-4"
                      >
                        Chi tiết
                      </Link>
                      <Link
                        href={`/admin/domains/${domain.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(domain.id);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
            onClick={() => setShowDeleteModal(false)}
          ></div>
          <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
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
      )}

      {/* Add pagination controls */}
      <div className="mt-4 flex justify-center items-center space-x-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={!hasPrev}
          className="px-3 py-1 text-gray-800 rounded border disabled:opacity-50"
        >
          Trước
        </button>
        <span className="text-gray-800 text-sm">
          Trang {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={!hasNext}
          className="px-3 py-1 text-gray-800 rounded border disabled:opacity-50"
        >
          Tiếp
        </button>
      </div>
    </div>
  );
} 