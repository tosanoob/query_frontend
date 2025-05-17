import { API_BASE_URL } from '@/app/lib/utils/constants';
import { PaginatedResponse } from './types';

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
  const headers: Record<string, string> = {
    'ngrok-skip-browser-warning': '1'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(
    `${API_BASE_URL}/api/diseases/?skip=${skip}&limit=${limit}&active_only=${active_only}`,
    { headers }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch diseases');
  }

  return response.json();
}

export async function getDisease(
  diseaseId: string,
  token?: string
): Promise<Disease> {
  const headers: Record<string, string> = {
    'ngrok-skip-browser-warning': '1'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(
    `${API_BASE_URL}/api/diseases/${diseaseId}`,
    { headers }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Disease not found');
    }
    
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch disease');
  }

  return response.json();
}

export async function createDisease(
  token: string, 
  diseaseData: DiseaseCreate
): Promise<Disease> {
  const response = await fetch(
    `${API_BASE_URL}/api/diseases/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': '1'
      },
      body: JSON.stringify(diseaseData)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create disease');
  }

  return response.json();
}

export async function updateDisease(
  token: string, 
  diseaseId: string, 
  diseaseData: DiseaseUpdate
): Promise<Disease> {
  const response = await fetch(
    `${API_BASE_URL}/api/diseases/${diseaseId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': '1'
      },
      body: JSON.stringify(diseaseData)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update disease');
  }

  return response.json();
}

export async function deleteDisease(
  token: string, 
  diseaseId: string, 
  softDelete = true
): Promise<any> {
  const response = await fetch(
    `${API_BASE_URL}/api/diseases/${diseaseId}?soft_delete=${softDelete}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': '1'
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete disease');
  }

  return response.json();
}

export async function searchDiseases(
  searchTerm: string,
  token?: string
): Promise<Disease[]> {
  const headers: Record<string, string> = {
    'ngrok-skip-browser-warning': '1'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(
    `${API_BASE_URL}/api/diseases/search/${encodeURIComponent(searchTerm)}`,
    { headers }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to search diseases');
  }

  return response.json();
} 