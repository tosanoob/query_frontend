import { API_URL } from '@/app/lib/utils/constants';

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
    
    const response = await fetch(`${API_URL}/api/diagnosis`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
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
    const response = await fetch(`${API_URL}/api/diagnosis/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Lỗi khi lấy kết quả chẩn đoán:', error);
    throw error;
  }
};