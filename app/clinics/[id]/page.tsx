import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getClinic } from '@/app/lib/api/clinic';
import { getFullImageUrl } from '@/app/lib/utils/constants';

interface ClinicPageProps {
  params: {
    id: string;
  };
}

async function ClinicDetail({ id }: { id: string }) {
  try {
    const clinic = await getClinic(id);

    return (
      <div>
        <div className="mb-8">
          <div className="relative h-64 md:h-80 w-full rounded-xl overflow-hidden shadow-lg mb-6">
            {clinic.images && clinic.images.length > 0 ? (
              <Image 
                src={getFullImageUrl(
                  clinic.images.find(img => img.usage === 'cover')?.image.base_url || clinic.images[0].image.base_url,
                  clinic.images.find(img => img.usage === 'cover')?.image.rel_path || clinic.images[0].image.rel_path
                )}
                alt={clinic.name}
                fill
                style={{objectFit: "cover"}}
                priority
              />
            ) : (
              <Image 
                src="/placeholder-clinic-detail.jpg"
                alt={clinic.name}
                fill
                style={{objectFit: "cover"}}
              />
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{clinic.name}</h1>
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl text-gray-700 font-semibold mb-4">Thông tin liên hệ</h2>
                <ul className="space-y-3">
                  {clinic.location && (
                    <li className="flex">
                      <svg className="w-5 h-5 text-gray-700 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-700">{clinic.location}</span>
                    </li>
                  )}
                  {clinic.phone_number && (
                    <li className="flex">
                      <svg className="w-5 h-5 text-gray-700 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-700">{clinic.phone_number}</span>
                    </li>
                  )}
                  {clinic.website && (
                    <li className="flex">
                      <svg className="w-5 h-5 text-gray-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <a href={clinic.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {clinic.website.length > 100 
                          ? clinic.website.substring(0, 100) + '...' 
                          : clinic.website}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <h2 className="text-xl text-gray-700 font-semibold mb-4">Giới thiệu</h2>
                <p className="text-gray-700">
                  {clinic.description || 'Không có thông tin mô tả chi tiết về phòng khám này.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Thư viện hình ảnh */}
        {clinic.images && clinic.images.length > 1 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Hình ảnh phòng khám</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {clinic.images.map((img, index) => (
                <div key={img.id} className="relative h-40 w-full rounded overflow-hidden shadow-sm">
                  <Image
                    src={getFullImageUrl(img.image.base_url, img.image.rel_path)}
                    alt={`${clinic.name} - Ảnh ${index + 1}`}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Phần gợi ý chẩn đoán */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 mb-8">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Bạn cần tư vấn trước khi đến khám?</h2>
          <p className="text-blue-700 mb-4">
            Sử dụng công cụ chẩn đoán trực tuyến của chúng tôi để kiểm tra tình trạng của bạn và nhận hướng dẫn y tế phù hợp.
          </p>
          <Link href="/diagnosis" className="inline-flex justify-center items-center py-3 px-6 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
            Chẩn đoán ngay
          </Link>
        </div>

        {/* Bản đồ (placeholder) */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Vị trí phòng khám</h2>
          <div className="rounded-lg overflow-hidden shadow-md bg-gray-200 h-80 flex items-center justify-center">
            <p className="text-gray-600">Bản đồ đang được cập nhật</p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in ClinicDetail:', error);
    notFound();
  }
}

export default async function ClinicPage({ params }: ClinicPageProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/clinics" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Quay lại danh sách phòng khám
        </Link>
      </div>

      <ClinicDetail id={params.id} />
    </div>
  );
} 