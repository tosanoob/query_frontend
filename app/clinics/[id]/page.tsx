import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getClinic } from '@/app/lib/api/clinic';
import { getFullImageUrl } from '@/app/lib/utils/constants';
import { TextRenderer } from '@/app/lib/utils/TextRenderer';

interface ClinicPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Component để tạo Google Maps iframe
function GoogleMap({ address, clinicName }: { address: string; clinicName: string }) {
  // Encode địa chỉ để sử dụng trong Google Maps embed URL
  const encodedAddress = encodeURIComponent(address);
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&q=${encodedAddress}`;
  
  // Fallback nếu không có API key, dùng Google Maps search
  const fallbackUrl = `https://www.google.com/maps?q=${encodedAddress}&output=embed`;

  return (
    <div className="relative h-80 w-full rounded-lg overflow-hidden shadow-md">
      <iframe
        src={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? mapUrl : fallbackUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Vị trí ${clinicName}`}
        className="rounded-lg"
      />
    </div>
  );
}

async function ClinicDetail({ id }: { id: string }) {
  try {
    const clinic = await getClinic(id);

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header Section với ảnh cover */}
        <div className="relative h-64 md:h-80 w-full">
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
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-full h-full flex items-center justify-center">
              <svg className="w-20 h-20 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          
          {/* Clinic badge */}
          <div className="absolute top-6 right-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-blue-600 text-sm font-medium">Phòng khám chuyên khoa</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8">
          {/* Header Info */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">{clinic.name}</h1>
            <TextRenderer 
              text={clinic.description || 'Phòng khám chuyên điều trị các bệnh da liễu với trang thiết bị hiện đại'} 
              className="text-lg text-gray-700 leading-relaxed"
            />
          </div>
          
          {/* Contact Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Thông tin liên hệ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {clinic.location && (
                  <div className="flex items-start bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="bg-blue-100 rounded-full p-2 mr-4 flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Địa chỉ</p>
                      <p className="text-gray-700">{clinic.location}</p>
                    </div>
                  </div>
                )}
                {clinic.phone_number && (
                  <div className="flex items-start bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="bg-green-100 rounded-full p-2 mr-4 flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Số điện thoại</p>
                      <a href={`tel:${clinic.phone_number}`} className="text-green-600 hover:text-green-700 font-medium">
                        {clinic.phone_number}
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {clinic.website && (
                  <div className="flex items-start bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="bg-purple-100 rounded-full p-2 mr-4 flex-shrink-0">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9 3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Website</p>
                      <a href={clinic.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 font-medium break-all">
                        {clinic.website.length > 40 
                          ? clinic.website.substring(0, 40) + '...' 
                          : clinic.website}
                      </a>
                    </div>
                  </div>
                )}
                
                {/* Thêm thông tin giờ làm việc (giả định) */}
                <div className="flex items-start bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="bg-orange-100 rounded-full p-2 mr-4 flex-shrink-0">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 mb-1">Giờ làm việc</p>
                    <p className="text-gray-700">Thứ 2 - Thứ 7: 8:00 - 17:00</p>
                    <p className="text-gray-700">Chủ nhật: 8:00 - 12:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Thư viện hình ảnh */}
          {clinic.images && clinic.images.length > 1 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Hình ảnh phòng khám</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {clinic.images.map((img, index) => (
                  <div key={img.id} className="relative h-32 w-full rounded-lg overflow-hidden shadow-sm bg-gray-100 hover:shadow-md transition-shadow">
                    <Image
                      src={getFullImageUrl(img.image.base_url, img.image.rel_path)}
                      alt={`${clinic.name} - Ảnh ${index + 1}`}
                      fill
                      style={{ objectFit: "cover" }}
                      className="hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bản đồ */}
          {clinic.location && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Vị trí phòng khám</h2>
              <GoogleMap address={clinic.location} clinicName={clinic.name} />
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-blue-900 font-medium mb-1">Hướng dẫn đi lại</p>
                    <p className="text-blue-800 text-sm">Nhấp vào bản đồ để xem hướng dẫn chi tiết từ vị trí của bạn đến phòng khám.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Phần gợi ý chẩn đoán */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Bạn cần tư vấn trước khi đến khám?</h2>
            <p className="text-blue-800 mb-4">
              Sử dụng công cụ chẩn đoán trực tuyến của chúng tôi để kiểm tra tình trạng của bạn và nhận hướng dẫn y tế phù hợp.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/diagnosis" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Chẩn đoán ngay
              </Link>
              {clinic.phone_number && (
                <a href={`tel:${clinic.phone_number}`} className="inline-flex items-center px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Gọi ngay
                </a>
              )}
            </div>
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
  const resolvedParams = await params;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/clinics" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại danh sách phòng khám
          </Link>
        </div>

        <ClinicDetail id={resolvedParams.id} />
      </div>
    </div>
  );
} 