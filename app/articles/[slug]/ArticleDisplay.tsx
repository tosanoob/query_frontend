'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getArticleBySlug, getArticle } from '@/app/lib/api/article';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/lib/context/AuthContext';
import { getFullImageUrl } from '@/app/lib/utils/constants';

interface ArticleDisplayProps {
  articleId: string;
}

export default function ArticleDisplay({ articleId }: ArticleDisplayProps) {
  const [article, setArticle] = useState<{
    id: string;
    title: string;
    content: string;
    author: string | null;
    created_at: string | null;
    published?: boolean;
    images?: { 
      image: { base_url: string; rel_path: string };
      usage: string;
    }[];
    creator?: { username: string };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        console.log('Fetching article with ID:', articleId);
        
        let data;
        try {
          // Lấy bài viết bằng ID
          data = await getArticle(articleId);
        } catch (idError) {
          console.error('Error fetching by ID:', idError);
          throw new Error('Không thể tìm thấy bài viết');
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
  }, [articleId, router, isAdmin]);

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
          {article.images && article.images.length > 0 && (
            <div className="relative h-72 w-full mb-6 rounded-lg overflow-hidden">
              <Image 
                src={getFullImageUrl(
                  article.images.find(img => img.usage === 'cover')?.image.base_url || article.images[0].image.base_url,
                  article.images.find(img => img.usage === 'cover')?.image.rel_path || article.images[0].image.rel_path
                )}
                alt={article.title}
                fill
                style={{objectFit: "cover"}}
                priority
              />
            </div>
          )}
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          <div className="text-gray-600">
            {article.creator?.username && (
              <span className="mr-4">
                Tác giả: <span className="font-medium">{article.creator.username}</span>
              </span>
            )}
            {formattedDate && (
              <span>
                Ngày đăng: <time>{formattedDate}</time>
              </span>
            )}
          </div>
        </header>
        
        <div className="article-content text-gray-200" dangerouslySetInnerHTML={{ __html: article.content }} />
      </article>
    </div>
  );
} 