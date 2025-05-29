# Hướng dẫn cấu hình Google Maps

## Bước 1: Lấy Google Maps API Key

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo hoặc chọn một project
3. Bật Google Maps Embed API:
   - Vào "APIs & Services" > "Library"
   - Tìm "Maps Embed API" và bật nó
4. Tạo API Key:
   - Vào "APIs & Services" > "Credentials"
   - Nhấp "Create Credentials" > "API Key"
   - Sao chép API key

## Bước 2: Cấu hình trong ứng dụng

Tạo file `.env.local` trong thư mục `query_frontend` với nội dung:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Bước 3: Bảo mật API Key

Để bảo mật API key, hãy hạn chế nó:

1. Trong Google Cloud Console, vào "APIs & Services" > "Credentials"
2. Nhấp vào API key vừa tạo
3. Trong "Application restrictions", chọn "HTTP referrers"
4. Thêm domain của bạn (ví dụ: `yourdomain.com/*`)
5. Trong "API restrictions", chọn "Restrict key" và chỉ chọn "Maps Embed API"

## Fallback Map

Nếu không có API key, ứng dụng sẽ tự động sử dụng Google Maps embed fallback mà không cần API key, nhưng có thể có giới hạn về tính năng.

## Lưu ý

- API key cần được đặt trong file `.env.local` (không commit vào git)
- Đảm bảo restart development server sau khi thêm environment variable
- Google Maps Embed API có quota miễn phí, sau đó sẽ tính phí 