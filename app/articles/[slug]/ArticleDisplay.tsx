'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getArticleBySlug, getArticle } from '@/app/lib/api/article';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/lib/context/AuthContext';
import { getFullImageUrl } from '@/app/lib/utils/constants';
import { RichTextRenderer } from '@/app/lib/utils/TextRenderer';

interface ArticleDisplayProps {
  articleId: string;
}

export default function ArticleDisplay({ articleId }: ArticleDisplayProps) {
  const [article, setArticle] = useState<{
    id: string;
    title: string;
    content: string;
    created_at: string | null;
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
        
        // Không cần kiểm tra published nữa vì không có trường này
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
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-lg text-gray-700">Đang tải bài viết...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error || 'Không tìm thấy bài viết'}
            </div>
            <Link href="/articles" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Trở về danh sách bài viết
            </Link>
          </div>
        </div>
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Back to Articles Button */}
        <div className="mb-6">
          <Link href="/articles" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại danh sách bài viết
          </Link>
        </div>

        {/* Admin Edit Button */}
        {isAdmin && (
          <div className="mb-6 flex justify-end">
            <Link
              href={`/admin/articles/${article.id}/edit`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Chỉnh sửa bài viết
            </Link>
          </div>
        )}
        
        {/* Article Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Article Header */}
          <div className="p-8">
            {/* Featured Image */}
            {article.images && article.images.length > 0 && (
              <div className="relative h-72 w-full mb-8 rounded-lg overflow-hidden bg-gray-100">
                <Image 
                  src={getFullImageUrl(
                    article.images.find(img => img.usage === 'cover')?.image.base_url || article.images[0].image.base_url,
                    article.images.find(img => img.usage === 'cover')?.image.rel_path || article.images[0].image.rel_path
                  )}
                  alt={article.title}
                  fill
                  style={{objectFit: "cover"}}
                  priority
                  className="rounded-lg"
                />
              </div>
            )}

            {/* Article Meta */}
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-100 rounded-full p-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <span className="text-blue-600 text-sm font-medium">Bài viết về bệnh da liễu</span>
              </div>
            </div>

            {/* Article Title */}
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 leading-tight">{article.title}</h1>
            
            {/* Article Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 border-b border-gray-200 pb-6 mb-8">
              {article.creator?.username && (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Tác giả: <span className="font-medium text-gray-800">{article.creator.username}</span></span>
                </div>
              )}
              {formattedDate && (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Ngày đăng: <time className="font-medium text-gray-800">{formattedDate}</time></span>
                </div>
              )}
            </div>
            
            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              <RichTextRenderer 
                content={article.content} 
                className="article-content text-gray-800 leading-relaxed" 
              />
            </div>

            {/* Call to Action */}
            <div className="mt-12 bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-xl font-semibold text-blue-900 mb-3">Cần tư vấn thêm?</h3>
              <p className="text-blue-800 mb-4">
                Nếu bạn có thắc mắc về các vấn đề da liễu, hãy sử dụng công cụ chẩn đoán của chúng tôi hoặc tham khảo thêm các bài viết khác.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/diagnosis" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Chẩn đoán ngay
                </Link>
                <Link href="/articles" className="inline-flex items-center px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Xem thêm bài viết
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 