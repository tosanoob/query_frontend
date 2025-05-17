import { API_BASE_URL } from '@/app/lib/utils/constants';
import { PaginatedResponse } from './types';
import { apiClient } from './apiClient';

interface ArticleImage {
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

export interface Article {
  id: string;
  title: string;
  content: string;
  author: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
  published: boolean;
  slug: string;
  summary?: string;
  creator?: {
    user_id: string;
    username: string;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
  };
  images?: ArticleImage[];
}

export interface ArticleCreate {
  title: string;
  content: string;
  author?: string | null;
  created_by?: string | null;
  published?: boolean;
  slug?: string;
}

export interface ArticleUpdate {
  title?: string | null;
  content?: string | null;
  author?: string | null;
  updated_by?: string | null;
  published?: boolean | null;
  slug?: string | null;
}

export async function getArticles(
  skip = 0, 
  limit = 10,
  token?: string
): Promise<PaginatedResponse<Article>> {
  return apiClient.get<PaginatedResponse<Article>>(
    `/api/article/?skip=${skip}&limit=${limit}`,
    { token }
  );
}

export async function getArticle(
  articleId: string,
  token?: string
): Promise<Article> {
  console.log(`Fetching article by ID: ${articleId}`);
  
  try {
    const data = await apiClient.get<Article>(`/api/article/${articleId}`, { token });
    console.log('Article data from ID:', data);
    return data;
  } catch (error) {
    console.error('Error fetching article:', error);
    throw error;
  }
}

export async function getArticleBySlug(
  slug: string,
  token?: string
): Promise<Article> {
  console.log(`Fetching article by slug: ${slug}`);
  
  try {
    const data = await apiClient.get<Article>(`/api/article/slug/${slug}`, { token });
    console.log('Article data from slug:', data);
    return data;
  } catch (error) {
    console.error('Error fetching article by slug:', error);
    throw error;
  }
}

export async function createArticle(
  token: string, 
  articleData: ArticleCreate
): Promise<Article> {
  return apiClient.post<Article>('/api/article/', articleData, { token });
}

export async function updateArticle(
  token: string, 
  articleId: string, 
  articleData: ArticleUpdate
): Promise<Article> {
  return apiClient.put<Article>(`/api/article/${articleId}`, articleData, { token });
}

export async function deleteArticle(
  token: string, 
  articleId: string, 
  softDelete = true
): Promise<any> {
  return apiClient.delete<any>(
    `/api/article/${articleId}?soft_delete=${softDelete}`,
    { token }
  );
} 