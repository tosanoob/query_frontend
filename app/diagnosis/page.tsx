'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, API_ENDPOINTS } from '../lib/utils/constants';

export default function DiagnosisPage() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (maximum 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('Kích thước file quá lớn. Vui lòng chọn file dưới 10MB.');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Vui lòng chọn file hình ảnh.');
        return;
      }
      
      setErrorMessage(null);
      setImage(file);
      
      // Convert image to RGB format before creating base64 string
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const img = document.createElement('img');
        img.onload = () => {
          // Create a canvas to draw the image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            setErrorMessage('Không thể xử lý hình ảnh. Vui lòng thử lại.');
            return;
          }
          
          // Set canvas dimensions to match image
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw image with white background to ensure RGB format
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          
          // Convert canvas to data URL (JPEG for RGB format)
          try {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            setImagePreview(dataUrl);
          } catch (error) {
            console.error('Lỗi khi chuyển đổi hình ảnh:', error);
            setErrorMessage('Không thể xử lý hình ảnh. Vui lòng thử lại.');
          }
        };
        
        img.onerror = () => {
          setErrorMessage('Không thể tải hình ảnh. Vui lòng thử lại.');
        };
        
        if (event.target?.result) {
          img.src = event.target.result as string;
        }
      };
      
      reader.onerror = () => {
        setErrorMessage('Lỗi khi đọc file. Vui lòng thử lại.');
        setImage(null);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!image && !symptoms) {
      setErrorMessage('Vui lòng tải lên hình ảnh hoặc mô tả triệu chứng để tiến hành chẩn đoán');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      // Xóa kết quả chẩn đoán cũ trước khi bắt đầu chẩn đoán mới
      localStorage.removeItem('diagnosis-result');
      
      // Tạo request payload
      const payload: { image_base64?: string; text?: string } = {};
      
      if (image && imagePreview) {
        // Lấy phần base64 từ string (loại bỏ phần prefix "data:image/jpeg;base64,")
        const base64Image = imagePreview.split(',')[1];
        payload.image_base64 = base64Image;
        
        // Xóa cache cũ trước khi lưu ảnh mới
        try {
          if ('caches' in window) {
            // Xóa cache cũ
            await caches.delete('diagnosis-images');
            
            // Tạo cache mới
            const cache = await caches.open('diagnosis-images');
            const response = new Response(image);
            await cache.put('latest-image', response);
            
            // Cập nhật imagePreview vào localStorage, ghi đè nếu đã tồn tại
            localStorage.setItem('diagnosis-image-preview', imagePreview);
          }
        } catch (cacheError) {
          console.error('Lỗi khi lưu cache:', cacheError);
          // Không dừng quy trình nếu việc lưu cache thất bại
        }
      } else {
        // Nếu không có ảnh mới, xóa ảnh cũ trong cache và localStorage
        try {
          if ('caches' in window) {
            await caches.delete('diagnosis-images');
          }
          localStorage.removeItem('diagnosis-image-preview');
        } catch (error) {
          console.error('Lỗi khi xóa cache:', error);
        }
      }
      
      if (symptoms) {
        payload.text = symptoms;
      }
      
      // Gọi API
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DIAGNOSIS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '1'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Không thể đọc thông báo lỗi');
        throw new Error(`Lỗi API: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      
      // Kiểm tra cấu trúc kết quả
      if (!result.labels || !Array.isArray(result.labels)) {
        throw new Error('Dữ liệu phản hồi không hợp lệ');
      }
      
      // Chuyển đổi cấu trúc labels từ mảng 2D sang mảng đối tượng và sắp xếp
      // Format từ API: [["BỆNH_A", 0.75], ["BỆNH_B", 0.25]]
      // Format cần chuyển đổi: [{name: "BỆNH_A", score: 0.75}, {name: "BỆNH_B", score: 0.25}]
      if (Array.isArray(result.labels[0])) {
        const formattedLabels = result.labels.map((label: [string, number]) => ({
          name: label[0],
          score: label[1]
        }));
        
        // Sắp xếp theo điểm số giảm dần
        formattedLabels.sort((a: {score: number}, b: {score: number}) => b.score - a.score);
        
        // Cập nhật kết quả với labels đã định dạng
        result.labels = formattedLabels;
      }
      
      // Lưu kết quả vào localStorage để trang kết quả có thể truy cập
      localStorage.setItem('diagnosis-result', JSON.stringify(result));
      
      // Chuyển hướng đến trang kết quả
      router.push('/diagnosis/result');
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu chẩn đoán:', error);
      setErrorMessage(`Có lỗi xảy ra: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white-900 mb-4">Chẩn đoán bệnh da liễu</h1>
          <p className="text-gray-600">Tải lên hình ảnh và mô tả triệu chứng của bạn để nhận chẩn đoán</p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p>{errorMessage}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Tải lên hình ảnh
                </label>
                <div className="mt-2 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer w-full h-full flex flex-col items-center">
                    {imagePreview ? (
                      <div className="relative w-full max-w-xs h-64 mb-4">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                    ) : (
                      <>
                        <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-gray-500">Nhấp vào đây để tải lên hình ảnh</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG (tối đa 10MB)</p>
                      </>
                    )}
                  </label>
                </div>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Xóa hình ảnh
                  </button>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="symptoms">
                  Mô tả triệu chứng {!image && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  id="symptoms"
                  rows={5}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Mô tả chi tiết các triệu chứng, thời gian xuất hiện, các thay đổi trên da, vị trí, cảm giác (đau, ngứa, v.v.)..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-800 placeholder-gray-600"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {!image ? "Vui lòng mô tả triệu chứng hoặc tải lên hình ảnh" : "Mô tả thêm triệu chứng sẽ giúp chẩn đoán chính xác hơn"}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Link
                  href="/"
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 text-center"
                >
                  Hủy
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || (!image && !symptoms)}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                    (isSubmitting || (!image && !symptoms)) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Chẩn đoán'}
                </button>
              </div>
            </form>
          </div>
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