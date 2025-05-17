import { API_BASE_URL } from '@/app/lib/utils/constants';
import { PaginatedResponse } from './types';
import { apiClient } from './apiClient';

interface ClinicImage {
  id: string;
  image_id: string;
  object_type: string;
  object_id: string;
  usage: string;
  image: {
    rel_path: string;
    mime_type: string;
    id: string;
    base_url: string;
    uploaded_at: string;
    uploaded_by: string;
  };
}

export interface Clinic {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  phone_number: string | null;
  website: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
  images?: ClinicImage[];
}

export interface ClinicCreate {
  name: string;
  description?: string | null;
  location?: string | null;
  phone_number?: string | null;
  website?: string | null;
}

export interface ClinicUpdate {
  name?: string | null;
  description?: string | null;
  location?: string | null;
  phone_number?: string | null;
  website?: string | null;
}

export async function getClinics(
  skip = 0, 
  limit = 10, 
  search?: string | null
): Promise<PaginatedResponse<Clinic>> {
  let url = `/api/clinic/?skip=${skip}&limit=${limit}`;
  
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  
  return apiClient.get<PaginatedResponse<Clinic>>(url);
}

export async function getClinic(clinicId: string): Promise<Clinic> {
  return apiClient.get<Clinic>(`/api/clinic/${clinicId}`);
}

export async function createClinic(
  token: string, 
  clinicData: ClinicCreate
): Promise<Clinic> {
  return apiClient.post<Clinic>('/api/clinic/', clinicData, { token });
}

export async function updateClinic(
  token: string, 
  clinicId: string, 
  clinicData: ClinicUpdate
): Promise<Clinic> {
  return apiClient.put<Clinic>(`/api/clinic/${clinicId}`, clinicData, { token });
}

export async function deleteClinic(
  token: string, 
  clinicId: string, 
  softDelete = true
): Promise<any> {
  return apiClient.delete<any>(
    `/api/clinic/${clinicId}?soft_delete=${softDelete}`,
    { token }
  );
}

export async function searchClinics(searchTerm: string): Promise<Clinic[]> {
  return apiClient.get<Clinic[]>(`/api/clinic/search/${encodeURIComponent(searchTerm)}`);
} 