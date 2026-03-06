"use client";

import React, { useState } from "react";
import { Download, Loader2, AlertCircle } from "lucide-react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

interface DownloadFile {
  title: string;
  description?: string;
  fileUrl: string;
  fileSize?: string;
  fileType: string;
  accessLevel: "public" | "members" | "premium";
}

interface DownloadsBlockProps {
  title: string;
  description?: string;
  files: DownloadFile[];
  trackAnalytics?: boolean;
}

export default function DownloadsBlock({
  title,
  description,
  files,
  trackAnalytics = true,
}: DownloadsBlockProps) {
  const [downloadStates, setDownloadStates] = useState<
    Record<number, "idle" | "loading" | "error">
  >({});

  const setFileState = (index: number, state: "idle" | "loading" | "error") =>
    setDownloadStates((prev) => ({ ...prev, [index]: state }));

  const handleDownload = async (
    e: React.MouseEvent<HTMLButtonElement>,
    file: DownloadFile,
    index: number
  ) => {
    e.preventDefault();
    if (downloadStates[index] === "loading") return;

    setFileState(index, "loading");

    if (trackAnalytics && typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "file_download", {
        file_name: file.title,
        file_type: file.fileType,
      });
    }

    try {
      // Route through server-side proxy to avoid CORS/cross-origin restrictions
      const proxyUrl = `http://localhost:3000/download-proxy?url=${encodeURIComponent(file.fileUrl)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message || `Server returned ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const urlFilename = file.fileUrl.split("/").pop()?.split("?")[0];
      link.download =
        urlFilename || `${file.title.replace(/\s+/g, "-")}.${file.fileType}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
      setFileState(index, "idle");
    } catch (err) {
      console.error("Download failed:", err);
      setFileState(index, "error");
      // Auto-reset error state after 4 s
      setTimeout(() => setFileState(index, "idle"), 4000);
    }
  };

  const getFileIcon = (fileType: string): string => {
    const iconMap: { [key: string]: string } = {
      pdf: "📄",
      docx: "📝",
      xlsx: "📊",
      pptx: "🎯",
      zip: "📦",
      image: "🖼️",
      other: "📎",
    };
    return iconMap[fileType] || "📎";
  };

  const getAccessBadge = (level: string) => {
    const badges: { [key: string]: string } = {
      public: "Public",
      members: "Members Only",
      premium: "Premium",
    };
    return badges[level] || "Public";
  };

  return (
    <section className="downloads-block">
      {title && <h2 className="downloads-title">{title}</h2>}
      {description && <p className="downloads-description">{description}</p>}
      <div className="downloads-container">
        {files.map((file, index) => {
          const state = downloadStates[index] ?? "idle";
          return (
          <div key={index} className={`download-item access-${file.accessLevel}`}>
            <div className="download-item-header">
              <span className="download-icon">{getFileIcon(file.fileType)}</span>
              <div className="download-info">
                <h3 className="download-title">{file.title}</h3>
                {file.description && (
                  <p className="download-description">{file.description}</p>
                )}
              </div>
              <span className="download-access-badge">
                {getAccessBadge(file.accessLevel)}
              </span>
            </div>
            <div className="download-item-footer">
              {file.fileSize && (
                <span className="download-size">{file.fileSize}</span>
              )}
              {state === "error" && (
                <span className="flex items-center gap-1 text-red-500 text-sm">
                  <AlertCircle size={14} /> Download failed — check the file URL
                </span>
              )}
              <button
                type="button"
                disabled={state === "loading"}
                onClick={(e) => handleDownload(e, file, index)}
                aria-label={`Download ${file.title}`}
                className={`download-btn ${state === "error" ? "opacity-60" : ""}`}
              >
                {state === "loading" ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Download size={18} />
                )}
                {state === "loading" ? "Downloading…" : "Download"}
              </button>
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
}
