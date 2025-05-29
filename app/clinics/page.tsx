'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getClinics, Clinic } from '../lib/api/clinic';
import { getFullImageUrl } from '../lib/utils/constants';

export default function ClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const loadClinics = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const skip = (page - 1) * 10;
      const response = await getClinics(skip, 10);
      setClinics(response.items);
      setTotalPages(response.pagination.pages);
      setHasNext(response.pagination.has_next);
      setHasPrev(response.pagination.has_prev);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error loading clinics:', err);
      setError((err as Error).message || 'Failed to load clinics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClinics(currentPage);
  }, [currentPage]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">Danh sách phòng khám</h1>
        <p className="text-gray-600 max-w-3xl">
          Danh sách các phòng khám uy tín chuyên khoa da liễu. Các cơ sở y tế được liệt kê dưới đây
          đều có đội ngũ bác sĩ giàu kinh nghiệm và thiết bị hiện đại.
        </p>
      </div>

      <div className="mb-8">
        <div className="relative max-w-3xl">
          <input
            type="text"
            placeholder="Tìm kiếm phòng khám..."
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
              <div className="h-48 w-full bg-gray-200"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {clinics.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Không có dữ liệu phòng khám</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {clinics.map((clinic) => (
                <Link href={`/clinics/${clinic.id}`} key={clinic.id} className="block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  {clinic.images && clinic.images.length > 0 && (
                    <div className="relative h-48 w-full">
                      <Image 
                        src={getFullImageUrl(
                          clinic.images.find(img => img.usage === 'cover')?.image.base_url || clinic.images[0].image.base_url,
                          clinic.images.find(img => img.usage === 'cover')?.image.rel_path || clinic.images[0].image.rel_path
                        )}
                        alt={clinic.name}
                        fill
                        style={{objectFit: "cover"}}
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">
                      {clinic.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {clinic.location 
                        ? `Địa chỉ: ${clinic.location.length > 100 
                            ? clinic.location.substring(0, 100) + '...' 
                            : clinic.location}` 
                        : 'Không có địa chỉ'}
                    </p>
                    {clinic.phone_number && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Điện thoại:</span> {clinic.phone_number}
                      </p>
                    )}
                    {clinic.website && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Website:</span> {clinic.website.length > 100 
                          ? clinic.website.substring(0, 100) + '...' 
                          : clinic.website}
                      </p>
                    )}
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