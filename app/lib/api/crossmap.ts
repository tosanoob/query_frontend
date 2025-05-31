import { apiClient } from './apiClient';
import { PaginatedResponse } from './types';

export interface Crossmap {
  crossmap_id: string;
  source_disease_id: string;
  target_disease_id: string;
  source_disease_label: string;
  target_disease_label: string;
}

export interface CrossmapCreate {
  disease_id_1: string;
  domain_id_1: string;
  disease_id_2: string;
  domain_id_2: string;
}

export interface StandardCrossmapUpdate {
  target_domain_id: string;
  crossmaps_lite: {
    standard_disease_id: string;
    target_disease_id: string;
  }[];
}

export interface CrossmapImport {
  mappings: Record<string, string>;
  target_domain_name: string;
}

export async function getCrossmapsBetweenDomains(
  domainId1: string,
  domainId2: string,
  token: string
): Promise<Crossmap[]> {
  return apiClient.get<Crossmap[]>(
    `/api/crossmaps/domains/${domainId1}/${domainId2}`,
    { token }
  );
}

export async function updateStandardCrossmaps(
  token: string,
  data: StandardCrossmapUpdate
): Promise<any> {
  return apiClient.post<any>(
    '/api/crossmaps/batch/standard',
    data,
    { token }
  );
}

export async function importCrossmaps(
  token: string,
  data: CrossmapImport
): Promise<any> {
  return apiClient.post<any>(
    '/api/crossmaps/import',
    data,
    { token }
  );
} 