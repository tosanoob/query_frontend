import { API_BASE_URL } from '@/app/lib/utils/constants';
import { PaginatedResponse } from './types';
import { apiClient } from './apiClient';

interface DiseaseImage {
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

interface DomainInfo {
  id: string;
  domain: string;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
}

export interface Disease {
  id: string;
  label: string;
  domain_id: string | null;
  description: string | null;
  included_in_diagnosis: boolean;
  article_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
  images?: DiseaseImage[];
  domain?: DomainInfo;
}

export interface DiseaseCreate {
  label: string;
  domain_id?: string | null;
  description?: string | null;
  included_in_diagnosis?: boolean;
  article_id?: string | null;
}

export interface DiseaseUpdate {
  label?: string | null;
  domain_id?: string | null;
  description?: string | null;
  included_in_diagnosis?: boolean | null;
  article_id?: string | null;
}

export async function getDiseases(
  skip = 0, 
  limit = 10,
  token?: string,
  active_only: boolean = true
): Promise<PaginatedResponse<Disease>> {
  return apiClient.get<PaginatedResponse<Disease>>(
    `/api/diseases/?skip=${skip}&limit=${limit}&active_only=${active_only}`,
    { token }
  );
}

export async function getDisease(
  diseaseId: string,
  token?: string
): Promise<Disease> {
  return apiClient.get<Disease>(`/api/diseases/${diseaseId}`, { token });
}

export async function createDisease(
  token: string, 
  diseaseData: DiseaseCreate
): Promise<Disease> {
  return apiClient.post<Disease>('/api/diseases/', diseaseData, { token });
}

export async function updateDisease(
  token: string, 
  diseaseId: string, 
  diseaseData: DiseaseUpdate
): Promise<Disease> {
  return apiClient.put<Disease>(`/api/diseases/${diseaseId}`, diseaseData, { token });
}

export async function deleteDisease(
  token: string, 
  diseaseId: string, 
  softDelete = true
): Promise<any> {
  return apiClient.delete<any>(
    `/api/diseases/${diseaseId}?soft_delete=${softDelete}`,
    { token }
  );
}

export async function searchDiseases(
  searchTerm: string,
  token?: string
): Promise<Disease[]> {
  return apiClient.get<Disease[]>(
    `/api/diseases/search/${encodeURIComponent(searchTerm)}`,
    { token }
  );
}

export async function getDiseasesByDomain(
  domainId: string,
  skip = 0,
  limit = 10,
  token?: string,
  active_only: boolean = true
): Promise<PaginatedResponse<Disease>> {
  return apiClient.get<PaginatedResponse<Disease>>(
    `/api/diseases/domain/${domainId}?skip=${skip}&limit=${limit}&active_only=${active_only}`,
    { token }
  );
} 