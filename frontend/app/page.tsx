"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

interface Article {
  id: string;
  title: string;
  slug: string;
  summaryTitle?: string;
  featuredImage?: string;
  createdAt: string;
}

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch("http://localhost:3000/articles");
      if (!response.ok) throw new Error("Failed to fetch articles");
      const data = await response.json();
      setArticles(data.docs || []);
    } catch (err) {
      setError("Failed to load articles");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, article: Article) => {
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
      setArticles(articles.filter((a) => a.id !== article.id));
    } catch (err) {
      console.error("Failed to delete article", err);
      alert("Failed to delete article");
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

      {articles.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">
          No articles found. Create your first article!
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
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
                    onClick={(e) => handleDelete(e, article)}
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
  );
}
