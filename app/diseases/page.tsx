import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getDiseases } from '../lib/api/disease';

// Component để hiển thị danh sách bệnh
async function DiseasesList() {
  try {
    const diseases = await getDiseases(0, 100);

    if (!diseases.length) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-500">Không có dữ liệu bệnh</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {diseases.map((disease) => (
          <Link href={`/diseases/${disease.id}`} key={disease.id} className="group block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <div className="relative h-48 w-full">
              <Image 
                src={`/placeholder-disease.jpg`}
                alt={disease.label}
                fill
                style={{objectFit: "cover"}}
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                {disease.label}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-3">
                {disease.description || 'Không có mô tả chi tiết'}
              </p>
            </div>
          </Link>
        ))}
      </div>
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
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Danh mục bệnh da liễu</h1>
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

      <Suspense fallback={
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
              <div className="h-48 w-full bg-gray-200"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      }>
        <DiseasesList />
      </Suspense>
    </div>
  );
} 