"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RichTextEditor from "@/components/RichTextEditor";

interface User {
  id: string;
  email: string;
  name: string;
}

export default function CreateArticlePage() {
  return (
    <ProtectedRoute>
      <CreateArticleForm />
    </ProtectedRoute>
  );
}

function CreateArticleForm() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    summaryTitle: "",
    content: "",
    featuredImage: "",
    tags: "",
    author: "",
    status: "published" as "draft" | "published",
    searchExclude: false,
    promoted: false,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/users");
        setUsers(response.data);
        // Auto-select current user if not already selected
        if (!formData.author && user?.id) {
          setFormData((prev) => ({ ...prev, author: user.id }));
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };

    fetchUsers();
  }, [user?.id]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, featuredImage: base64String });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert plain text to Lexical format
  const convertToLexical = (html: string) => {
    if (!html) {
      return {
        root: {
          type: "root",
          children: [],
        },
      };
    }

    // For now, we'll store the HTML as-is
    // In production, you'd want to properly parse HTML to Lexical format
    return {
      root: {
        type: "root",
        children: [
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: html,
              },
            ],
          },
        ],
      },
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      const articleData = {
        title: formData.title,
        slug: formData.slug,
        summaryTitle: formData.summaryTitle,
        content: convertToLexical(formData.content),
        featuredImage: formData.featuredImage,
        tags: tagsArray,
        status: formData.status,
        searchExclude: formData.searchExclude,
        promoted: formData.promoted,
      };

      await api.post("/admin/articles", articleData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      router.push("/");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to create article. Please try again."
      );
      console.error("Error details:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          ← Back to home
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Create New Article
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Slug *
            </label>
            <input
              type="text"
              id="slug"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />
            <p className="mt-1 text-sm text-gray-500">
              URL-friendly version of the title
            </p>
          </div>

          <div>
            <label
              htmlFor="featuredImage"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Featured Image
            </label>
            <input
              type="file"
              id="featuredImage"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {imagePreview && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-xs h-auto rounded-md shadow"
                />
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="summaryTitle"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Summary / Short Description
            </label>
            <textarea
              id="summaryTitle"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of the article"
              value={formData.summaryTitle}
              onChange={(e) =>
                setFormData({ ...formData, summaryTitle: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content * (Rich Text Editor)
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={(content) =>
                setFormData({ ...formData, content })
              }
              placeholder="Write your article content here..."
            />
          </div>

          <div>
            <label
              htmlFor="author"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Author
            </label>
            <select
              id="author"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.author}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
            >
              <option value="">Select an author</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="technology, web development, tutorial"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Status *
            </label>
            <select
              id="status"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as "draft" | "published",
                })
              }
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.searchExclude}
                  onChange={(e) =>
                    setFormData({ ...formData, searchExclude: e.target.checked })
                  }
                  className="rounded border-gray-300 mr-2"
                />
                <span className="text-sm text-gray-700">Exclude from search</span>
              </label>
            </div>
            <div className="flex-1">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.promoted}
                  onChange={(e) =>
                    setFormData({ ...formData, promoted: e.target.checked })
                  }
                  className="rounded border-gray-300 mr-2"
                />
                <span className="text-sm text-gray-700">Promote this article</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {loading ? "Creating..." : "Create Article"}
            </button>
            <Link
              href="/"
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
