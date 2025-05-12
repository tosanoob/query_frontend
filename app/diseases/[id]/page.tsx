import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDisease } from '@/app/lib/api/disease';
import { getArticle } from '@/app/lib/api/article';

interface DiseasePageProps {
  params: {
    id: string;
  };
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
      <div>
        <div className="mb-8">
          <div className="relative h-64 md:h-80 w-full rounded-xl overflow-hidden shadow-lg mb-6">
            <Image
              src="/placeholder-disease-detail.jpg"
              alt={disease.label}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{disease.label}</h1>
          <div className="prose max-w-none mb-8">
            <p className="text-lg text-gray-700">{disease.description || 'Không có mô tả chi tiết'}</p>
          </div>
        </div>

        {/* Nếu có bài viết liên quan */}
        {article && (
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-semibold mb-4">Thông tin chi tiết</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>
        )}

        {/* Phần gợi ý chẩn đoán */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 mb-8">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Bạn có triệu chứng tương tự?</h2>
          <p className="text-blue-700 mb-4">
            Sử dụng công cụ chẩn đoán trực tuyến của chúng tôi để kiểm tra tình trạng của bạn và nhận hướng dẫn y tế phù hợp.
          </p>
          <Link href="/diagnosis" className="inline-flex justify-center items-center py-3 px-6 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
            Chẩn đoán ngay
          </Link>
        </div>

        {/* Phần phòng khám gợi ý */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Các phòng khám chuyên khoa</h2>
          <p className="text-gray-600 mb-4">
            Đây là một số phòng khám chuyên khoa có thể giúp đỡ nếu bạn nghi ngờ mình mắc phải căn bệnh này.
          </p>
          <div className="bg-white rounded-lg shadow-md p-4">
            <ul className="divide-y divide-gray-200">
              <li className="py-4">
                <Link href="/clinics" className="text-blue-600 hover:text-blue-800 font-medium">
                  Xem danh sách phòng khám
                </Link>
              </li>
            </ul>
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
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/diseases" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Quay lại danh sách bệnh
        </Link>
      </div>

      <DiseaseDetail id={params.id} />
    </div>
  );
} 