'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/lib/context/AuthContext';
import { Article, getArticle, deleteArticle } from '@/app/lib/api/article';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { getFullImageUrl } from '@/app/lib/utils/constants';

export default function ArticleDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { token } = useAuth();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  useEffect(() => {
    const fetchArticleData = async () => {
      if (!id) return;
      
      try {
        const articleData = await getArticle(id, token || undefined);
        setArticle(articleData);
      } catch (err) {
        setError((err as Error).message || 'Không thể tải thông tin bài viết');
        console.error('Error fetching article:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArticleData();
  }, [id, token]);
  
  const handleDelete = async () => {
    if (!token) {
      setError('Bạn cần đăng nhập để thực hiện thao tác này');
      return;
    }
    
    try {
      await deleteArticle(token, id);
      router.push('/admin/articles');
    } catch (err) {
      setError((err as Error).message || 'Lỗi khi xóa bài viết');
      setShowDeleteModal(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Đang tải...</p>
      </div>
    );
  }
  
  if (!article && !isLoading) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        <p>Không tìm thấy bài viết với ID: {id}</p>
        <Link 
          href="/admin/articles"
          className="text-primary hover:underline mt-2 inline-block"
        >
          &larr; Quay lại danh sách
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl text-gray-700 font-bold">Chi tiết bài viết</h1>
        <div className="flex space-x-3">
          <Link
            href="/admin/articles"
            className="text-gray-600 hover:text-gray-900"
          >
            &larr; Quay lại danh sách
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-9">
            <h2 className="text-lg text-gray-700 font-semibold mb-4">Thông tin bài viết</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{article?.title}</h3>
              </div>
              
              {article?.summary && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Tóm tắt</p>
                  <p className="text-gray-700 italic bg-gray-50 p-3 rounded-md">{article.summary}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-500 mb-2">Nội dung</p>
                <div className="prose max-w-none text-gray-700 bg-gray-50 p-4 rounded-md whitespace-pre-line">
                  <div dangerouslySetInnerHTML={{ __html: article?.content || '' }} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-3">
            <h2 className="text-lg text-gray-700 font-semibold mb-4">Thông tin quản trị</h2>
            
            <div className="space-y-4">
              {article?.creator && (
                <div>
                  <p className="text-sm text-gray-500">Người tạo</p>
                  <p className="text-gray-700">{article.creator.username}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6">
          <h2 className="text-lg text-gray-700 font-semibold mb-4">Thông tin quản trị</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Ngày tạo</p>
              <p className="text-gray-700">{article?.created_at ? new Date(article.created_at).toLocaleDateString('vi-VN') : 'N/A'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Cập nhật lần cuối</p>
              <p className="text-gray-700">{article?.updated_at ? new Date(article.updated_at).toLocaleDateString('vi-VN') : 'N/A'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">ID</p>
              <p className="text-gray-700 font-mono text-sm">{article?.id}</p>
            </div>
          </div>
        </div>
        
        {/* Images section if available */}
        {article?.images && article.images.length > 0 && (
          <div className="border-t border-gray-200 mt-8 pt-6">
            <h2 className="text-lg text-gray-700 font-semibold mb-4">Hình ảnh đính kèm</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {article.images.map((imageItem) => (
                <div key={imageItem.id} className="border rounded-md p-2">
                  <img
                    src={getFullImageUrl(imageItem.image.base_url, imageItem.image.rel_path)}
                    alt="Article image"
                    className="w-full h-24 object-cover rounded-md mb-2"
                  />
                  <p className="text-xs text-gray-500 truncate">{imageItem.usage}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-3">
        <Link
          href={`/admin/articles/${id}/edit`}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Chỉnh sửa
        </Link>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Xóa
        </button>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Xác nhận xóa
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Bạn có chắc chắn muốn xóa bài viết "{article?.title}"? Hành động này không thể hoàn tác.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDelete}
                >
                  Xóa
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 