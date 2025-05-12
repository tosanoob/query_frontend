import EditArticleForm from './EditArticleForm';

// Server component
export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const articleId = resolvedParams.id;
  
  return <EditArticleForm articleId={articleId} />;
} 