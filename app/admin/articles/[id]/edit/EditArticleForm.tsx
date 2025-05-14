'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/context/AuthContext';
import { getArticle, updateArticle, ArticleUpdate } from '@/app/lib/api/article';
import Link from 'next/link';

interface EditArticleFormProps {
  articleId: string;
}

export default function EditArticleForm({ articleId }: EditArticleFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { token, user } = useAuth();
  const router = useRouter();

  // Fetch article data
  useEffect(() => {
    if (!token) return;

    const fetchArticle = async () => {
      try {
        const article = await getArticle(articleId, token);
        setTitle(article.title);
        setContent(article.content);
        setPublished(article.published);
        setIsLoading(false);
      } catch (err) {
        setError((err as Error).message || 'Failed to fetch article');
        console.error(err);
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [articleId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('You must be logged in to update the article');
      return;
    }
    
    if (!title || !content) {
      setError('Title and content are required');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      const articleData: ArticleUpdate = {
        title,
        content,
        updated_by: user?.id,
        published,
      };
      
      await updateArticle(token, articleId, articleData);
      router.push('/admin/articles');
    } catch (err) {
      setError((err as Error).message || 'Failed to update article');
      console.error(err);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-lg">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl text-gray-700 font-bold">Chỉnh sửa Bài đăng</h1>
        <div className="space-x-2">
          <Link
            href="/admin/articles"
            className="px-4 py-2 border text-gray-700 border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Trở về
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              disabled={isSaving}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID bài viết
            </label>
            <div className="w-full text-gray-500 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
              {articleId} <span className="text-xs italic">(Không thể chỉnh sửa)</span>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Nội dung
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              className="w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              disabled={isSaving}
              required
            ></textarea>
          </div>

          <div className="mb-4 text-gray-600 text-sm">
            <p>Chỉnh sửa bởi: {user?.username || 'Unknown'}</p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 