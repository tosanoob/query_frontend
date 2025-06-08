'use client';

import React, { useEffect, useState } from 'react';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<{
    apiBaseUrl: string;
    hostname: string | null;
  }>({
    apiBaseUrl: '',
    hostname: null
  });

  useEffect(() => {
    // Lấy giá trị từ process.env
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    let hostname = null;
    
    // Thử trích xuất hostname
    try {
      if (apiBaseUrl) {
        hostname = new URL(apiBaseUrl).hostname;
      }
    } catch (error) {
      console.error('Lỗi khi trích xuất hostname:', error);
    }
    
    setDebugInfo({
      apiBaseUrl,
      hostname
    });
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Thông tin Debug</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Biến môi trường:</h2>
        <p>
          <strong>NEXT_PUBLIC_API_BASE_URL:</strong>{' '}
          {debugInfo.apiBaseUrl || '(không có giá trị)'}
        </p>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Thông tin đã xử lý:</h2>
        <p>
          <strong>Hostname (từ URL):</strong>{' '}
          {debugInfo.hostname || '(không thể trích xuất)'}
        </p>
      </div>
      
      <p className="mt-4 text-sm text-gray-600">
        Thông tin này sẽ giúp kiểm tra xem biến môi trường có được đọc đúng không và việc trích xuất hostname có thành công không.
      </p>
    </div>
  );
} 