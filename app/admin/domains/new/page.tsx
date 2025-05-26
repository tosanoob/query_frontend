'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/context/AuthContext';
import { uploadDataset } from '@/app/lib/api/dataset';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function NewDomain() {
  const router = useRouter();
  const { token, user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [datasetData, setDatasetData] = useState({
    dataset_name: '',
    custom_domain_name: '',
  });
  
  const [metadataFile, setMetadataFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [uploadStartTime, setUploadStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer for tracking elapsed time during long operations
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isLoading && uploadStartTime) {
      timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - uploadStartTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoading, uploadStartTime]);
  
  const handleDatasetChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setDatasetData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate that it's a JSON file
      if (file.type !== 'application/json') {
        setError('Metadata file must be a JSON file');
        e.target.value = ''; // Reset the input
        return;
      }
      
      setMetadataFile(file);
      setError(null);
    }
  };
  
  const validateMetadataFile = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const metadata = JSON.parse(content);
          
          // Check if metadata is an array
          if (!Array.isArray(metadata)) {
            setError('Metadata must be an array of objects');
            resolve(false);
            return;
          }
          
          // Check if each item has 'name' and 'label' fields
          for (const item of metadata) {
            if (!item.name || !item.label) {
              setError('Each metadata item must have "name" and "label" fields');
              resolve(false);
              return;
            }
          }
          
          // Warn if the dataset is large
          if (metadata.length > 100) {
            toast.success(`Metadata contains ${metadata.length} items. This may take a while to process.`);
          }
          
          resolve(true);
        } catch (error) {
          setError('Invalid JSON format');
          resolve(false);
        }
      };
      
      reader.onerror = () => {
        setError('Error reading the file');
        resolve(false);
      };
      
      reader.readAsText(file);
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Bạn cần đăng nhập để thực hiện thao tác này');
      return;
    }
    
    if (!datasetData.dataset_name || !metadataFile) {
      setError('Vui lòng điền đầy đủ thông tin dataset và tải lên file metadata');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setProcessingStatus('Đang xác thực metadata...');
    setUploadStartTime(Date.now());
    
    try {
      // Validate metadata file format
      const isValid = await validateMetadataFile(metadataFile);
      if (!isValid) {
        setIsLoading(false);
        setProcessingStatus(null);
        setUploadStartTime(null);
        return;
      }
      
      // Show processing status
      setProcessingStatus('Đang tải dataset từ Huggingface và xử lý dữ liệu...');
      
      // Display persistent toast
      const loadingToast = toast.loading('Đang xử lý dataset. Quá trình này có thể mất vài phút, vui lòng không đóng trình duyệt...');
      
      // Upload dataset and metadata
      await uploadDataset(token, {
        dataset_name: datasetData.dataset_name,
        custom_domain_name: datasetData.custom_domain_name || undefined,
        metadata_file: metadataFile
      });
      
      // Dismiss the loading toast
      toast.dismiss(loadingToast);
      
      toast.success('Domain created successfully with dataset');
      router.push('/admin/domains');
    } catch (err) {
      setError((err as Error).message || 'Có lỗi xảy ra khi tạo domain');
      toast.error((err as Error).message || 'Có lỗi xảy ra khi tạo domain');
      console.error('Error creating domain with dataset:', err);
    } finally {
      setIsLoading(false);
      setProcessingStatus(null);
      setUploadStartTime(null);
    }
  };
  
  // Format elapsed time as minutes:seconds
  const formatElapsedTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl text-gray-900 font-bold">Thêm domain mới từ Dataset</h1>
        <Link
          href="/admin/domains"
          className="text-gray-600 hover:text-gray-900"
        >
          &larr; Quay lại danh sách
        </Link>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {isLoading ? (
          <div className="py-10 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">{processingStatus}</h3>
              
              {uploadStartTime && (
                <div className="text-sm text-gray-600">
                  Thời gian xử lý: {formatElapsedTime(elapsedTime)}
                </div>
              )}
              
              <p className="mt-4 text-sm text-gray-600 max-w-md">
                Quá trình này có thể mất vài phút tùy thuộc vào kích thước dataset. 
                Vui lòng không đóng trang này.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="dataset_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Huggingface Dataset <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="dataset_name"
                  name="dataset_name"
                  placeholder="username/dataset_name"
                  value={datasetData.dataset_name}
                  onChange={handleDatasetChange}
                  className="w-full px-4 text-gray-900 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: username/dataset_name như khi import bằng load_dataset
                </p>
              </div>
              
              <div>
                <label htmlFor="custom_domain_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Tên domain tùy chỉnh <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="custom_domain_name"
                  name="custom_domain_name"
                  value={datasetData.custom_domain_name}
                  onChange={handleDatasetChange}
                  className="w-full px-4 text-gray-900 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="metadata_file" className="block text-sm font-medium text-gray-700 mb-1">
                  File Metadata JSON <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  id="metadata_file"
                  name="metadata_file"
                  accept="application/json"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="w-full px-4 text-gray-900 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  File JSON chứa metadata cho dataset. Mỗi phần tử phải có trường 'name' và 'label'.
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Lưu ý: Độ dài của metadata phải khớp với độ dài của train split trong dataset.
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Đối với dataset lớn, quá trình xử lý có thể mất nhiều phút. Vui lòng kiên nhẫn chờ đợi.
                </p>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end space-x-3">
              <Link
                href="/admin/domains"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-gray-900 rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading ? 'Đang xử lý...' : 'Tạo Domain từ Dataset'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 