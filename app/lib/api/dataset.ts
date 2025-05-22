import { apiClient } from './apiClient';

export interface DatasetUploadRequest {
  dataset_name: string;
  custom_domain_name?: string;
  metadata_file: File;
}

export async function uploadDataset(
  token: string, 
  data: DatasetUploadRequest
): Promise<any> {
  const formData = new FormData();
  formData.append('metadata_file', data.metadata_file);
  
  // API expects dataset_name and custom_domain_name as query parameters
  const queryParams = new URLSearchParams();
  queryParams.append('dataset_name', data.dataset_name);
  
  if (data.custom_domain_name) {
    queryParams.append('custom_domain_name', data.custom_domain_name);
  }
  
  return apiClient.postFormData<any>(
    `/api/datasets/upload?${queryParams.toString()}`,
    formData,
    { token }
  );
}

export async function deleteDataset(
  token: string,
  domainName: string
): Promise<any> {
  return apiClient.delete<any>(
    `/api/datasets/${domainName}`,
    { token }
  );
} 