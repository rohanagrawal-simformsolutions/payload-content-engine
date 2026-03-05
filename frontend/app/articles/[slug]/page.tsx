"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

interface Article {
  id: string;
  title: string;
  slug: string;
  summaryTitle?: string;
  content?: any;
  featuredImage?: string;
  tags?: Array<string | { id: string; tag: string }>;
  createdAt: string;
  updatedAt: string;
  author?: {
    name: string;
    email: string;
  };
}

// Helper function to render Payload CMS Lexical content
function renderLexicalContent(content: any): JSX.Element {
  if (!content) return <p className="text-gray-500">No content available</p>;

  // If it's a string, just return it
  if (typeof content === 'string') {
    return <div className="text-gray-700 leading-relaxed whitespace-pre-line">{content}</div>;
  }

  // Handle Payload's Lexical format
  if (content.root && content.root.children) {
    return (
      <div className="text-gray-700 leading-relaxed space-y-4">
        {content.root.children.map((node: any, index: number) => renderNode(node, index))}
      </div>
    );
  }

  // Fallback: show as formatted JSON
  return (
    <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
      {JSON.stringify(content, null, 2)}
    </pre>
  );
}

function renderNode(node: any, key: number): JSX.Element {
  if (!node) return <></>;

  // Handle paragraph nodes
  if (node.type === 'paragraph') {
    return (
      <p key={key} className="mb-4">
        {node.children?.map((child: any, i: number) => renderNode(child, i))}
      </p>
    );
  }

  // Handle heading nodes
  if (node.type === 'heading') {
    const tag = node.tag || 'h2';
    const HeadingTag = tag as keyof JSX.IntrinsicElements;
    const className = tag === 'h1' ? 'text-3xl font-bold mb-4' :
                      tag === 'h2' ? 'text-2xl font-bold mb-3' :
                      tag === 'h3' ? 'text-xl font-bold mb-2' :
                      'text-lg font-bold mb-2';
    return (
      <HeadingTag key={key} className={className}>
        {node.children?.map((child: any, i: number) => renderNode(child, i))}
      </HeadingTag>
    );
  }

  // Handle list nodes
  if (node.type === 'list') {
    const ListTag = node.listType === 'number' ? 'ol' : 'ul';
    return (
      <ListTag key={key} className={node.listType === 'number' ? 'list-decimal ml-6 mb-4' : 'list-disc ml-6 mb-4'}>
        {node.children?.map((child: any, i: number) => renderNode(child, i))}
      </ListTag>
    );
  }

  // Handle list item nodes
  if (node.type === 'listitem') {
    return (
      <li key={key} className="mb-1">
        {node.children?.map((child: any, i: number) => renderNode(child, i))}
      </li>
    );
  }

  // Handle text nodes with formatting
  if (node.type === 'text' || node.text !== undefined) {
    let text = node.text || '';

    // If text contains HTML tags, render as HTML
    if (/<[a-z][\s\S]*>/i.test(text)) {
      return <span key={key} dangerouslySetInnerHTML={{ __html: text }} />;
    }

    let element = <span key={key}>{text}</span>;

    if (node.format) {
      if (node.format & 1) element = <strong key={key}>{text}</strong>; // bold
      if (node.format & 2) element = <em key={key}>{text}</em>; // italic
      if (node.format & 8) element = <code key={key} className="bg-gray-100 px-1 rounded">{text}</code>; // code
    }

    return element;
  }

  // Handle link nodes
  if (node.type === 'link') {
    return (
      <a key={key} href={node.url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
        {node.children?.map((child: any, i: number) => renderNode(child, i))}
      </a>
    );
  }

  // If we have children, render them
  if (node.children && Array.isArray(node.children)) {
    return <span key={key}>{node.children.map((child: any, i: number) => renderNode(child, i))}</span>;
  }

  return <></>;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { isAuthenticated, token } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`http://localhost:3000/articles/${slug}`);
      if (!response.ok) throw new Error("Article not found");
      const data = await response.json();
      setArticle(data);
    } catch (err) {
      setError("Failed to load article");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!article) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete "${article.title}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await api.delete(`/admin/articles/${article.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete article");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading article...</div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || "Article not found"}
        </div>
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          ← Back to articles
        </Link>
        {isAuthenticated && (
          <div className="flex gap-3">
            <Link
              href={`/articles/${slug}/edit`}
              className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 text-sm font-medium"
            >
              ✏️ Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-medium disabled:bg-gray-400"
            >
              {deleting ? "Deleting..." : "🗑️ Delete"}
            </button>
          </div>
        )}
      </div>

      <article className="bg-white rounded-lg shadow-lg overflow-hidden">
        {article.featuredImage && (
          <div className="w-full h-96 bg-gray-200 relative">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>
            
            {article.summaryTitle && (
              <p className="text-xl text-gray-600 mb-4">{article.summaryTitle}</p>
            )}

            <div className="flex items-center text-sm text-gray-500 space-x-4">
              {article.author && (
                <span>By {article.author.name}</span>
              )}
              <span>
                Published on {new Date(article.createdAt).toLocaleDateString()}
              </span>
            </div>

            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {article.tags.map((tag, index) => {
                  // Handle both string tags and object tags {id, tag}
                  const tagValue = typeof tag === 'string' ? tag : tag?.tag || '';
                  return (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {tagValue}
                    </span>
                  );
                })}
              </div>
            )}
          </header>

          <div className="prose max-w-none">
            {renderLexicalContent(article.content)}
          </div>
        </div>
      </article>
    </div>
  );
}
