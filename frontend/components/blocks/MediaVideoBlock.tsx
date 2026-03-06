"use client";

import React from "react";
import { Play } from "lucide-react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

interface MediaVideoBlockProps {
  title: string;
  description?: string;
  sourceType: "youtube" | "vimeo" | "selfHosted" | "embed";
  youtubeUrl?: string;
  vimeoUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  embedCode?: string;
  aspectRatio?: "16-9" | "4-3" | "1-1" | "9-16";
  autoplay?: boolean;
  controls?: boolean;
  trackAnalytics?: boolean;
}

export default function MediaVideoBlock({
  title,
  description,
  sourceType,
  youtubeUrl,
  vimeoUrl,
  videoUrl,
  thumbnailUrl,
  embedCode,
  aspectRatio = "16-9",
  autoplay = false,
  controls = true,
  trackAnalytics = true,
}: MediaVideoBlockProps) {
  const getEmbedUrl = (url: string | undefined, type: string): string => {
    if (!url) return "";
    if (type === "youtube") {
      const match = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
      );
      return match
        ? `https://www.youtube.com/embed/${match[1]}?autoplay=${autoplay ? 1 : 0}`
        : "";
    }
    if (type === "vimeo") {
      const match = url.match(/(?:vimeo\.com\/)(\d+)/);
      return match
        ? `https://player.vimeo.com/video/${match[1]}?autoplay=${autoplay ? 1 : 0}`
        : "";
    }
    return "";
  };

  const handleVideoPlay = () => {
    if (trackAnalytics && typeof window !== "undefined") {
      if (window.gtag) {
        window.gtag("event", "video_play", {
          video_title: title,
          video_source: sourceType,
        });
      }
    }
  };

  const aspectRatioMap: { [key: string]: string } = {
    "16-9": "56.25%",
    "4-3": "75%",
    "1-1": "100%",
    "9-16": "177.78%",
  };

  return (
    <section className="media-video-block">
      {title && <h2 className="video-title">{title}</h2>}
      {description && <p className="video-description">{description}</p>}

      <div
        className={`video-container aspect-${aspectRatio}`}
        style={{ paddingBottom: aspectRatioMap[aspectRatio] }}
        onPlay={handleVideoPlay}
      >
        {sourceType === "youtube" && (
          <iframe
            className="video-iframe"
            src={getEmbedUrl(youtubeUrl, "youtube")}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title={title}
          />
        )}

        {sourceType === "vimeo" && (
          <iframe
            className="video-iframe"
            src={getEmbedUrl(vimeoUrl, "vimeo")}
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
            title={title}
          />
        )}

        {sourceType === "selfHosted" && (
          <video
            className="video-player"
            controls={controls}
            autoPlay={autoplay}
            poster={thumbnailUrl}
            onPlay={handleVideoPlay}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}

        {sourceType === "embed" && embedCode && (
          <div
            className="video-embed"
            dangerouslySetInnerHTML={{ __html: embedCode }}
          />
        )}
      </div>
    </section>
  );
}
