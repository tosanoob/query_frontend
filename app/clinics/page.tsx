import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getClinics } from '../lib/api/clinic';
import { getFullImageUrl } from '../lib/utils/constants';

// Component để hiển thị danh sách phòng khám
async function ClinicsList() {
  try {
    const clinics = await getClinics(0, 100);

    if (!clinics.length) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-500">Không có dữ liệu phòng khám</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {clinics.map((clinic) => (
          <Link href={`/clinics/${clinic.id}`} key={clinic.id} className="block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <div className="relative h-48 w-full">
              {clinic.images && clinic.images.length > 0 ? (
                <Image 
                  src={getFullImageUrl(
                    clinic.images.find(img => img.usage === 'cover')?.image.base_url || clinic.images[0].image.base_url,
                    clinic.images.find(img => img.usage === 'cover')?.image.rel_path || clinic.images[0].image.rel_path
                  )}
                  alt={clinic.name}
                  fill
                  style={{objectFit: "cover"}}
                />
              ) : (
                <Image 
                  src={`/placeholder-clinic.jpg`}
                  alt={clinic.name}
                  fill
                  style={{objectFit: "cover"}}
                />
              )}
            </div>
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
    );
  } catch (error) {
    console.error('Error fetching clinics:', error);
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Không thể tải dữ liệu phòng khám</p>
      </div>
    );
  }
}

export default function ClinicsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Danh sách phòng khám</h1>
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

      <Suspense fallback={
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
      }>
        <ClinicsList />
      </Suspense>
    </div>
  );
} 