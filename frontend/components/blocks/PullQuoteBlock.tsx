"use client";

import React from "react";
import { Star } from "lucide-react";

interface PullQuoteBlockProps {
  quote: string;
  author: string;
  authorTitle?: string;
  authorImage?: string;
  authorImageAlt?: string;
  quoteType?: "testimonial" | "successStory" | "endorsement" | "quote";
  backgroundColor?: "light" | "primary" | "secondary" | "gradient";
  textAlignment?: "left" | "center" | "right";
  rating?: number;
}

export default function PullQuoteBlock({
  quote,
  author,
  authorTitle,
  authorImage,
  authorImageAlt,
  quoteType = "testimonial",
  backgroundColor = "light",
  textAlignment = "center",
  rating,
}: PullQuoteBlockProps) {
  return (
    <section
      className={`pull-quote-block bg-${backgroundColor} text-${textAlignment}`}
    >
      <div className="pull-quote-container">
        <blockquote className="pull-quote-text">
          <p className="quote-mark">"</p>
          <p className="quote-content">{quote}</p>
        </blockquote>

        <div className="quote-attribution">
          {authorImage && (
            <figure className="author-image-wrapper">
              <img
                src={authorImage}
                alt={authorImageAlt || author}
                className="author-image"
                loading="lazy"
              />
            </figure>
          )}

          <div className="author-info">
            <p className="author-name">{author}</p>
            {authorTitle && (
              <p className="author-title">{authorTitle}</p>
            )}
            {rating && (
              <div className="quote-rating">
                {[...Array(Math.floor(rating))].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="star filled"
                    fill="currentColor"
                  />
                ))}
                {rating % 1 !== 0 && (
                  <Star
                    size={16}
                    className="star half"
                    fill="currentColor"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <span className="quote-type-badge">{quoteType}</span>
      </div>
    </section>
  );
}
