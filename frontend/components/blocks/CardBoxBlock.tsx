"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

interface Card {
  cardTitle: string;
  description: string;
  imageUrl?: string;
  imageAlt?: string;
  cta?: {
    text: string;
    url: string;
    style: "primary" | "secondary" | "tertiary";
  };
}

interface CardBoxBlockProps {
  title: string;
  cards: Card[];
  columnsDesktop?: number;
  columnsMobile?: number;
  cardHeight?: "auto" | "small" | "medium" | "large";
}

export default function CardBoxBlock({
  title,
  cards,
  columnsDesktop = 3,
  columnsMobile = 1,
  cardHeight = "auto",
}: CardBoxBlockProps) {
  const heightMap: { [key: string]: string } = {
    auto: "auto",
    small: "300px",
    medium: "400px",
    large: "500px",
  };

  return (
    <section className="card-box-block">
      {title && <h2 className="card-box-title">{title}</h2>}
      <div
        className="card-grid"
        style={
          {
            "--columns-desktop": columnsDesktop,
            "--columns-mobile": columnsMobile,
          } as React.CSSProperties
        }
      >
        {cards.map((card, index) => (
          <article
            key={index}
            className={`card-item ${card.imageUrl ? "with-image" : "text-only"}`}
            style={{ minHeight: heightMap[cardHeight] }}
          >
            {card.imageUrl && (
              <div className="card-image-wrapper">
                <img
                  src={card.imageUrl}
                  alt={card.imageAlt || card.cardTitle}
                  className="card-image"
                  loading="lazy"
                />
              </div>
            )}
            <div className="card-content">
              <h3 className="card-title">{card.cardTitle}</h3>
              <p className="card-description">{card.description}</p>
              {card.cta && (
                <a
                  href={card.cta.url}
                  className={`card-cta btn btn-${card.cta.style}`}
                >
                  {card.cta.text}
                  <ArrowRight size={16} className="cta-icon" />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
