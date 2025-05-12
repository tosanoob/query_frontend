'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getArticleBySlug, getArticle } from '@/app/lib/api/article';
import Link from 'next/link';
import { useAuth } from '@/app/lib/context/AuthContext';

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const [article, setArticle] = useState<{
    id: string;
    title: string;
    content: string;
    author: string | null;
    created_at: string | null;
    published?: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { isAdmin } = useAuth();
  // Truy cập params.slug trực tiếp thay vì dùng React.use()
  const slug = params.slug;

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        console.log('Fetching article with slug/id:', slug);
        
        let data;
        let fetchedByID = false;
        
        try {
          // Thử lấy bài viết bằng slug trước
          data = await getArticleBySlug(slug);
        } catch (slugError) {
          console.error('Error fetching by slug:', slugError);
          
          try {
            // Nếu không thành công, thử lấy bằng ID
            data = await getArticle(slug);
            fetchedByID = true;
          } catch (idError) {
            console.error('Error fetching by ID:', idError);
            throw new Error('Không thể tìm thấy bài viết');
          }
        }
        
        console.log('Article data:', data);
        
        // Chỉ chuyển hướng nếu bài viết không được public và user không phải admin
        // và nếu trường published tồn tại
        if (data.published === false && !isAdmin) {
          router.push('/');
          return;
        }
        
        setArticle(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error in fetchArticle:', err);
        setError((err as Error).message || 'Failed to fetch article');
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [slug, router, isAdmin]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-lg">Đang tải bài viết...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Không tìm thấy bài viết'}
        </div>
        <Link href="/articles" className="text-primary hover:underline">
          Trở về danh sách bài viết
        </Link>
      </div>
    );
  }

  let formattedDate = '';
  try {
    formattedDate = article.created_at 
      ? new Date(article.created_at).toLocaleDateString('vi-VN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      : '';
  } catch (err) {
    console.error('Error formatting date:', err);
    formattedDate = article.created_at || '';
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {isAdmin && (
        <div className="mb-6 flex justify-end">
          <Link
            href={`/admin/articles/${article.id}/edit`}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            Chỉnh sửa bài viết
          </Link>
        </div>
      )}
      
      {article.published === false && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-6">
          Bài viết đang ở chế độ không công khai. Chỉ quản trị viên mới có thể xem.
        </div>
      )}
      
      <article className="prose prose-lg mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          <div className="text-gray-600">
            {article.author && (
              <span className="mr-4">
                Tác giả: <span className="font-medium">{article.author}</span>
              </span>
            )}
            {formattedDate && (
              <span>
                Ngày đăng: <time>{formattedDate}</time>
              </span>
            )}
          </div>
        </header>
        
        <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
      </article>
    </div>
  );
} 