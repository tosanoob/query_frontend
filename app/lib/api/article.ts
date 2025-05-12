import { API_BASE_URL } from '@/app/lib/utils/constants';

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
): Promise<Article[]> {
  const headers: Record<string, string> = {
    'ngrok-skip-browser-warning': '1'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  console.log(`${API_BASE_URL}/api/article/?skip=${skip}&limit=${limit}`);
  const response = await fetch(
    `${API_BASE_URL}/api/article/?skip=${skip}&limit=${limit}`,
    { headers }
  );
  console.log('Response status:', response.status);
  console.log('Response type:', response.headers.get('content-type'));

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch articles');
  }
  return response.json();
}

export async function getArticle(
  articleId: string,
  token?: string
): Promise<Article> {
  const headers: Record<string, string> = {
    'ngrok-skip-browser-warning': '1'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  console.log(`Fetching article by ID: ${articleId}`);
  console.log(`URL: ${API_BASE_URL}/api/article/${articleId}`);
  
  const response = await fetch(
    `${API_BASE_URL}/api/article/${articleId}`,
    { headers }
  );

  console.log('Response status:', response.status);
  console.log('Response type:', response.headers.get('content-type'));
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Article not found');
    }
    
    try {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch article');
    } catch (err) {
      console.error('Error parsing error response:', err);
      throw new Error(`Failed to fetch article: ${response.statusText}`);
    }
  }

  const data = await response.json();
  console.log('Article data from ID:', data);
  return data;
}

export async function getArticleBySlug(
  slug: string,
  token?: string
): Promise<Article> {
  const headers: Record<string, string> = {
    'ngrok-skip-browser-warning': '1'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  console.log(`Fetching article by slug: ${slug}`);
  console.log(`URL: ${API_BASE_URL}/api/article/slug/${slug}`);
  
  const response = await fetch(
    `${API_BASE_URL}/api/article/slug/${slug}`,
    { headers }
  );

  console.log('Response status:', response.status);
  console.log('Response type:', response.headers.get('content-type'));
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Article not found');
    }
    
    try {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch article');
    } catch (err) {
      console.error('Error parsing error response:', err);
      throw new Error(`Failed to fetch article: ${response.statusText}`);
    }
  }

  const data = await response.json();
  console.log('Article data from slug:', data);
  return data;
}

export async function createArticle(
  token: string, 
  articleData: ArticleCreate
): Promise<Article> {
  const response = await fetch(
    `${API_BASE_URL}/api/article/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': '1'
      },
      body: JSON.stringify(articleData)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create article');
  }

  return response.json();
}

export async function updateArticle(
  token: string, 
  articleId: string, 
  articleData: ArticleUpdate
): Promise<Article> {
  const response = await fetch(
    `${API_BASE_URL}/api/article/${articleId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': '1'
      },
      body: JSON.stringify(articleData)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update article');
  }

  return response.json();
}

export async function deleteArticle(
  token: string, 
  articleId: string, 
  softDelete = true
): Promise<any> {
  const response = await fetch(
    `${API_BASE_URL}/api/article/${articleId}?soft_delete=${softDelete}`,
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
    throw new Error(error.detail || 'Failed to delete article');
  }

  return response.json();
} 