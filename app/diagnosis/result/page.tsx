'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { API_BASE_URL, API_ENDPOINTS, ROUTES } from '../../lib/utils/constants';
import { Disease as DiseaseInfo } from '../../lib/api/disease';
import { Domain } from '../../lib/api/domain';
import { DiseaseCacheManager } from '../../lib/utils/diseaseCache';

// Define types for the API response
interface Disease {
  name: string;
  score: number;
  description?: string;
}

interface LabelPrediction {
  id: string;
  label: string;
  score: number;
}

type LabelArray = [string, number][];

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface DiagnosisResult {
  labels?: Disease[] | LabelArray;
  response?: string;
  answer?: string;
  chat_history?: Array<any>;
  question?: string;
  recommendations?: string[];
  label_prediction?: LabelPrediction[];
  hasInitialUserText?: boolean;
  initialUserText?: string;
}

export default function DiagnosisResultPage() {
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [processedLabels, setProcessedLabels] = useState<Disease[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Get cache instance
  const diseaseCache = DiseaseCacheManager.getInstance();

  // Fetch diseases from STANDARD domain and update cache
  useEffect(() => {
    const fetchStandardDiseases = async () => {
      try {
        // Check if cache has valid data first
        if (diseaseCache.hasData()) {
          console.log('Using cached disease data');
          setCacheLoaded(true);
          return;
        }

        console.log('Fetching fresh disease data from API');

        // First get domains to find STANDARD domain - using direct API call without token
        const domainsResponse = await fetch(`${API_BASE_URL}/api/domains/?skip=0&limit=100`, {
          headers: {
            'ngrok-skip-browser-warning': '1'
          }
        });
        
        if (!domainsResponse.ok) {
          throw new Error('Failed to fetch domains');
        }
        
        const domainsData = await domainsResponse.json();
        const standardDomain = domainsData.items.find((domain: Domain) => domain.domain === 'STANDARD');
        
        if (standardDomain) {
          // Fetch diseases from STANDARD domain - also without token for public access
          const diseasesResponse = await fetch(`${API_BASE_URL}/api/diseases/domain/${standardDomain.id}?skip=0&limit=1000&active_only=true`, {
            headers: {
              'ngrok-skip-browser-warning': '1'
            }
          });
          
          if (!diseasesResponse.ok) {
            throw new Error('Failed to fetch diseases');
          }
          
          const diseasesData = await diseasesResponse.json();
          
          // Extract only id and label for caching
          const minimalDiseases = diseasesData.items.map((disease: DiseaseInfo) => ({
            id: disease.id,
            label: disease.label
          }));
          
          // Update cache with minimal data
          diseaseCache.updateCache(minimalDiseases);
          setCacheLoaded(true);
          
          console.log(`Cached ${minimalDiseases.length} diseases from STANDARD domain`);
        }
      } catch (error) {
        console.error('Error fetching standard diseases:', error);
        setCacheLoaded(true); // Set to true even on error to prevent infinite loading
      }
    };

    fetchStandardDiseases();
  }, [diseaseCache]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50; // 50px threshold
      setShowScrollButton(!isAtBottom && chatMessages.length > 3);
    }
  };

  // Helper function to safely extract string content from any data type
  const safeExtractContent = (data: any): string => {
    if (typeof data === 'string') {
      return data;
    }
    if (typeof data === 'number') {
      return data.toString();
    }
    if (data === null || data === undefined) {
      return '';
    }
    if (typeof data === 'object') {
      // If it's an array, don't render it as JSON - likely chat_history
      if (Array.isArray(data)) {
        return '[Dữ liệu hệ thống]';
      }
      
      // Check for common content fields first
      if (data.content && typeof data.content === 'string') {
        return data.content;
      }
      if (data.text && typeof data.text === 'string') {
        return data.text;
      }
      if (data.message && typeof data.message === 'string') {
        return data.message;
      }
      
      // If it's an object with type/image/mime_type, it's likely file data
      if (data.type || data.mime_type || data.image) {
        return '[File được đính kèm]';
      }
      
      // For other objects, don't render as JSON to avoid cluttering chat
      return '[Dữ liệu hệ thống]';
    }
    return String(data);
  };

  // Helper function to get disease info from cache
  const getDiseaseInfo = (diseaseIdentifier: string): { disease: { id: string; label: string } | null; displayName: string } => {
    const disease = diseaseCache.getDiseaseInfo(diseaseIdentifier);
    if (disease) {
      return { disease, displayName: disease.label };
    }
    
    // If no mapping found, return the original identifier as display name
    return { disease: null, displayName: diseaseIdentifier };
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    // Retrieve diagnosis result from localStorage
    const storedResult = localStorage.getItem('diagnosis-result');
    const storedImagePreview = localStorage.getItem('diagnosis-image-preview');
    
    if (storedResult) {
      try {
        const parsedResult = JSON.parse(storedResult) as DiagnosisResult;
        setDiagnosisResult(parsedResult);
        
        // Process labels for display
        if (parsedResult.labels && parsedResult.labels.length > 0) {
          let formattedLabels: Disease[] = [];
          
          if (Array.isArray(parsedResult.labels[0])) {
            const labelArray = parsedResult.labels as LabelArray;
            formattedLabels = labelArray.map((label) => ({
              name: label[0],
              score: label[1]
            }));
          } else {
            formattedLabels = parsedResult.labels as Disease[];
          }
          
          formattedLabels.sort((a, b) => b.score - a.score);
          setProcessedLabels(formattedLabels);
        }
        
        // Initialize chat messages from response only, not chat_history
        const initialMessages: ChatMessage[] = [];
        
        // If user provided text in initial request, show their message first
        if (parsedResult.hasInitialUserText && parsedResult.initialUserText) {
          initialMessages.push({
            role: 'user',
            content: parsedResult.initialUserText,
            timestamp: new Date()
          });
        }
        
        // Then show the assistant's response
        const mainResponse = safeExtractContent(parsedResult.response || parsedResult.answer || '');
        if (mainResponse.trim()) {
          initialMessages.push({
            role: 'assistant',
            content: mainResponse,
            timestamp: new Date()
          });
        }
        
        // If no messages were created, add a default assistant message
        if (initialMessages.length === 0) {
          initialMessages.push({
            role: 'assistant',
            content: 'Đã nhận được yêu cầu chẩn đoán của bạn. Hãy đặt câu hỏi nếu bạn cần thêm thông tin.',
            timestamp: new Date()
          });
        }
        
        setChatMessages(initialMessages);
      } catch (error) {
        console.error('Error parsing diagnosis result:', error);
        // If parsing fails, set a default message
        setChatMessages([{
          role: 'assistant',
          content: 'Xin lỗi, có lỗi khi tải dữ liệu chẩn đoán. Vui lòng thử chẩn đoán lại.',
          timestamp: new Date()
        }]);
      }
    } else {
      // If no stored result, show a message
      setChatMessages([{
        role: 'assistant',
        content: 'Không tìm thấy dữ liệu chẩn đoán. Vui lòng thực hiện chẩn đoán mới.',
        timestamp: new Date()
      }]);
    }
    
    if (storedImagePreview) {
      setImagePreview(storedImagePreview);
    }
    
    setLoading(false);
  }, []);

  const renderProbabilityBar = (probability: number) => {
    const percentage = Math.round(probability * 100);
    
    let colorClass;
    if (percentage >= 70) {
      colorClass = 'bg-red-500';
    } else if (percentage >= 40) {
      colorClass = 'bg-yellow-500';
    } else {
      colorClass = 'bg-blue-400';
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isSending) return;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: newMessage.trim(),
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsSending(true);
    
    try {
      // Prepare payload with chat history and original image
      const payload: { text: string; chat_history?: Array<any>; image_base64?: string } = {
        text: userMessage.content
      };
      
      // Add current chat_history from the original diagnosis result
      if (diagnosisResult?.chat_history) {
        payload.chat_history = diagnosisResult.chat_history;
      }

      // Include original image if available for multi-turn conversation
      const storedImagePreview = localStorage.getItem('diagnosis-image-preview');
      if (storedImagePreview) {
        // Get base64 string (remove prefix "data:image/jpeg;base64,")
        const base64Image = storedImagePreview.split(',')[1];
        if (base64Image) {
          payload.image_base64 = base64Image;
        }
      }

      console.log('Sending payload to API:', {
        text: payload.text,
        has_image: !!payload.image_base64,
        chat_history_length: payload.chat_history?.length || 0,
        endpoint: `${API_BASE_URL}${API_ENDPOINTS.DIAGNOSIS}`
      });
      console.log('Chat history content:', payload.chat_history);
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DIAGNOSIS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '1'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        // Get detailed error information
        let errorDetail = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          console.error('API Error Response:', errorData);
          errorDetail = errorData.detail || errorData.message || `HTTP ${response.status}`;
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
          const errorText = await response.text();
          console.error('Raw error response:', errorText);
        }
        
        throw new Error(`API Error: ${response.status} - ${errorDetail}`);
      }
      
      const result = await response.json();
      console.log('API Response received:', {
        has_response: !!result.response,
        has_chat_history: !!result.chat_history,
        chat_history_length: result.chat_history?.length || 0
      });
      
      // Add assistant response with safe content extraction - only use response.response
      const assistantResponse = safeExtractContent(result.response || 'Xin lỗi, tôi không thể phản hồi được.');
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, assistantMessage]);
      
      // Update diagnosis result with new chat_history
      if (result.chat_history) {
        setDiagnosisResult(prev => prev ? {
          ...prev,
          chat_history: result.chat_history,
          question: result.question,
          response: result.response,
          answer: result.answer
        } : null);
        
        // Update localStorage with error handling
        try {
          const updatedResult = {
            ...diagnosisResult,
            ...result,
            // Limit data size to prevent quota issues
            recommendations: result.recommendations?.slice(0, 5)
          };
          localStorage.setItem('diagnosis-result', JSON.stringify(updatedResult));
        } catch (storageError) {
          console.warn('Could not update localStorage:', storageError);
          
          // Try storing minimal data if full update fails
          try {
            const minimalUpdate = {
              answer: result.answer || result.response,
              chat_history: result.chat_history?.slice(-10) || [], // Keep only last 10 messages
              labels: diagnosisResult?.labels?.slice(0, 3) || []
            };
            localStorage.setItem('diagnosis-result', JSON.stringify(minimalUpdate));
          } catch (fallbackError) {
            console.warn('Could not store minimal update:', fallbackError);
            // Continue without localStorage update if it completely fails
          }
        }
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Xin lỗi, có lỗi xảy ra khi xử lý tin nhắn của bạn: ${error instanceof Error ? error.message : 'Lỗi không xác định'}. Vui lòng thử lại.`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  if (loading || !cacheLoaded) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto mb-8"></div>
            <div className="h-64 bg-gray-200 rounded w-full mb-4"></div>
          </div>
          <p>{loading ? 'Đang tải kết quả chẩn đoán...' : 'Đang tải thông tin bệnh từ cache...'}</p>
        </div>
      </div>
    );
  }

  if (!diagnosisResult) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Không tìm thấy kết quả chẩn đoán</h1>
          <p className="text-gray-600 mb-6">Không tìm thấy dữ liệu chẩn đoán hoặc dữ liệu không hợp lệ. Vui lòng thực hiện chẩn đoán mới.</p>
          <Link href="/diagnosis" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Chẩn đoán mới
          </Link>
        </div>
      </div>
    );
  }

  const mostLikelyDisease = processedLabels.length > 0 ? processedLabels[0] : null;
  const mostLikelyDiseaseInfo = mostLikelyDisease ? getDiseaseInfo(mostLikelyDisease.name) : null;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Kết quả chẩn đoán</h1>
          <p className="text-gray-300">Dựa trên hình ảnh và thông tin đã cung cấp</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Left sidebar - Image and Disease probabilities */}
          <div className="lg:col-span-1 space-y-4">
            {/* Patient Image */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Hình ảnh bệnh nhân</h3>
              {imagePreview ? (
                <div className="relative h-48 w-full rounded overflow-hidden border border-gray-200">
                  <Image
                    src={imagePreview}
                    alt="Hình ảnh bệnh"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <div className="h-48 w-full rounded bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">Không có hình ảnh</p>
                </div>
              )}
            </div>

            {/* Disease Probabilities */}
            {processedLabels.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">Khả năng các bệnh</h3>
                {mostLikelyDisease && mostLikelyDiseaseInfo && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4">
                    <p className="text-sm text-blue-700">
                      Chẩn đoán khả năng cao nhất: 
                      {mostLikelyDiseaseInfo.disease ? (
                        <Link 
                          href={ROUTES.DISEASE_DETAIL(mostLikelyDiseaseInfo.disease.id)}
                          className="font-semibold hover:underline ml-1"
                        >
                          {mostLikelyDiseaseInfo.displayName}
                        </Link>
                      ) : (
                        <span className="font-semibold ml-1">{mostLikelyDiseaseInfo.displayName}</span>
                      )}
                    </p>
                  </div>
                )}
                <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                  {processedLabels.slice(0, 5).map((disease, index) => {
                    const diseaseInfo = getDiseaseInfo(disease.name);
                    return (
                      <div key={index} className="p-2 border border-gray-100 rounded">
                        <div className="flex justify-between items-center mb-1">
                          {diseaseInfo.disease ? (
                            <Link 
                              href={ROUTES.DISEASE_DETAIL(diseaseInfo.disease.id)}
                              className="font-medium text-sm text-gray-800 hover:text-blue-600 hover:underline"
                            >
                              {diseaseInfo.displayName}
                            </Link>
                          ) : (
                            <span className="font-medium text-sm text-gray-800">{diseaseInfo.displayName}</span>
                          )}
                        </div>
                        {renderProbabilityBar(disease.score)}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Main chat area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md h-full flex flex-col relative">
              {/* Chat header */}
              <div className="border-b border-gray-200 p-4 flex-shrink-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Bác sĩ AI</h3>
                    <p className="text-sm text-gray-500">Trợ lý chẩn đoán da liễu</p>
                  </div>
                </div>
              </div>

              {/* Chat messages with fixed height and custom scrollbar */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 max-h-[calc(100vh-400px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 smooth-scroll" ref={chatContainerRef} onScroll={handleScroll}>
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="whitespace-pre-line break-words">{safeExtractContent(message.content)}</p>
                      {message.timestamp && (
                        <p className={`text-xs mt-1 ${
                          message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Scroll to bottom button */}
              {showScrollButton && (
                <div className="absolute bottom-20 right-6">
                  <button
                    onClick={scrollToBottom}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center"
                    title="Cuộn xuống dưới"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Chat input */}
              <div className="border-t border-gray-200 p-4 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập câu hỏi hoặc thông tin bổ sung..."
                    className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/diagnosis" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center">
            Chẩn đoán mới
          </Link>
          <Link href="/" className="px-6 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-center">
            Trang chủ
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