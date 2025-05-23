# Disease Cache Usage Example

## Cách sử dụng DiseaseCacheManager trong components khác

### 1. Import và khởi tạo
```typescript
import { DiseaseCacheManager } from '../lib/utils/diseaseCache';

export default function YourComponent() {
  const diseaseCache = DiseaseCacheManager.getInstance();
  
  // Your component logic
}
```

### 2. Kiểm tra và lấy thông tin bệnh
```typescript
const handleDiseaseInfo = (diseaseId: string) => {
  // Lấy thông tin từ cache
  const diseaseInfo = diseaseCache.getDiseaseInfo(diseaseId);
  
  if (diseaseInfo) {
    console.log(`Disease: ${diseaseInfo.label} (ID: ${diseaseInfo.id})`);
    return diseaseInfo;
  } else {
    console.log('Disease not found in cache');
    return null;
  }
};
```

### 3. Kiểm tra trạng thái cache
```typescript
const checkCacheStatus = () => {
  const cacheInfo = diseaseCache.getCacheInfo();
  
  console.log('Cache status:', {
    size: cacheInfo.size,
    isValid: cacheInfo.isValid,
    hasData: cacheInfo.hasData
  });
  
  // Kiểm tra xem có data không
  if (!diseaseCache.hasData()) {
    console.log('Cache is empty, need to fetch data');
  }
};
```

### 4. Sử dụng trong component với hiển thị
```typescript
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DiseaseCacheManager } from '../lib/utils/diseaseCache';
import { ROUTES } from '../lib/utils/constants';

interface DiseaseDisplayProps {
  diseaseId: string;
  className?: string;
}

export const DiseaseDisplay: React.FC<DiseaseDisplayProps> = ({ 
  diseaseId, 
  className = '' 
}) => {
  const [diseaseInfo, setDiseaseInfo] = useState<{id: string, label: string} | null>(null);
  const diseaseCache = DiseaseCacheManager.getInstance();

  useEffect(() => {
    const info = diseaseCache.getDiseaseInfo(diseaseId);
    setDiseaseInfo(info);
  }, [diseaseId, diseaseCache]);

  if (!diseaseInfo) {
    return <span className={className}>{diseaseId}</span>;
  }

  return (
    <Link 
      href={ROUTES.DISEASE_DETAIL(diseaseInfo.id)}
      className={`hover:underline ${className}`}
    >
      {diseaseInfo.label}
    </Link>
  );
};
```

### 5. Sử dụng cho danh sách nhiều bệnh
```typescript
const DiseaseList: React.FC<{ diseaseIds: string[] }> = ({ diseaseIds }) => {
  const diseaseCache = DiseaseCacheManager.getInstance();
  
  const diseases = diseaseIds.map(id => {
    const info = diseaseCache.getDiseaseInfo(id);
    return {
      id,
      info,
      displayName: info ? info.label : id
    };
  });

  return (
    <ul>
      {diseases.map(disease => (
        <li key={disease.id}>
          {disease.info ? (
            <Link href={ROUTES.DISEASE_DETAIL(disease.info.id)}>
              {disease.displayName}
            </Link>
          ) : (
            <span>{disease.displayName}</span>
          )}
        </li>
      ))}
    </ul>
  );
};
```

### 6. Xử lý trường hợp cache trống
```typescript
const useDiseaseWithFallback = (diseaseId: string) => {
  const [loading, setLoading] = useState(true);
  const [diseaseInfo, setDiseaseInfo] = useState<{id: string, label: string} | null>(null);
  const diseaseCache = DiseaseCacheManager.getInstance();

  useEffect(() => {
    const loadDiseaseInfo = async () => {
      setLoading(true);
      
      // Kiểm tra cache trước
      let info = diseaseCache.getDiseaseInfo(diseaseId);
      
      if (!info && !diseaseCache.hasData()) {
        // Cache trống, có thể cần fetch data
        console.log('Cache empty, you may need to fetch disease data first');
        // Hoặc trigger fetch trong component khác
      }
      
      setDiseaseInfo(info);
      setLoading(false);
    };

    loadDiseaseInfo();
  }, [diseaseId, diseaseCache]);

  return { diseaseInfo, loading };
};
```

### 7. Clear cache khi cần thiết
```typescript
const AdminCacheControls = () => {
  const diseaseCache = DiseaseCacheManager.getInstance();
  
  const handleClearCache = () => {
    diseaseCache.clearCache();
    console.log('Disease cache cleared');
    // Có thể cần refresh component hoặc fetch lại data
  };
  
  const handleCheckCache = () => {
    const info = diseaseCache.getCacheInfo();
    alert(`Cache has ${info.size} items, Valid: ${info.isValid}`);
  };

  return (
    <div>
      <button onClick={handleClearCache}>Clear Disease Cache</button>
      <button onClick={handleCheckCache}>Check Cache Status</button>
    </div>
  );
};
```

## Best Practices

### 1. Singleton Usage
- Luôn sử dụng `DiseaseCacheManager.getInstance()` thay vì tạo instance mới
- Đảm bảo consistency across toàn bộ app

### 2. Error Handling
```typescript
const safeGetDiseaseInfo = (diseaseId: string) => {
  try {
    return diseaseCache.getDiseaseInfo(diseaseId);
  } catch (error) {
    console.error('Error accessing disease cache:', error);
    return null;
  }
};
```

### 3. Performance Optimization
```typescript
// Cache disease infos locally trong component nếu cần sử dụng nhiều lần
const [localDiseaseCache, setLocalDiseaseCache] = useState<Record<string, any>>({});

const getDiseaseInfoMemoized = useCallback((diseaseId: string) => {
  if (localDiseaseCache[diseaseId]) {
    return localDiseaseCache[diseaseId];
  }
  
  const info = diseaseCache.getDiseaseInfo(diseaseId);
  if (info) {
    setLocalDiseaseCache(prev => ({ ...prev, [diseaseId]: info }));
  }
  
  return info;
}, [diseaseCache, localDiseaseCache]);
```

### 4. TypeScript Types
```typescript
// Định nghĩa types cho better IntelliSense
type CachedDiseaseInfo = {
  id: string;
  label: string;
} | null;

interface DiseaseDisplayComponentProps {
  diseaseId: string;
  fallbackText?: string;
  showLink?: boolean;
}
```

## Notes

- Cache tự động expire sau 24 giờ
- Sử dụng localStorage để persist data
- Fallback gracefully khi không có thông tin
- Memory efficient (chỉ cache ID và label)
- Thread-safe với singleton pattern 