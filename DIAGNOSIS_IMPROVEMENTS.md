# Cải tiến trang kết quả chẩn đoán

## Tóm tắt thay đổi

Đã cải tiến trang hiển thị kết quả chẩn đoán (`app/diagnosis/result/page.tsx`) để hiển thị tên bệnh thay vì ID bệnh, thêm link đến trang thông tin chi tiết, và triển khai cache system để tối ưu hóa hiệu suất.

## Những thay đổi chính

### 1. Cache System cho dữ liệu bệnh
- Tạo `DiseaseCacheManager` class để quản lý cache dữ liệu bệnh
- Cache chỉ lưu ID và tên bệnh (không lưu mô tả) để tiết kiệm bộ nhớ
- Cache có thời gian hết hạn 24 giờ
- Sử dụng localStorage để persist cache giữa các session
- Singleton pattern để đảm bảo consistency

### 2. Fetch dữ liệu bệnh từ domain STANDARD
- Kiểm tra cache trước khi gọi API
- Chỉ fetch từ API khi cache không có hoặc đã hết hạn
- Tạo mapping từ disease ID và disease label đến thông tin bệnh đầy đủ

### 3. Hiển thị tên bệnh thay vì ID
- Function `getDiseaseInfo()` để convert disease ID/label thành tên hiển thị từ cache
- Hiển thị tên bệnh có thể đọc được thay vì mã ID

### 4. Thêm link đến trang thông tin bệnh
- Các tên bệnh trong danh sách khả năng cao giờ đây có thể click được
- Link đến trang chi tiết bệnh (`/diseases/[id]`) sử dụng `ROUTES.DISEASE_DETAIL()`
- Hiệu ứng hover để người dùng biết có thể click

### 5. Cải thiện UX và Performance
- Tên bệnh có khả năng cao nhất được highlight đặc biệt
- Hover effects cho links
- Fallback hiển thị tên gốc nếu không tìm thấy mapping
- Loading states cho cache và data fetching
- Giảm đáng kể số lần gọi API

## Technical Implementation

### Cache Manager
```typescript
export class DiseaseCacheManager {
  private static instance: DiseaseCacheManager;
  private cache: Map<string, CachedDisease> = new Map();
  private isLoaded = false;

  // Singleton pattern
  static getInstance(): DiseaseCacheManager;
  
  // Cache operations
  getDiseaseInfo(diseaseIdentifier: string): { id: string; label: string } | null;
  updateCache(diseases: Array<{ id: string; label: string }>): void;
  hasData(): boolean;
  clearCache(): void;
}
```

### Cache Structure
```typescript
interface CachedDisease {
  id: string;
  label: string; // Only essential data, no description
}

interface DiseaseCache {
  diseases: CachedDisease[];
  timestamp: number;
  expiryTime: number; // 24 hours
}
```

### Cache Usage in Component
```typescript
// Check cache first
if (diseaseCache.hasData()) {
  console.log('Using cached disease data');
  setCacheLoaded(true);
  return;
}

// Fetch and update cache only when needed
const minimalDiseases = diseasesData.items.map((disease: DiseaseInfo) => ({
  id: disease.id,
  label: disease.label
}));
diseaseCache.updateCache(minimalDiseases);
```

### API Calls (Only when cache is empty/expired)
```typescript
// Fetch domains without token
const domainsResponse = await fetch(`${API_BASE_URL}/api/domains/?skip=0&limit=100`);

// Fetch diseases from STANDARD domain
const diseasesResponse = await fetch(`${API_BASE_URL}/api/diseases/domain/${standardDomain.id}?skip=0&limit=1000&active_only=true`);
```

### Disease Mapping from Cache
```typescript
const getDiseaseInfo = (diseaseIdentifier: string) => {
  const disease = diseaseCache.getDiseaseInfo(diseaseIdentifier);
  return disease ? { disease, displayName: disease.label } : { disease: null, displayName: diseaseIdentifier };
};
```

### Link Generation
```typescript
{diseaseInfo.disease ? (
  <Link 
    href={ROUTES.DISEASE_DETAIL(diseaseInfo.disease.id)}
    className="font-semibold hover:underline ml-1"
  >
    {diseaseInfo.displayName}
  </Link>
) : (
  <span className="font-semibold ml-1">{diseaseInfo.displayName}</span>
)}
```

## Lợi ích

### Performance
1. **Giảm API calls**: Chỉ fetch data một lần, sau đó sử dụng cache
2. **Faster loading**: Instant access từ cache thay vì chờ API response
3. **Bandwidth saving**: Không cần download lại data đã có
4. **Memory efficient**: Chỉ cache ID và tên, không cache mô tả chi tiết

### User Experience
1. **UX tốt hơn**: Người dùng thấy tên bệnh có thể đọc được thay vì ID khó hiểu
2. **Navigation thuận tiện**: Click trực tiếp để xem thông tin chi tiết bệnh
3. **Consistent performance**: Loading time ổn định nhờ cache
4. **Offline resilience**: Vẫn hiển thị được data từ cache khi mất kết nối tạm thời

### Technical Benefits
1. **Fallback robust**: Vẫn hiển thị được ngay cả khi không có mapping
2. **Error handling**: Graceful degradation khi cache/API fails
3. **Memory management**: Auto expiry và cleanup
4. **Scalability**: Singleton pattern đảm bảo consistency across components

## Cache Management

### Cache Expiry
- Cache tự động hết hạn sau 24 giờ
- Kiểm tra tính hợp lệ mỗi khi load component
- Auto clear cache khi detect corruption

### Storage
- Sử dụng localStorage để persist
- Fallback graceful khi localStorage không available
- Size optimization chỉ lưu essential data

### Debug Support
```typescript
const cacheInfo = diseaseCache.getCacheInfo();
// Returns: { size: number, isValid: boolean, hasData: boolean }
```

## Testing

- Build thành công không có lỗi linter
- Component handle gracefully khi không fetch được dữ liệu
- Cache system hoạt động độc lập, không ảnh hưởng tới core functionality
- Performance testing shows significant improvement in subsequent loads 