import { API_BASE_URL } from '@/app/lib/utils/constants';

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
  limit = 100, 
  search?: string | null
): Promise<Clinic[]> {
  let url = `${API_BASE_URL}/api/clinic/?skip=${skip}&limit=${limit}`;
  
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  
  const response = await fetch(url, {
    headers: {
      'ngrok-skip-browser-warning': '1'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch clinics');
  }

  return response.json();
}

export async function getClinic(clinicId: string): Promise<Clinic> {
  const response = await fetch(
    `${API_BASE_URL}/api/clinic/${clinicId}`,
    {
      headers: {
        'ngrok-skip-browser-warning': '1'
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch clinic');
  }

  return response.json();
}

export async function createClinic(
  token: string, 
  clinicData: ClinicCreate
): Promise<Clinic> {
  const response = await fetch(
    `${API_BASE_URL}/api/clinic/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': '1'
      },
      body: JSON.stringify(clinicData)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create clinic');
  }

  return response.json();
}

export async function updateClinic(
  token: string, 
  clinicId: string, 
  clinicData: ClinicUpdate
): Promise<Clinic> {
  const response = await fetch(
    `${API_BASE_URL}/api/clinic/${clinicId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': '1'
      },
      body: JSON.stringify(clinicData)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update clinic');
  }

  return response.json();
}

export async function deleteClinic(
  token: string, 
  clinicId: string, 
  softDelete = true
): Promise<any> {
  const response = await fetch(
    `${API_BASE_URL}/api/clinic/${clinicId}?soft_delete=${softDelete}`,
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
    throw new Error(error.detail || 'Failed to delete clinic');
  }

  return response.json();
}

export async function searchClinics(searchTerm: string): Promise<Clinic[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/clinic/search/${encodeURIComponent(searchTerm)}`,
    {
      headers: {
        'ngrok-skip-browser-warning': '1'
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to search clinics');
  }

  return response.json();
} 