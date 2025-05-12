import Link from 'next/link';
import Image from 'next/image';
import { getDiseases } from './lib/api/disease';
import { getArticles } from './lib/api/article';
import { getClinics } from './lib/api/clinic';
import { Suspense } from 'react';
import { getFullImageUrl } from './lib/utils/constants';

// Tạo một component để hiển thị danh sách bệnh
async function DiseasesList() {
  // Lấy dữ liệu bệnh từ API
  try {
    const diseases = await getDiseases(0, 4);
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {diseases.length > 0 ? (
          diseases.map((disease) => (
            <Link href={`/diseases/${disease.id}`} key={disease.id} className="group block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              {/* <div className="relative h-48 w-full">
                {disease.images && disease.images.length > 0 ? (
                  <Image 
                    src={getFullImageUrl(
                      disease.images.find(img => img.usage === 'cover')?.image.base_url || disease.images[0].image.base_url,
                      disease.images.find(img => img.usage === 'cover')?.image.rel_path || disease.images[0].image.rel_path
                    )}
                    alt={disease.label}
                    fill
                    style={{objectFit: "cover"}}
                  />
                ) : (
                  <Image 
                    src={`/placeholder-disease.jpg`}
                    alt={disease.label}
                    fill
                    style={{objectFit: "cover"}}
                  />
                )}
              </div> */}
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                  {disease.label}
                </h3>
                <p className="text-sm text-gray-600">
                  {disease.description 
                    ? (disease.description.length > 100 
                        ? disease.description.substring(0, 100) + '...' 
                        : disease.description)
                    : 'Không có mô tả chi tiết'}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">Không có dữ liệu bệnh</p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error fetching diseases:', error);
    return (
      <div className="col-span-full text-center py-10">
        <p className="text-red-500">Không thể tải dữ liệu bệnh</p>
      </div>
    );
  }
}

// Tạo một component để hiển thị danh sách phòng khám
async function ClinicsList() {
  // Lấy dữ liệu phòng khám từ API
  try {
    const clinics = await getClinics(0, 3);
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {clinics.length > 0 ? (
          clinics.map((clinic) => (
            <Link href={`/clinics/${clinic.id}`} key={clinic.id} className="block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="relative h-40 w-full">
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
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Điện thoại:</span> {clinic.phone_number}
                  </p>
                )}
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">Không có dữ liệu phòng khám</p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error fetching clinics:', error);
    return (
      <div className="col-span-full text-center py-10">
        <p className="text-red-500">Không thể tải dữ liệu phòng khám</p>
      </div>
    );
  }
}

export default async function Home() {
  // Get a featured article for the hero image
  let heroImage = '/placeholder-healthcare.jpg';
  let diagnosisImage = '/placeholder-ai.jpg';
  
  try {
    const articles = await getArticles(0, 5);
    
    // Find an article with cover image for hero section
    const heroArticle = articles.find(article => 
      article.images && article.images.length > 0 && 
      article.images.some(img => img.usage === 'cover')
    );
    
    if (heroArticle && heroArticle.images) {
      const coverImage = heroArticle.images.find(img => img.usage === 'cover') || heroArticle.images[0];
      heroImage = getFullImageUrl(coverImage.image.base_url, coverImage.image.rel_path);
    }
    
    // Find a different article for the diagnosis section
    const diagnosisArticle = articles.find(article => 
      article !== heroArticle && 
      article.images && article.images.length > 0
    );
    
    if (diagnosisArticle && diagnosisArticle.images) {
      const coverImage = diagnosisArticle.images.find(img => img.usage === 'cover') || diagnosisArticle.images[0];
      diagnosisImage = getFullImageUrl(coverImage.image.base_url, coverImage.image.rel_path);
    }
  } catch (error) {
    console.error('Error fetching articles for images:', error);
  }
  
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-blue-50 to-teal-50 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
                Hỗ trợ thông tin & chẩn đoán bệnh da liễu
              </h1>
              <p className="text-xl mb-6 text-gray-700">
                Kết hợp công nghệ AI tiên tiến và kiến thức y khoa chuyên sâu để hỗ trợ bạn với các vấn đề về da liễu.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/diagnosis" className="inline-flex justify-center items-center py-3 px-6 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
                  Chẩn đoán ngay
                </Link>
                <Link href="/diseases" className="inline-flex justify-center items-center py-3 px-6 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors">
                  Tìm hiểu thêm
                </Link>
              </div>
            </div>
            <div className="relative h-64 md:h-80 lg:h-96 w-full rounded-xl overflow-hidden shadow-lg">
              <Image
                src={heroImage}
                alt="Bệnh da liễu"
                fill
                style={{objectFit: "cover"}}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bệnh thường gặp */}
      <section className="w-full py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">Bệnh da liễu thường gặp</h2>
            <p className="text-gray-600">Tìm hiểu thông tin về các bệnh da liễu phổ biến</p>
          </div>
          
          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((item) => (
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
          
          <div className="text-center mt-8">
            <Link href="/diseases" className="text-blue-600 hover:text-blue-800 font-medium">
              Xem tất cả các bệnh da liễu →
            </Link>
          </div>
        </div>
      </section>

      {/* Chẩn đoán bằng AI */}
      <section className="w-full py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="order-2 md:order-1">
              <div className="relative h-64 md:h-80 w-full rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={diagnosisImage}
                  alt="Chẩn đoán bằng AI"
                  fill
                  style={{objectFit: "cover"}}
                />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
                Chẩn đoán bằng công nghệ AI
              </h2>
              <p className="text-gray-700 mb-6">
                Sử dụng trí tuệ nhân tạo tiên tiến, chúng tôi giúp nhận diện các vấn đề da liễu qua hình ảnh và mô tả triệu chứng của bạn.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Phân tích hình ảnh chính xác</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Nhận diện đặc điểm bệnh</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Tư vấn bước tiếp theo</span>
                </li>
              </ul>
              <Link href="/diagnosis" className="inline-flex justify-center items-center py-3 px-6 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
                Thử chẩn đoán
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Phòng khám */}
      <section className="w-full py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">Phòng khám đối tác</h2>
            <p className="text-gray-600">Các phòng khám da liễu uy tín trên địa bàn thành phố</p>
          </div>
          
          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
                  <div className="h-40 w-full bg-gray-200"></div>
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
          
          <div className="text-center mt-8">
            <Link href="/clinics" className="text-blue-600 hover:text-blue-800 font-medium">
              Xem tất cả phòng khám →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
