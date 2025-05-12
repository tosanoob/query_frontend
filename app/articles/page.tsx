'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getArticles, Article } from '@/app/lib/api/article';

export default function ArticlesListPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const loadArticles = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const skip = (page - 1) * itemsPerPage;
      const data = await getArticles(skip, itemsPerPage);
      
      console.log('Articles from API:', data);
      
      // Sử dụng toàn bộ dữ liệu thay vì lọc, vì có thể không có trường published
      setArticles(data);
      
      // Lưu trữ số trang dựa trên số lượng bài viết
      setTotalPages(Math.ceil(data.length > 0 ? Math.max(data.length, 10) / itemsPerPage : 1));
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

  function truncateText(text: string, maxLength = 150) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Bài viết về Bệnh Da liễu</h1>

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
                    <div className="p-6 flex-grow">
                      <h2 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
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
                      <span className="text-primary text-sm font-medium">
                        Đọc tiếp &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <nav className="flex items-center">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md mr-2 bg-white border border-gray-300 text-sm disabled:opacity-50"
                >
                  Trước
                </button>
                <span className="px-4 py-1 text-sm text-gray-700">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md ml-2 bg-white border border-gray-300 text-sm disabled:opacity-50"
                >
                  Sau
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
} 