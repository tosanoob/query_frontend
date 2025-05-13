'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/lib/context/AuthContext';
import { getArticles, deleteArticle, Article } from '@/app/lib/api/article';
import { useRouter } from 'next/navigation';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  const loadArticles = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const skip = (page - 1) * itemsPerPage;
      const data = await getArticles(skip, itemsPerPage, token || undefined);
      setArticles(data);
      // In a real app, you'd get total count from API
      // This is a placeholder for pagination logic
      setTotalPages(Math.ceil(data.length > 0 ? 20 : 0 / itemsPerPage));
      setCurrentPage(page);
    } catch (err) {
      setError((err as Error).message || 'Failed to load articles');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadArticles(currentPage);
    }
  }, [token, currentPage]);

  const handleDelete = async (id: string) => {
    if (!token) return;
    
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      try {
        await deleteArticle(token, id);
        loadArticles(currentPage);
      } catch (err) {
        setError((err as Error).message || 'Failed to delete article');
        console.error(err);
      }
    }
  };

  const handleViewArticle = (e: React.MouseEvent<HTMLAnchorElement>, article: Article) => {
    // Prevent default link behavior
    e.preventDefault();
    
    // Only navigate if the article is not deleted
    if (!article.deleted_at && article.id) {
      router.push(`/articles/${article.id}`);
    } else {
      alert('Bài viết này không thể xem do đã bị xóa.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-700 text-primary">Quản lý Bài viết</h1>
        <Link
          href="/admin/articles/create"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          Tạo bài đăng mới
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiêu đề
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tác giả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {articles.length > 0 ? (
                  articles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{article.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          ID: {article.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{article.creator?.username || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          !article.deleted_at 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {!article.deleted_at ? 'Đang hiển thị' : 'Đã xóa'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {article.created_at ? new Date(article.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        <div className="flex justify-center space-x-2">
                          <a
                            href="#"
                            onClick={(e) => handleViewArticle(e, article)}
                            className={`text-blue-600 hover:text-blue-900 ${
                              article.deleted_at ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            Xem
                          </a>
                          <Link
                            href={`/admin/articles/${article.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Sửa
                          </Link>
                          <button
                            onClick={() => handleDelete(article.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      Không có bài đăng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
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