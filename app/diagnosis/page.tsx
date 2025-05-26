'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, API_ENDPOINTS } from '../lib/utils/constants';

export default function DiagnosisPage() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);
  const router = useRouter();

  // 7 câu hỏi riêng biệt
  const [symptomsQuestions, setSymptomsQuestions] = useState({
    q1: '', // Bạn gặp tình trạng này từ khi nào?
    q2: '', // Tổn thương này có phát triển thêm hay thay đổi hình dạng gần đây không?
    q3: '', // Bạn có thể cho biết tổn thương xuất hiện ở vùng nào trên cơ thể không?
    q4: '', // Bạn cảm thấy đau hay ngứa như thế nào?
    q5: '', // Kích thước của tổn thương vào khoảng bao nhiêu cm đường kính?
    q6: '', // Gia đình bạn có tiền sử dị ứng hay tiền sử bệnh da liễu không?
    q7: '', // Gần đây bạn có sử dụng thuốc hay sản phẩm bôi da nào không?
  });

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
      
      // Convert and resize image to reduce storage size
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
          
          // Calculate optimal dimensions (max 1024x768 for storage efficiency)
          const maxWidth = 1024;
          const maxHeight = 768;
          let { width, height } = img;
          
          // Calculate scale factor to maintain aspect ratio
          const scaleX = maxWidth / width;
          const scaleY = maxHeight / height;
          const scale = Math.min(scaleX, scaleY, 1); // Don't upscale
          
          const newWidth = Math.round(width * scale);
          const newHeight = Math.round(height * scale);
          
          // Set canvas dimensions to the new size
          canvas.width = newWidth;
          canvas.height = newHeight;
          
          // Draw image with white background to ensure RGB format
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, newWidth, newHeight);
          
          // Draw the resized image
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
          
          // Function to compress image with adjustable quality
          const compressImage = (quality: number): string => {
            return canvas.toDataURL('image/jpeg', quality);
          };
          
          try {
            // Start with good quality and reduce if needed
            let dataUrl = compressImage(0.8);
            
            // Check if still too large (aim for < 500KB base64)
            // Base64 is roughly 4/3 of original size, so aim for < 375KB actual
            const maxBase64Size = 500 * 1024; // 500KB
            
            if (dataUrl.length > maxBase64Size) {
              // Try lower quality
              dataUrl = compressImage(0.6);
              
              if (dataUrl.length > maxBase64Size) {
                // Even lower quality if still too large
                dataUrl = compressImage(0.4);
                
                if (dataUrl.length > maxBase64Size) {
                  // Final attempt with very low quality
                  dataUrl = compressImage(0.2);
                }
              }
            }
            
            // Show compression info to user
            const originalSizeKB = Math.round(file.size / 1024);
            const compressedSizeKB = Math.round((dataUrl.length * 3) / 4 / 1024);
            
            if (compressedSizeKB < originalSizeKB) {
              console.log(`Image compressed: ${originalSizeKB}KB → ${compressedSizeKB}KB`);
              setCompressionInfo(`Hình ảnh đã được tối ưu: ${originalSizeKB}KB → ${compressedSizeKB}KB`);
            } else {
              setCompressionInfo(null);
            }
            
            setImagePreview(dataUrl);
          } catch (error) {
            console.error('Lỗi khi nén hình ảnh:', error);
            setErrorMessage('Không thể xử lý hình ảnh. Vui lòng thử lại với hình ảnh khác.');
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

  // Hàm xử lý thay đổi cho các câu hỏi triệu chứng
  const handleSymptomChange = (questionKey: keyof typeof symptomsQuestions, value: string) => {
    setSymptomsQuestions(prev => ({
      ...prev,
      [questionKey]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Require either image or at least one answer for initial diagnosis
    if (!image && !Object.values(symptomsQuestions).some(val => val.trim() !== '')) {
      setErrorMessage('Vui lòng tải lên hình ảnh hoặc trả lời ít nhất một câu hỏi về triệu chứng để tiến hành chẩn đoán');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      // Clear old localStorage data to prevent quota issues
      try {
        localStorage.removeItem('diagnosis-result');
        localStorage.removeItem('diagnosis-image-preview');
      } catch (clearError) {
        console.warn('Could not clear localStorage:', clearError);
      }

      // Create request payload for initial diagnosis
      const payload: { image_base64?: string; text?: string } = {};
      
      // Add image if provided
      if (image && imagePreview) {
        // Get base64 string (remove prefix "data:image/jpeg;base64,")
        const base64Image = imagePreview.split(',')[1];
        payload.image_base64 = base64Image;
        
        // Store image in localStorage for result page with error handling
        try {
          localStorage.setItem('diagnosis-image-preview', imagePreview);
        } catch (storageError) {
          console.warn('Could not store image preview:', storageError);
          // Continue without storing image preview if localStorage fails
        }
      }
      
      // Format text from questions and answers
      const questions = [
        'Bạn gặp tình trạng này từ khi nào? (vài ngày trước, vài tháng trước hay lâu hơn?)',
        'Tổn thương này có phát triển thêm hay thay đổi hình dạng gần đây không?',
        'Bạn có thể cho biết tổn thương xuất hiện ở vùng nào trên cơ thể không? (bàn tay, cánh tay, cổ,...)',
        'Bạn cảm thấy đau hay ngứa như thế nào? (đau khi nhấn, luôn đau, ngứa nhiều?)',
        'Kích thước của tổn thương vào khoảng bao nhiêu cm đường kính?',
        'Gia đình bạn có tiền sử dị ứng hay tiền sử bệnh da liễu không? Yếu tố di truyền cũng sẽ ảnh hưởng đến tình trạng của bạn',
        'Gần đây bạn có sử dụng thuốc hay sản phẩm bôi da nào không? Vui lòng nêu rõ nếu bạn có sử dụng'
      ];
      
      const answers = Object.values(symptomsQuestions);
      let formattedText = '';
      
      // Format according to question-answer structure
      for (let i = 0; i < questions.length; i++) {
        if (answers[i].trim() !== '') {
          formattedText += `${questions[i]}: ${answers[i]}\n`;
        }
      }
      
      if (formattedText.trim() !== '') {
        payload.text = formattedText.trim();
      }
      
      // Call API for initial diagnosis
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
      
      // Store only essential result data in localStorage with error handling
      try {
        // Create a smaller version of the result for localStorage
        const essentialResult = {
          labels: result.labels,
          response: result.response,
          answer: result.answer,
          chat_history: result.chat_history,
          question: result.question,
          recommendations: result.recommendations?.slice(0, 5), // Limit recommendations to prevent large data
          // Add info about whether user provided text in initial request
          hasInitialUserText: formattedText.trim() !== '',
          initialUserText: formattedText.trim() || null,
          // Don't store large unnecessary data
        };
        
        localStorage.setItem('diagnosis-result', JSON.stringify(essentialResult));
      } catch (storageError) {
        console.error('Could not store diagnosis result in localStorage:', storageError);
        
        // Try storing minimal data if full storage fails
        try {
          const minimalResult = {
            answer: result.answer || result.response || 'Đã nhận được kết quả chẩn đoán',
            chat_history: result.chat_history || [],
            labels: result.labels?.slice(0, 3) || [], // Only store top 3 labels
            hasInitialUserText: formattedText.trim() !== '',
            initialUserText: formattedText.trim() || null,
          };
          localStorage.setItem('diagnosis-result', JSON.stringify(minimalResult));
        } catch (fallbackError) {
          console.error('Could not store even minimal result:', fallbackError);
          // If localStorage completely fails, continue to result page anyway
          // The result page will show an error message about missing data
        }
      }
      
      // Redirect to result page
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
          <h1 className="text-3xl font-bold text-white-900 mb-4">
            Chẩn đoán bệnh da liễu
          </h1>
          <p className="text-gray-600">
            Tải lên hình ảnh và mô tả triệu chứng của bạn để nhận chẩn đoán
          </p>
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
                      setCompressionInfo(null);
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Xóa hình ảnh
                  </button>
                )}
                {compressionInfo && (
                  <p className="mt-2 text-sm text-green-600">
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {compressionInfo}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-4">
                  Vui lòng cung cấp thêm thông tin để chẩn đoán chính xác hơn
                  {!image && <span className="text-red-500">*</span>}
                </label>
                
                <div className="space-y-4">
                  {/* Câu hỏi 1 */}
                  <div>
                    <label className="block text-gray-700 text-sm mb-1" htmlFor="q1">
                      Bạn gặp tình trạng này từ khi nào? (vài ngày trước, vài tháng trước hay lâu hơn?)
                    </label>
                    <input
                      id="q1"
                      type="text"
                      value={symptomsQuestions.q1}
                      onChange={(e) => handleSymptomChange('q1', e.target.value)}
                      placeholder="Vui lòng nhập câu trả lời của bạn..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
                    />
                  </div>
                  
                  {/* Câu hỏi 2 */}
                  <div>
                    <label className="block text-gray-700 text-sm mb-1" htmlFor="q2">
                      Tổn thương này có phát triển thêm hay thay đổi hình dạng gần đây không?
                    </label>
                    <input
                      id="q2"
                      type="text"
                      value={symptomsQuestions.q2}
                      onChange={(e) => handleSymptomChange('q2', e.target.value)}
                      placeholder="Vui lòng nhập câu trả lời của bạn..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
                    />
                  </div>
                  
                  {/* Câu hỏi 3 */}
                  <div>
                    <label className="block text-gray-700 text-sm mb-1" htmlFor="q3">
                      Bạn có thể cho biết tổn thương xuất hiện ở vùng nào trên cơ thể không? (bàn tay, cánh tay, cổ,...)
                    </label>
                    <input
                      id="q3"
                      type="text"
                      value={symptomsQuestions.q3}
                      onChange={(e) => handleSymptomChange('q3', e.target.value)}
                      placeholder="Vui lòng nhập câu trả lời của bạn..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
                    />
                  </div>
                  
                  {/* Câu hỏi 4 */}
                  <div>
                    <label className="block text-gray-700 text-sm mb-1" htmlFor="q4">
                      Bạn cảm thấy đau hay ngứa như thế nào? (đau khi nhấn, luôn đau, ngứa nhiều?)
                    </label>
                    <input
                      id="q4"
                      type="text"
                      value={symptomsQuestions.q4}
                      onChange={(e) => handleSymptomChange('q4', e.target.value)}
                      placeholder="Vui lòng nhập câu trả lời của bạn..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
                    />
                  </div>
                  
                  {/* Câu hỏi 5 */}
                  <div>
                    <label className="block text-gray-700 text-sm mb-1" htmlFor="q5">
                      Kích thước của tổn thương vào khoảng bao nhiêu cm đường kính?
                    </label>
                    <input
                      id="q5"
                      type="text"
                      value={symptomsQuestions.q5}
                      onChange={(e) => handleSymptomChange('q5', e.target.value)}
                      placeholder="Vui lòng nhập câu trả lời của bạn..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
                    />
                  </div>
                  
                  {/* Câu hỏi 6 */}
                  <div>
                    <label className="block text-gray-700 text-sm mb-1" htmlFor="q6">
                      Gia đình bạn có tiền sử dị ứng hay tiền sử bệnh da liễu không? Yếu tố di truyền cũng sẽ ảnh hưởng đến tình trạng của bạn
                    </label>
                    <input
                      id="q6"
                      type="text"
                      value={symptomsQuestions.q6}
                      onChange={(e) => handleSymptomChange('q6', e.target.value)}
                      placeholder="Vui lòng nhập câu trả lời của bạn..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
                    />
                  </div>
                  
                  {/* Câu hỏi 7 */}
                  <div>
                    <label className="block text-gray-700 text-sm mb-1" htmlFor="q7">
                      Gần đây bạn có sử dụng thuốc hay sản phẩm bôi da nào không? Vui lòng nêu rõ nếu bạn có sử dụng
                    </label>
                    <input
                      id="q7"
                      type="text"
                      value={symptomsQuestions.q7}
                      onChange={(e) => handleSymptomChange('q7', e.target.value)}
                      placeholder="Vui lòng nhập câu trả lời của bạn..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
                    />
                  </div>
                </div>
                
                <p className="mt-3 text-sm text-gray-500">
                  {!image ? "Vui lòng cung cấp thông tin hoặc tải lên hình ảnh" : "Cung cấp thêm thông tin sẽ giúp chẩn đoán chính xác hơn"}
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
                  disabled={isSubmitting || (!image && !Object.values(symptomsQuestions).some(val => val.trim() !== ''))}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                    (isSubmitting || (!image && !Object.values(symptomsQuestions).some(val => val.trim() !== ''))) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Bắt đầu chẩn đoán'}
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