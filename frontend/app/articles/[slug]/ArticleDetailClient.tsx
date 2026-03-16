"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import BlockRenderer, { Block } from "@/components/BlockRenderer";

interface Article {
  id: string;
  title: string;
  slug: string;
  summaryTitle?: string;
  content?: any;
  blocks?: Block[];
  featuredImage?: string;
  tags?: Array<string | { id: string; tag: string }>;
  createdAt: string;
  updatedAt: string;
  author?: {
    name: string;
    email: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
    noIndex?: boolean;
  };
}

// Helper function to render Payload CMS Lexical content
function renderLexicalContent(content: any): JSX.Element {
  if (!content) return <p className="text-gray-500">No content available</p>;

  if (typeof content === "string") {
    return (
      <div
        className="prose max-w-none text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  if (content.root && content.root.children) {
    return (
      <div className="text-gray-700 leading-relaxed space-y-4">
        {content.root.children.map((node: any, index: number) =>
          renderNode(node, index),
        )}
      </div>
    );
  }

  return (
    <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
      {JSON.stringify(content, null, 2)}
    </pre>
  );
}

function renderNode(node: any, key: number): JSX.Element {
  if (!node) return <></>;

  if (node.type === "paragraph") {
    return (
      <p key={key} className="mb-4">
        {node.children?.map((child: any, i: number) => renderNode(child, i))}
      </p>
    );
  }

  if (node.type === "heading") {
    const tag = node.tag || "h2";
    const HeadingTag = tag as keyof JSX.IntrinsicElements;
    const className =
      tag === "h1"
        ? "text-3xl font-bold mb-4"
        : tag === "h2"
          ? "text-2xl font-bold mb-3"
          : tag === "h3"
            ? "text-xl font-bold mb-2"
            : "text-lg font-bold mb-2";
    return (
      <HeadingTag key={key} className={className}>
        {node.children?.map((child: any, i: number) => renderNode(child, i))}
      </HeadingTag>
    );
  }

  if (node.type === "list") {
    const ListTag = node.listType === "number" ? "ol" : "ul";
    return (
      <ListTag
        key={key}
        className={
          node.listType === "number"
            ? "list-decimal ml-6 mb-4"
            : "list-disc ml-6 mb-4"
        }
      >
        {node.children?.map((child: any, i: number) => renderNode(child, i))}
      </ListTag>
    );
  }

  if (node.type === "listitem") {
    return (
      <li key={key} className="mb-1">
        {node.children?.map((child: any, i: number) => renderNode(child, i))}
      </li>
    );
  }

  if (node.type === "link" || node.type === "autolink") {
    return (
      <a
        key={key}
        href={node.url}
        className="text-blue-600 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {node.children?.map((child: any, i: number) => renderNode(child, i))}
      </a>
    );
  }

  if (node.type === "code") {
    return (
      <pre
        key={key}
        className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-4"
      >
        <code>
          {node.children?.map((child: any, i: number) => renderNode(child, i))}
        </code>
      </pre>
    );
  }

  if (node.type === "text" || node.text !== undefined) {
    const text = node.text || "";
    if (/<[a-z][\s\S]*>/i.test(text)) {
      return <span key={key} dangerouslySetInnerHTML={{ __html: text }} />;
    }
    if (node.format) {
      if (node.format & 8)
        return (
          <code key={key} className="bg-gray-100 px-1 rounded font-mono text-sm">
            {text}
          </code>
        );
      if ((node.format & 1) && (node.format & 2))
        return (
          <strong key={key}>
            <em>{text}</em>
          </strong>
        );
      if (node.format & 1) return <strong key={key}>{text}</strong>;
      if (node.format & 2) return <em key={key}>{text}</em>;
    }
    return <span key={key}>{text}</span>;
  }

  if (node.children && Array.isArray(node.children)) {
    return (
      <span key={key}>
        {node.children.map((child: any, i: number) => renderNode(child, i))}
      </span>
    );
  }

  return <></>;
}

interface Props {
  slug: string;
}

export default function ArticleDetailClient({ slug }: Props) {
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (slug) fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    try {
      const response = await api.get(`/articles/${slug}`);
      setArticle(response.data);
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
      `Are you sure you want to delete "${article.title}"? This action cannot be undone.`,
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
              <p className="text-xl text-gray-600 mb-4">
                {article.summaryTitle}
              </p>
            )}

            <div className="flex items-center text-sm text-gray-500 space-x-4">
              {article.author && <span>By {article.author.name}</span>}
              <span>
                Published on{" "}
                {new Date(article.createdAt).toLocaleDateString()}
              </span>
            </div>

            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {article.tags.map((tag, index) => {
                  const tagValue =
                    typeof tag === "string" ? tag : tag?.tag || "";
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

          {article.blocks && article.blocks.length > 0 && (
            <div className="mt-8 space-y-6">
              <BlockRenderer blocks={article.blocks} />
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
