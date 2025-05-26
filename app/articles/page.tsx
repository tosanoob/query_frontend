'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getArticles, Article } from '@/app/lib/api/article';
import Image from 'next/image';
import { getFullImageUrl } from '@/app/lib/utils/constants';

export default function ArticlesListPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const loadArticles = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const skip = (page - 1) * 10;
      const response = await getArticles(skip, 10);
      setArticles(response.items);
      setTotalPages(response.pagination.pages);
      setHasNext(response.pagination.has_next);
      setHasPrev(response.pagination.has_prev);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error loading articles:', err);
      setError((err as Error).message || 'Failed to load articles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArticles(currentPage);
  }, [currentPage]);

  function formatDate(dateString: string | null) {
    if (!dateString) return '';
    
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Trả về chuỗi gốc nếu không thể format
    }
  }

  function truncateText(text: string, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8 text-blue-700">Bài viết về Bệnh Da liễu</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <p className="text-lg">Đang tải bài viết...</p>
        </div>
      ) : (
        <>
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">Không có bài viết nào.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <Link key={article.id} href={`/articles/${article.slug || article.id}`}>
                  <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                    {article.images && article.images.length > 0 && (
                      <div className="relative h-48 w-full">
                        <Image 
                          src={getFullImageUrl(
                            article.images.find(img => img.usage === 'cover')?.image.base_url || article.images[0].image.base_url,
                            article.images.find(img => img.usage === 'cover')?.image.rel_path || article.images[0].image.rel_path
                          )}
                          alt={article.title || ''}
                          fill
                          style={{objectFit: "cover"}}
                        />
                      </div>
                    )}
                    <div className="p-6 flex-grow">
                      <h2 className="text-xl font-semibold mb-2 hover:text-blue-500 transition-colors text-blue-700">
                        {article.title}
                      </h2>
                      <div className="text-sm text-gray-500 mb-3">
                        {article.author && <span>By {article.author} · </span>}
                        <span>{formatDate(article.created_at)}</span>
                      </div>
                      <div className="text-gray-600">
                        {truncateText(article.content?.replace(/<[^>]*>/g, '') || '')}
                      </div>
                    </div>
                    <div className="px-6 pb-4">
                      <span className="text-blue-700 text-sm font-medium">
                        Đọc tiếp &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-4 flex justify-center items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={!hasPrev}
              className="px-3 py-1 text-gray-800 rounded border disabled:opacity-50"
            >
              Trước
            </button>
            <span className="text-gray-800 text-sm">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={!hasNext}
              className="px-3 py-1 text-gray-800 rounded border disabled:opacity-50"
            >
              Tiếp
            </button>
          </div>
        </>
      )}
    </div>
  );
} 