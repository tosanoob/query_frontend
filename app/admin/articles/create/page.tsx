'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/context/AuthContext';
import { createArticle, ArticleCreate } from '@/app/lib/api/article';
import Link from 'next/link';

export default function CreateArticlePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { token, user } = useAuth();
  const router = useRouter();

  const generateSlug = (title: string) => {
    if (!title) return '';
    
    return title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('You must be logged in to create an article');
      return;
    }
    
    if (!title || !content) {
      setError('Title and content are required');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const generatedSlug = generateSlug(title);
      
      const articleData: ArticleCreate = {
        title,
        content,
        created_by: user?.id,
        slug: generatedSlug,
      };
      
      await createArticle(token, articleData);
      router.push('/admin/articles');
    } catch (err) {
      setError((err as Error).message || 'Failed to create article');
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl text-gray-700 font-bold">Tạo Bài đăng Mới</h1>
        <Link
          href="/admin/articles"
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Trở về
        </Link>
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
              className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              disabled={isLoading}
              required
            />
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
              className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              disabled={isLoading}
              required
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary text-indigo-500 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Đang xử lý...' : 'Tạo bài đăng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 