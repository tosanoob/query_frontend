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

export const API_BASE_URL = 'https://bird-faithful-hagfish.ngrok-free.app'; 