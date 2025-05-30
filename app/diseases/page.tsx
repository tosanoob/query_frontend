'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { getDiseases, Disease } from '../lib/api/disease';
import { getDomains, Domain } from '../lib/api/domain';

// Component để hiển thị danh sách bệnh
async function DiseasesList({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  
  try {
    const response = await getDiseases((page - 1) * 10, 10);
    const diseases = response.items;
    const { pages, has_next, has_prev } = response.pagination;

    if (!diseases.length) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-500">Không có dữ liệu bệnh</p>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {diseases.map((disease: Disease) => (
            <Link href={`/diseases/${disease.id}`} key={disease.id} className="group block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="bg-gray-100 text-gray-600 text-xs font-medium rounded-full px-2.5 py-0.5">
                    Da liễu
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                  {disease.label}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {disease.description 
                    ? (disease.description.length > 100 
                        ? disease.description.substring(0, 100) + '...' 
                        : disease.description)
                    : 'Không có mô tả chi tiết'}
                </p>
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                  <span className="text-sm text-blue-600 group-hover:text-blue-800 inline-flex items-center">
                    Xem chi tiết
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination controls */}
        <div className="mt-8 flex justify-center items-center space-x-2">
          <Link
            href={`/diseases?page=${page - 1}`}
            className={`px-4 py-2 rounded-md border ${
              !has_prev ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'hover:bg-gray-50'
            }`}
            aria-disabled={!has_prev}
            tabIndex={!has_prev ? -1 : undefined}
          >
            Trang trước
          </Link>
          <span className="text-sm text-gray-600">
            Trang {page} / {pages}
          </span>
          <Link
            href={`/diseases?page=${page + 1}`}
            className={`px-4 py-2 rounded-md border ${
              !has_next ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'hover:bg-gray-50'
            }`}
            aria-disabled={!has_next}
            tabIndex={!has_next ? -1 : undefined}
          >
            Trang sau
          </Link>
        </div>
      </>
    );
  } catch (error) {
    console.error('Error fetching diseases:', error);
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Không thể tải dữ liệu bệnh</p>
      </div>
    );
  }
}

export default function DiseasesPage() {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [standardDomain, setStandardDomain] = useState<Domain | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // Find the STANDARD domain first, then load diseases
  useEffect(() => {
    const loadStandardDomain = async () => {
      try {
        // Load domains to find the STANDARD domain
        const response = await getDomains('', 0, 100); // Passing empty token for public access, getting all domains
        const standardDomain = response.items.find(domain => domain.domain === 'STANDARD');
        
        if (standardDomain) {
          setStandardDomain(standardDomain);
        } else {
          setError('Không tìm thấy domain chuẩn');
        }
      } catch (err) {
        console.error('Error loading domains:', err);
        setError((err as Error).message || 'Không thể tải domain chuẩn');
      }
    };
    
    loadStandardDomain();
  }, []);

  const loadDiseases = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    
    if (!standardDomain) {
      setIsLoading(false);
      return;
    }
    
    try {
      const skip = (page - 1) * 10;
      const response = await getDiseases(skip, 10);
      
      // Filter diseases to only show those from STANDARD domain
      const filteredDiseases = response.items.filter(
        disease => disease.domain?.domain === 'STANDARD' || disease.domain?.id === standardDomain.id
      );
      
      setDiseases(filteredDiseases);
      setTotalPages(response.pagination.pages);
      setHasNext(response.pagination.has_next);
      setHasPrev(response.pagination.has_prev);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error loading diseases:', err);
      setError((err as Error).message || 'Failed to load diseases');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (standardDomain) {
      loadDiseases(currentPage);
    }
  }, [standardDomain, currentPage]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-blue-700">Danh mục bệnh da liễu</h1>
        <p className="text-gray-600 max-w-3xl">
          Khám phá thông tin chi tiết về các loại bệnh da liễu. Tìm hiểu về triệu chứng, nguyên nhân, 
          và cách chăm sóc da phù hợp với từng loại bệnh.
        </p>
      </div>

      <div className="mb-8">
        <div className="relative max-w-3xl">
          <input
            type="text"
            placeholder="Tìm kiếm bệnh da liễu..."
            className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg 
              className="w-5 h-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse p-5">
              <div className="flex justify-between mb-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {diseases.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Không có dữ liệu bệnh</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {diseases.map((disease) => (
                <Link href={`/diseases/${disease.id}`} key={disease.id} className="group block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="bg-gray-100 text-gray-600 text-xs font-medium rounded-full px-2.5 py-0.5">
                        Da liễu
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                      {disease.label}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {disease.description 
                        ? (disease.description.length > 100 
                            ? disease.description.substring(0, 100) + '...' 
                            : disease.description)
                        : 'Không có mô tả chi tiết'}
                    </p>
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                      <span className="text-sm text-blue-600 group-hover:text-blue-800 inline-flex items-center">
                        Xem chi tiết
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination controls */}
          <div className="mt-8 flex justify-center items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={!hasPrev}
              className={`px-4 py-2 rounded-md border ${
                !hasPrev ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'hover:bg-gray-50'
              }`}
            >
              Trang trước
            </button>
            <span className="text-sm text-gray-600">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={!hasNext}
              className={`px-4 py-2 rounded-md border ${
                !hasNext ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'hover:bg-gray-50'
              }`}
            >
              Trang sau
            </button>
          </div>
        </>
      )}
    </div>
  );
} 