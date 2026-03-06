"use client";

import React, { useState } from "react";

interface GalleryImage {
  imageUrl: string;
  altText: string;
  caption?: string;
  aspectRatio: string;
}

interface GalleryBlockProps {
  title: string;
  description?: string;
  images: GalleryImage[];
  layout: "grid-3" | "grid-4" | "masonry" | "carousel";
  enableLightbox?: boolean;
  columnsOnDesktop?: number;
  columnsOnMobile?: number;
}

export default function GalleryBlock({
  title,
  description,
  images,
  layout,
  enableLightbox = true,
  columnsOnDesktop = 3,
  columnsOnMobile = 1,
}: GalleryBlockProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handlePrevImage = () => {
    setLightboxIndex((prev) =>
      prev === null ? null : prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setLightboxIndex((prev) =>
      prev === null ? null : prev === images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <section className="gallery-block">
      {title && <h2 className="gallery-title">{title}</h2>}
      {description && <p className="gallery-description">{description}</p>}

      <div
        className={`gallery-container gallery-${layout}`}
        style={
          {
            "--columns-desktop": columnsOnDesktop,
            "--columns-mobile": columnsOnMobile,
          } as React.CSSProperties
        }
      >
        {images.map((image, index) => (
          <figure
            key={index}
            className={`gallery-item aspect-${image.aspectRatio}`}
            onClick={() => enableLightbox && setLightboxIndex(index)}
          >
            <img
              src={image.imageUrl}
              alt={image.altText}
              className="gallery-image"
              loading="lazy"
            />
            {image.caption && (
              <figcaption className="gallery-caption">
                {image.caption}
              </figcaption>
            )}
            {enableLightbox && (
              <div className="gallery-overlay">
                <span className="expand-icon">⛶</span>
              </div>
            )}
          </figure>
        ))}
      </div>

      {/* Lightbox Modal */}
      {enableLightbox && lightboxIndex !== null && (
        <div className="lightbox-modal" onClick={() => setLightboxIndex(null)}>
          <button
            className="lightbox-close"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close lightbox"
          >
            ✕
          </button>
          <button
            className="lightbox-nav lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevImage();
            }}
            aria-label="Previous image"
          >
            ‹
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[lightboxIndex].imageUrl}
              alt={images[lightboxIndex].altText}
              className="lightbox-image"
            />
          </div>
          <button
            className="lightbox-nav lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              handleNextImage();
            }}
            aria-label="Next image"
          >
            ›
          </button>
          <div className="lightbox-counter">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </section>
  );
}
