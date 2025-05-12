/**
 * URL của API backend
 */

/**
 * Các route của ứng dụng
 */
export const ROUTES = {
  HOME: '/',
  DISEASES: '/diseases',
  DISEASE_DETAIL: (id: string) => `/diseases/${id}`,
  DIAGNOSIS: '/diagnosis',
  DIAGNOSIS_RESULT: '/diagnosis/result',
  CLINICS: '/clinics',
  CLINIC_DETAIL: (id: string) => `/clinics/${id}`,
  ADMIN: {
    DISEASES: '/admin/diseases',
    CLINICS: '/admin/clinics',
    ARTICLES: '/admin/articles',
  },
};

/**
 * Thông tin liên hệ
 */
export const CONTACT_INFO = {
  PHONE: '028-1234-5678',
  EMAIL: 'contact@dermaai.vn',
  ADDRESS: '123 Đường Nguyễn Văn A, Quận 1, TP.HCM',
};

/**
 * API configuration
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://bird-faithful-hagfish.ngrok-free.app';

// API Endpoints
export const API_ENDPOINTS = {
  DIAGNOSIS: '/api/diagnosis/analyze',
  DISEASES: '/api/diseases',
  CLINICS: '/api/clinics',
  ARTICLES: '/api/articles',
};

// Function to construct the full image URL from base_url and rel_path
export function getFullImageUrl(baseUrl: string, relPath: string): string {
  return `${API_BASE_URL}${baseUrl}/${relPath}`;
} 