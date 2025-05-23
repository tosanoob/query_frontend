# API 422 Error Fix - Multi-turn Conversation

## Vấn đề gặp phải

Khi người dùng tiếp tục gửi tin nhắn trong chatbox ở trang kết quả chẩn đoán, gặp lỗi **API Error 422** khi gọi API `image-only-multi-turn`.

## Nguyên nhân

API `image-only-multi-turn` yêu cầu **hình ảnh gốc** ngay cả trong multi-turn conversation. Trong implementation ban đầu, chúng ta chỉ gửi `text` và `chat_history` mà không include hình ảnh gốc.

## Giải pháp đã triển khai

### 1. **Thêm hình ảnh vào payload multi-turn**
```typescript
// Include original image if available for multi-turn conversation
const storedImagePreview = localStorage.getItem('diagnosis-image-preview');
if (storedImagePreview) {
  // Get base64 string (remove prefix "data:image/jpeg;base64,")
  const base64Image = storedImagePreview.split(',')[1];
  if (base64Image) {
    payload.image_base64 = base64Image;
  }
}
```

### 2. **Cải thiện error logging**
```typescript
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
```

### 3. **Enhanced debugging logs**
```typescript
console.log('Sending payload to API:', {
  text: payload.text,
  has_image: !!payload.image_base64,
  chat_history_length: payload.chat_history?.length || 0,
  endpoint: `${API_BASE_URL}${API_ENDPOINTS.DIAGNOSIS}`
});
```

## Technical Details

### Payload Structure cho Multi-turn
```typescript
interface MultiTurnPayload {
  text: string;                    // User's new message
  chat_history?: Array<any>;       // Previous conversation history
  image_base64?: string;           // Original image from localStorage
}
```

### Flow hoàn chỉnh

1. **Initial Diagnosis**: 
   - User uploads image + provides symptoms
   - Image stored in `localStorage` as `diagnosis-image-preview`
   - API call với `image_base64` + `text`

2. **Multi-turn Conversation**:
   - User sends additional message
   - Retrieve original image from `localStorage`
   - API call với `text` + `chat_history` + `image_base64`

### Error Handling Improvements

- **Detailed error messages**: Show actual API error detail to user
- **Console logging**: Log request/response for debugging
- **Graceful fallback**: Continue even if localStorage access fails

## Files Modified

1. **`app/diagnosis/result/page.tsx`**:
   - Updated `handleSendMessage` function
   - Added image inclusion for multi-turn
   - Enhanced error handling and logging

## Verification

- ✅ Build successful (size increased from 5.46 kB to 5.73 kB)
- ✅ No TypeScript errors
- ✅ Enhanced error messages for better debugging
- ✅ Original image now included in multi-turn requests

## Usage Notes

- Hình ảnh gốc được lưu trong `localStorage` với key `diagnosis-image-preview`
- Multi-turn conversation sẽ tự động include hình ảnh này
- Nếu không có hình ảnh trong localStorage, request vẫn được gửi (fallback)
- Error messages giờ sẽ chi tiết hơn để dễ debug

## Future Improvements

1. **Image optimization**: Compress image before storing in localStorage
2. **Cache management**: Clear old image data when starting new diagnosis
3. **Retry logic**: Implement automatic retry for failed requests
4. **Offline support**: Handle cases when API is unavailable

## Testing

Để test fix này:

1. Thực hiện chẩn đoán ban đầu với hình ảnh
2. Vào trang kết quả
3. Gửi tin nhắn bổ sung trong chatbox
4. Kiểm tra console logs để verify payload structure
5. Confirm không còn 422 error 