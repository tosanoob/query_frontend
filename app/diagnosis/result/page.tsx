'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Define types for the API response
interface Disease {
  name: string;
  score: number;
  description?: string;
}

type LabelArray = [string, number][];

interface DiagnosisResult {
  labels: Disease[] | LabelArray;
  response: string;
}

export default function DiagnosisResultPage() {
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [processedLabels, setProcessedLabels] = useState<Disease[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');

  useEffect(() => {
    // Retrieve diagnosis result from localStorage
    const storedResult = localStorage.getItem('diagnosis-result');
    const storedImagePreview = localStorage.getItem('diagnosis-image-preview');
    
    if (storedResult) {
      try {
        const parsedResult = JSON.parse(storedResult) as DiagnosisResult;
        setDiagnosisResult(parsedResult);
        
        // Xử lý cấu trúc dữ liệu labels
        if (parsedResult.labels && parsedResult.labels.length > 0) {
          let formattedLabels: Disease[] = [];
          
          // Kiểm tra nếu labels là mảng 2D [[name, score], [name, score], ...]
          if (Array.isArray(parsedResult.labels[0])) {
            // Đây là mảng 2D
            const labelArray = parsedResult.labels as LabelArray;
            formattedLabels = labelArray.map((label) => ({
              name: label[0],
              score: label[1]
            }));
          } else {
            // Nếu đã là định dạng object
            formattedLabels = parsedResult.labels as Disease[];
          }
          
          // Sắp xếp labels theo điểm số giảm dần
          formattedLabels.sort((a, b) => b.score - a.score);
          setProcessedLabels(formattedLabels);
        }
      } catch (error) {
        console.error('Error parsing diagnosis result:', error);
      }
    }
    
    if (storedImagePreview) {
      setImagePreview(storedImagePreview);
    }
    
    setLoading(false);
  }, []);

  const renderProbabilityBar = (probability: number) => {
    const percentage = Math.round(probability * 100);
    
    // Cải thiện màu sắc cho thanh điểm số dựa trên giá trị
    let colorClass;
    if (percentage >= 70) {
      colorClass = 'bg-red-500'; // Nguy cơ cao - màu đỏ
    } else if (percentage >= 40) {
      colorClass = 'bg-yellow-500'; // Nguy cơ trung bình - màu vàng
    } else {
      colorClass = 'bg-blue-400'; // Nguy cơ thấp - màu xanh
    }
    
    return (
      <div className="flex items-center w-full">
        <div className="flex-grow">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`${colorClass} h-3 rounded-full transition-all duration-500 ease-in-out`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
        <div className="ml-3 w-12 text-right">
          <span className="text-sm font-medium text-gray-700">
            {percentage}%
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto mb-8"></div>
            <div className="h-64 bg-gray-200 rounded w-full mb-4"></div>
          </div>
          <p>Đang tải kết quả chẩn đoán...</p>
        </div>
      </div>
    );
  }

  if (!diagnosisResult || processedLabels.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Không tìm thấy kết quả chẩn đoán</h1>
          <p className="text-gray-600 mb-6">Không tìm thấy dữ liệu chẩn đoán hoặc dữ liệu không hợp lệ. Vui lòng thực hiện chẩn đoán mới.</p>
          <Link href="/diagnosis" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Chẩn đoán mới
          </Link>
        </div>
      </div>
    );
  }

  // Lấy bệnh có điểm số cao nhất
  const mostLikelyDisease = processedLabels[0];

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Kết quả chẩn đoán</h1>
          <p className="text-gray-300">Dựa trên hình ảnh và triệu chứng đã cung cấp</p>
        </div>

        {mostLikelyDisease && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Kết quả chẩn đoán với độ tin cậy cao nhất: <span className="font-semibold">{mostLikelyDisease.name}</span> ({Math.round(mostLikelyDisease.score * 100)}%)
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Tổng quan
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'details'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Chi tiết
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-1">
                  {imagePreview ? (
                    <div className="relative h-64 w-full rounded overflow-hidden shadow border border-gray-200">
                      <Image
                        src={imagePreview}
                        alt="Hình ảnh bệnh"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  ) : (
                    <div className="h-64 w-full rounded bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-500">Không có hình ảnh</p>
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <h2 className="text-xl text-gray-700 font-semibold mb-4">Phân tích</h2>
                  <p className="text-gray-700 mb-4">
                    {diagnosisResult.response}
                  </p>
                  
                  <h3 className="font-semibold text-gray-700 mb-4">Khả năng các bệnh:</h3>
                  <div className="space-y-4">
                    {processedLabels.map((disease, index) => (
                      <div key={index} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-gray-800">{disease.name}</span>
                        </div>
                        {renderProbabilityBar(disease.score)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div>
                <div className="border-b border-gray-200 pb-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4">Mô tả chi tiết các khả năng</h2>
                  <div className="space-y-4">
                    {processedLabels.map((disease, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <h3 className="font-medium text-lg text-gray-800">{disease.name}</h3>
                          <div className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            {Math.round(disease.score * 100)}%
                          </div>
                        </div>
                        <div className="mt-3">
                          {renderProbabilityBar(disease.score)}
                        </div>
                        <p className="text-gray-700 mt-3">
                          {disease.description || 'Không có mô tả chi tiết.'}
                        </p>
                        <Link href={`/diseases/detail?name=${encodeURIComponent(disease.name)}`} className="mt-3 inline-flex items-center text-blue-600 hover:text-blue-800 text-sm">
                          Xem thêm thông tin
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">Phản hồi từ mô hình AI</h2>
                  <div className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {diagnosisResult.response}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <Link href="/diagnosis" className="px-4 py-2 text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
            </svg>
            Chẩn đoán mới
          </Link>
          <Link href="/" className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center">
            Trở về trang chủ
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
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