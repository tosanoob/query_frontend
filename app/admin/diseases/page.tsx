'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/context/AuthContext';
import { Disease, getDiseases, deleteDisease, getDiseasesByDomain } from '@/app/lib/api/disease';
import { Domain, getDomains } from '@/app/lib/api/domain';
import Link from 'next/link';
import { createPortal } from 'react-dom';

export default function DiseasesManagement() {
  const { token } = useAuth();
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [activeDomainId, setActiveDomainId] = useState<string | null>(null);
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

  // Fetch domains first
  useEffect(() => {
    const fetchDomains = async () => {
      if (!token) return;
      
      try {
        const response = await getDomains(token, 0, 100); // Get all domains
        setDomains(response.items);
        
        // Set STANDARD domain as active by default
        const standardDomain = response.items.find(domain => domain.domain === 'STANDARD');
        if (standardDomain) {
          setActiveDomainId(standardDomain.id);
        } else if (response.items.length > 0) {
          setActiveDomainId(response.items[0].id);
        }
      } catch (err) {
        setError((err as Error).message || 'Không thể tải danh sách domain');
        console.error('Error fetching domains:', err);
      }
    };
    
    if (token) {
      fetchDomains();
    }
  }, [token]);

  const fetchDiseases = async (domainId: string | null = null, page = 1) => {
    if (!token || !domainId) return;
    
    setIsLoading(true);
    try {
      // Use domain-specific API when a domain is selected
      const response = domainId
        ? await getDiseasesByDomain(domainId, (page - 1) * 10, 10, token, false)
        : await getDiseases((page - 1) * 10, 10, token, false);
      
      setDiseases(response.items);
      setTotalPages(response.pagination.pages);
      setHasNext(response.pagination.has_next);
      setHasPrev(response.pagination.has_prev);
      setError(null);
    } catch (err) {
      setError((err as Error).message || 'Không thể tải danh sách bệnh');
      console.error('Error fetching diseases:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token && activeDomainId) {
      fetchDiseases(activeDomainId, currentPage);
    }
  }, [token, activeDomainId, currentPage]);

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId || !token) return;
    
    try {
      await deleteDisease(token, deleteId);
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchDiseases(activeDomainId, currentPage); // Refresh list with current domain
    } catch (err) {
      setError((err as Error).message || 'Lỗi khi xóa bệnh');
    }
  };

  const handleDomainChange = (domainId: string) => {
    setActiveDomainId(domainId);
    setCurrentPage(1); // Reset to first page when changing domain
  };

  // Function to truncate description
  const truncateDescription = (text: string, maxLength: number = 30): string => {
    if (!text) return '';
    // Remove newlines and extra spaces for better display in table
    const cleanText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength) + '...';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl text-gray-700 font-bold">Quản lý Bệnh</h1>
        <Link 
          href="/admin/diseases/new" 
          className="bg-primary text-indigo-700 px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Thêm bệnh mới
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      {/* Domain Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px">
          {domains.map(domain => (
            <li key={domain.id} className="mr-2">
              <button
                onClick={() => handleDomainChange(domain.id)}
                className={`inline-block py-2 px-4 text-sm font-medium ${
                  activeDomainId === domain.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600 rounded-t-lg'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
                }`}
              >
                {domain.domain}
              </button>
            </li>
          ))}
        </ul>
      </div>

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
                  Tên bệnh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Bài viết
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Chẩn đoán
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {diseases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-700">
                    {activeDomainId 
                      ? `Không tìm thấy bệnh nào thuộc domain ${domains.find(d => d.id === activeDomainId)?.domain || ''}`
                      : 'Không tìm thấy bệnh nào'}
                  </td>
                </tr>
              ) : (
                diseases.map((disease) => (
                  <tr key={disease.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{disease.label}</div>
                      {disease.description && (
                        <div className="text-sm text-gray-700 max-w-xs">
                          {truncateDescription(disease.description)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {disease.domain?.domain || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {disease.article_id ? (
                        <Link
                          href={`/admin/articles/${disease.article_id}`}
                          className="text-primary hover:underline"
                        >
                          Xem bài viết
                        </Link>
                      ) : (
                        'Không có'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          disease.included_in_diagnosis
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {disease.included_in_diagnosis ? 'Bật' : 'Tắt'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/diseases/${disease.id}`}
                        className="text-primary text-gray-400 hover:text-primary/80 mr-4"
                      >
                        Chi tiết
                      </Link>
                      <Link
                        href={`/admin/diseases/${disease.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(disease.id);
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
                      Bạn có chắc chắn muốn xóa bệnh này? Hành động này không thể hoàn tác.
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
      {diseases.length > 0 && (
        <div className="mt-4 flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={!hasPrev}
            className="px-3 py-1 text-gray-800 rounded border disabled:opacity-50"
          >
            Trước
          </button>
          <span className="text-gray-800 text-sm">
            Trang {currentPage} / {totalPages || 1}
          </span>
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!hasNext}
            className="px-3 py-1 text-gray-800 rounded border disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
} 