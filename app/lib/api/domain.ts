import { API_BASE_URL } from '@/app/lib/utils/constants';

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
  limit = 100
): Promise<Domain[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/domains/?skip=${skip}&limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': '1'
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch domains');
  }

  return response.json();
}

export async function getDomain(token: string, domainId: string): Promise<Domain> {
  const response = await fetch(
    `${API_BASE_URL}/api/domains/${domainId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': '1'
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch domain');
  }

  return response.json();
}

export async function createDomain(
  token: string, 
  domainData: DomainCreate
): Promise<Domain> {
  const response = await fetch(
    `${API_BASE_URL}/api/domains/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': '1'
      },
      body: JSON.stringify(domainData)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create domain');
  }

  return response.json();
}

export async function updateDomain(
  token: string, 
  domainId: string, 
  domainData: DomainUpdate
): Promise<Domain> {
  const response = await fetch(
    `${API_BASE_URL}/api/domains/${domainId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': '1'
      },
      body: JSON.stringify(domainData)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update domain');
  }

  return response.json();
}

export async function deleteDomain(
  token: string, 
  domainId: string, 
  softDelete = true
): Promise<any> {
  const response = await fetch(
    `${API_BASE_URL}/api/domains/${domainId}?soft_delete=${softDelete}`,
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
    throw new Error(error.detail || 'Failed to delete domain');
  }

  return response.json();
} 