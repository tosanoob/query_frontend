import { API_BASE_URL } from '@/app/lib/utils/constants';
import { apiClient } from './apiClient';
import { handleAuthError } from '../utils/auth';

interface DiagnosisRequest {
  image?: File;
  symptoms?: string;
}

export interface Disease {
  name: string;
  probability: number;
  description: string;
}

export interface Clinic {
  id: number;
  name: string;
  address: string;
  phone: string;
}

export interface DiagnosisResult {
  imageUrl: string;
  diseases: Disease[];
  analysis: string;
  recommendations: string[];
  clinics: Clinic[];
}

/**
 * Gửi yêu cầu chẩn đoán bệnh da liễu
 * @param data Dữ liệu chẩn đoán (hình ảnh, triệu chứng)
 * @returns Kết quả chẩn đoán
 */
export const submitDiagnosis = async (data: DiagnosisRequest): Promise<DiagnosisResult> => {
  try {
    const formData = new FormData();
    
    if (data.image) {
      formData.append('image', data.image);
    }
    
    if (data.symptoms) {
      formData.append('symptoms', data.symptoms);
    }
    
    return await apiClient.postFormData<DiagnosisResult>('/api/diagnosis', formData);
  } catch (error) {
    console.error('Lỗi khi gửi yêu cầu chẩn đoán:', error);
    throw error;
  }
};

/**
 * Lấy kết quả chẩn đoán theo ID
 * @param id ID của kết quả chẩn đoán
 * @returns Kết quả chẩn đoán
 */
export const getDiagnosisResult = async (id: string): Promise<DiagnosisResult> => {
  try {
    return await apiClient.get<DiagnosisResult>(`/api/diagnosis/${id}`);
  } catch (error) {
    console.error('Lỗi khi lấy kết quả chẩn đoán:', error);
    throw error;
  }
};