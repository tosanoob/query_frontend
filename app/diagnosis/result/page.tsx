'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Dữ liệu mẫu cho kết quả chẩn đoán
const diagnosisResult = {
  imageUrl: '/placeholder-diagnosis-result.jpg',
  diseases: [
    { name: 'Viêm da cơ địa', probability: 0.85, description: 'Còn gọi là chàm (eczema), là tình trạng viêm và kích ứng da mạn tính, thường gây ngứa và đỏ.' },
    { name: 'Vảy nến', probability: 0.45, description: 'Bệnh tự miễn gây ra các mảng vảy đỏ, dày trên da, thường ở khuỷu tay, đầu gối và da đầu.' },
    { name: 'Viêm da tiếp xúc', probability: 0.30, description: 'Phản ứng viêm da do tiếp xúc với chất gây kích ứng hoặc dị ứng.' },
  ],
  analysis: 'Dựa trên hình ảnh và mô tả triệu chứng, hệ thống nhận thấy các dấu hiệu đặc trưng của viêm da cơ địa như da đỏ, khô và có vảy. Các vùng bị ảnh hưởng thường thấy ở nếp gấp tay và chân. Đây là tình trạng mạn tính nhưng có thể kiểm soát được với điều trị phù hợp.',
  recommendations: [
    'Giữ ẩm cho da thường xuyên bằng kem dưỡng ẩm không mùi',
    'Tránh các yếu tố kích thích như xà phòng mạnh, nước nóng, thời tiết khô',
    'Sử dụng kem corticosteroid theo chỉ định của bác sĩ để giảm viêm',
    'Tránh gãi để ngăn ngừa nhiễm trùng thứ phát',
  ],
  clinics: [
    { id: 1, name: 'Phòng khám Da liễu Trung tâm', address: '123 Đường Nguyễn Văn A, Quận 1, TP.HCM', phone: '028-1234-5678' },
    { id: 2, name: 'Bệnh viện Da liễu TP.HCM', address: '456 Đường Lê Lợi, Quận 1, TP.HCM', phone: '028-8765-4321' },
  ]
};

export default function DiagnosisResultPage() {
  // Trong thực tế, sẽ lấy kết quả từ API dựa vào ID chẩn đoán hoặc từ state
  useEffect(() => {
    // Mô phỏng việc lấy dữ liệu từ API
    console.log('Lấy kết quả chẩn đoán...');
    // Trong thực tế sẽ có fetch API ở đây
  }, []);

  const renderProbabilityBar = (probability: number) => {
    const percentage = Math.round(probability * 100);
    let colorClass = 'bg-green-500';
    
    if (percentage < 40) colorClass = 'bg-gray-400';
    else if (percentage < 70) colorClass = 'bg-yellow-500';
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`${colorClass} h-2.5 rounded-full`}
          style={{ width: `${percentage}%` }}
        ></div>
        <span className="text-xs font-medium text-gray-600 mt-1 inline-block">
          {percentage}%
        </span>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kết quả chẩn đoán</h1>
          <p className="text-gray-600">Dựa trên hình ảnh và triệu chứng đã cung cấp</p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="md:col-span-1">
                <div className="relative h-64 w-full rounded overflow-hidden">
                  <Image
                    src={diagnosisResult.imageUrl}
                    alt="Hình ảnh bệnh"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Phân tích</h2>
                <p className="text-gray-700 mb-4">{diagnosisResult.analysis}</p>
                
                <h3 className="font-medium mb-2">Khả năng các bệnh:</h3>
                <div className="space-y-3">
                  {diagnosisResult.diseases.map((disease, index) => (
                    <div key={index} className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{disease.name}</span>
                      </div>
                      {renderProbabilityBar(disease.probability)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Mô tả chi tiết các khả năng</h2>
              <div className="space-y-4">
                {diagnosisResult.diseases.map((disease, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-lg mb-1">{disease.name}</h3>
                    <p className="text-gray-700">{disease.description}</p>
                    <Link href={`/diseases/detail?name=${encodeURIComponent(disease.name)}`} className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block">
                      Xem thêm thông tin →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Khuyến nghị</h2>
              <ul className="list-disc pl-5 space-y-2">
                {diagnosisResult.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-gray-700">{recommendation}</li>
                ))}
              </ul>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold mb-4">Các phòng khám khuyến nghị</h2>
              <div className="space-y-4">
                {diagnosisResult.clinics.map((clinic) => (
                  <div key={clinic.id} className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-lg mb-1">{clinic.name}</h3>
                    <p className="text-gray-700 mb-1">{clinic.address}</p>
                    <p className="text-gray-700">
                      <span className="font-medium">Điện thoại:</span> {clinic.phone}
                    </p>
                    <Link href={`/clinics/${clinic.id}`} className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block">
                      Xem thông tin phòng khám →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Link href="/diagnosis" className="px-4 py-2 text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors">
            Chẩn đoán mới
          </Link>
          <Link href="/" className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
            Trở về trang chủ
          </Link>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Lưu ý: Kết quả chẩn đoán chỉ mang tính chất tham khảo và không thay thế cho tư vấn y tế chuyên nghiệp.
            Vui lòng tham khảo ý kiến bác sĩ cho chẩn đoán và điều trị chính xác.
          </p>
        </div>
      </div>
    </div>
  );
} 