import { API_BASE_URL } from '@/app/lib/utils/constants';
import { PaginatedResponse } from './types';
import { apiClient } from './apiClient';

export interface Domain {
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

export interface DomainCreate {
  domain: string;
  description?: string | null;
  created_by?: string | null;
}

export interface DomainUpdate {
  domain?: string | null;
  description?: string | null;
  updated_by?: string | null;
}

export async function getDomains(
  token: string, 
  skip = 0, 
  limit = 10
): Promise<PaginatedResponse<Domain>> {
  return apiClient.get<PaginatedResponse<Domain>>(
    `/api/domains/?skip=${skip}&limit=${limit}`,
    { token }
  );
}

export async function getDomain(token: string, domainId: string): Promise<Domain> {
  return apiClient.get<Domain>(`/api/domains/${domainId}`, { token });
}

export async function createDomain(
  token: string, 
  domainData: DomainCreate
): Promise<Domain> {
  return apiClient.post<Domain>('/api/domains/', domainData, { token });
}

export async function updateDomain(
  token: string, 
  domainId: string, 
  domainData: DomainUpdate
): Promise<Domain> {
  return apiClient.put<Domain>(`/api/domains/${domainId}`, domainData, { token });
}

export async function deleteDomain(
  token: string, 
  domainId: string, 
  softDelete = true
): Promise<any> {
  return apiClient.delete<any>(
    `/api/domains/${domainId}?soft_delete=${softDelete}`,
    { token }
  );
} 