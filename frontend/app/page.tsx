"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCms } from "@/contexts/CmsContext";
import api from "@/lib/api";

interface Article {
  id: string;
  title: string;
  slug: string;
  summaryTitle?: string;
  featuredImage?: string;
  createdAt: string;
  status?: "draft" | "published";
}

export default function HomePage() {
  const [publishedArticles, setPublishedArticles] = useState<Article[]>([]);
  const [draftArticles, setDraftArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated, token } = useAuth();
  const { cms } = useCms();

  useEffect(() => {
    fetchArticles();
  }, [isAuthenticated, cms]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      // Always fetch published articles (public) - using api instance to include CMS parameter
      const publishedResponse = await api.get("/articles");
      setPublishedArticles(publishedResponse.data.docs || []);

      // If authenticated, also fetch draft articles
      if (isAuthenticated && token) {
        try {
          const draftResponse = await api.get("/admin/articles?status=draft", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setDraftArticles(draftResponse.data.docs || []);
        } catch (err) {
          console.error("Failed to fetch drafts", err);
          setDraftArticles([]);
        }
      } else {
        setDraftArticles([]);
      }
    } catch (err) {
      setError("Failed to load articles");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (
    e: React.MouseEvent,
    article: Article,
    isDraft: boolean = false
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const confirmed = window.confirm(
      `Are you sure you want to delete "${article.title}"?`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/admin/articles/${article.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (isDraft) {
        setDraftArticles(draftArticles.filter((a) => a.id !== article.id));
      } else {
        setPublishedArticles(
          publishedArticles.filter((a) => a.id !== article.id)
        );
      }
    } catch (err) {
      console.error("Failed to delete article", err);
      alert("Failed to delete article");
    }
  };

  const handlePublish = async (article: Article) => {
    try {
      await api.put(`/admin/articles/${article.id}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Move from drafts to published
      setDraftArticles(draftArticles.filter((a) => a.id !== article.id));
      setPublishedArticles([article, ...publishedArticles]);
    } catch (err) {
      console.error("Failed to publish article", err);
      alert("Failed to publish article");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading articles...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Content Management System
        </h1>
        <p className="text-xl text-gray-600">
          Browse articles or create your own content
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
          {error}
        </div>
      )}

      {/* Draft Articles Section - Only for Authenticated Users */}
      {isAuthenticated && draftArticles.length > 0 && (
        <div className="mb-12">
          <div className="mb-6 pb-4 border-b-2 border-yellow-300">
            <h2 className="text-2xl font-bold text-gray-900">
              📝 My Drafts ({draftArticles.length})
            </h2>
            <p className="text-gray-600 mt-1">Only visible to you</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {draftArticles.map((article) => (
              <div
                key={article.id}
                className="bg-yellow-50 border-2 border-yellow-200 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden relative"
              >
                <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                  DRAFT
                </div>
                <Link href={`/articles/${article.slug}`}>
                  {article.featuredImage && (
                    <div className="w-full h-48 bg-gray-200 relative overflow-hidden">
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {article.title}
                    </h3>
                    {article.summaryTitle && (
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {article.summaryTitle}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      {new Date(article.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
                {isAuthenticated && (
                  <div className="px-6 pb-4 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handlePublish(article);
                      }}
                      className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 flex-1"
                    >
                      ✓ Publish
                    </button>
                    <Link
                      href={`/articles/${article.slug}/edit`}
                      className="bg-yellow-500 text-white px-3 py-1.5 rounded text-sm hover:bg-yellow-600"
                    >
                      ✏️ Edit
                    </Link>
                    <button
                      onClick={(e) => handleDelete(e, article, true)}
                      className="bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Published Articles Section */}
      <div>
        <div className="mb-6 pb-4 border-b-2 border-blue-300">
          <h2 className="text-2xl font-bold text-gray-900">
            📰 Published Articles {publishedArticles.length > 0 && `(${publishedArticles.length})`}
          </h2>
        </div>

        {publishedArticles.length === 0 ? (
          <div className="text-center text-gray-500 text-lg">
            No published articles yet. {isAuthenticated ? "Create one!" : "Sign in to create articles."}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {publishedArticles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden relative"
            >
              <Link href={`/articles/${article.slug}`}>
                {article.featuredImage && (
                  <div className="w-full h-48 bg-gray-200 relative overflow-hidden">
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {article.title}
                  </h3>
                  {article.summaryTitle && (
                    <p className="text-gray-600 mb-4 line-clamp-2">{article.summaryTitle}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
              {isAuthenticated && (
                <div className="px-6 pb-4 flex gap-2">
                  <Link
                    href={`/articles/${article.slug}/edit`}
                    className="bg-yellow-500 text-white px-3 py-1.5 rounded text-sm hover:bg-yellow-600"
                  >
                    ✏️ Edit
                  </Link>
                  <button
                    onClick={(e) => handleDelete(e, article, false)}
                    className="bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}
