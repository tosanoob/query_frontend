import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDisease } from '@/app/lib/api/disease';
import { getArticle } from '@/app/lib/api/article';

interface DiseasePageProps {
  params: Promise<{
    id: string;
  }>;
}

async function DiseaseDetail({ id }: { id: string }) {
  try {
    const disease = await getDisease(id);
    let article = null;

    // Nếu có article_id, lấy thông tin bài viết
    if (disease.article_id) {
      try {
        article = await getArticle(disease.article_id);
      } catch (error) {
        console.error('Error fetching article:', error);
      }
    }

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <span className="text-blue-100 text-sm font-medium">Bệnh da liễu</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">{disease.label}</h1>
        </div>

        {/* Content Section */}
        <div className="p-8">
          <div className="mb-8">
            <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">{disease.description || 'Không có mô tả chi tiết'}</p>
          </div>

          {/* Nếu có bài viết liên quan */}
          {article && (
            <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Thông tin chi tiết</h2>
              <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>
          )}

          {/* Phần gợi ý chẩn đoán */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Bạn có triệu chứng tương tự?</h2>
            <p className="text-blue-800 mb-4">
              Sử dụng công cụ chẩn đoán trực tuyến của chúng tôi để kiểm tra tình trạng của bạn và nhận hướng dẫn y tế phù hợp.
            </p>
            <Link href="/diagnosis" className="inline-flex justify-center items-center py-3 px-6 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm">
              Chẩn đoán ngay
            </Link>
          </div>

          {/* Triệu chứng thường gặp */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Triệu chứng thường gặp</h2>
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <ul className="space-y-3">
                {/* Since 'symptoms' might not exist in the API response, we check for custom properties */}
                {disease.description ? (
                  // Fake symptoms based on description (since the API doesn't have symptoms)
                  disease.description.split('. ').slice(0, 3).map((symptom: string, index: number) => (
                    symptom.trim() && (
                      <li key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span className="text-gray-800">{symptom.trim()}</span>
                      </li>
                    )
                  )).filter(Boolean)
                ) : (
                  <li className="text-gray-600">Không có thông tin về triệu chứng</li>
                )}
              </ul>
            </div>
          </div>

          {/* Phần phòng khám gợi ý */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Các phòng khám chuyên khoa</h2>
            <p className="text-gray-700 mb-4">
              Đây là một số phòng khám chuyên khoa có thể giúp đỡ nếu bạn nghi ngờ mình mắc phải căn bệnh này.
            </p>
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-gray-800 font-medium">Danh sách phòng khám chuyên khoa</span>
                </div>
                <Link href="/clinics" className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
                  Xem tất cả
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in DiseaseDetail:', error);
    notFound();
  }
}

export default async function DiseasePage({ params }: DiseasePageProps) {
  const resolvedParams = await params;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/diseases" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Quay lại danh sách bệnh
          </Link>
        </div>

        <DiseaseDetail id={resolvedParams.id} />
      </div>
    </div>
  );
} 