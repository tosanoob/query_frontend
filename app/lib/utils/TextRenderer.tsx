import React from 'react';

interface TextRendererProps {
  text: string;
  className?: string;
}

export function TextRenderer({ text, className = '' }: TextRendererProps) {
  // Tách text thành các dòng và render từng dòng
  const lines = text.split(/\r?\n/);
  
  return (
    <div className={className}>
      {lines.map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </div>
  );
}

interface RichTextRendererProps {
  content: string;
  className?: string;
}

export function RichTextRenderer({ content, className = '' }: RichTextRendererProps) {
  // Xử lý HTML content với xuống dòng
  const processedContent = content
    .replace(/\n/g, '<br />')
    .replace(/\r\n/g, '<br />');
    
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
} 