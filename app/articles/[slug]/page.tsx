import ArticleDisplay from './ArticleDisplay';

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const articleId = resolvedParams.slug;
  
  return <ArticleDisplay articleId={articleId} />;
} 