"use client";

import React from "react";

interface Logo {
  logoUrl: string;
  altText: string;
  companyName: string;
  linkUrl?: string;
  openInNewTab?: boolean;
}

interface LogoWallBlockProps {
  title: string;
  description?: string;
  logos: Logo[];
  maxLogoHeight?: "60" | "80" | "100" | "120";
  columnsDesktop?: number;
  columnsMobile?: number;
  alignmentStyle?: "grid" | "center" | "spaced";
}

export default function LogoWallBlock({
  title,
  description,
  logos,
  maxLogoHeight = "80",
  columnsDesktop = 4,
  columnsMobile = 2,
  alignmentStyle = "grid",
}: LogoWallBlockProps) {
  const heightMap: { [key: string]: number } = {
    "60": 60,
    "80": 80,
    "100": 100,
    "120": 120,
  };

  return (
    <section className="logo-wall-block">
      {title && <h2 className="logo-wall-title">{title}</h2>}
      {description && <p className="logo-wall-description">{description}</p>}

      <div
        className={`logo-grid logo-alignment-${alignmentStyle}`}
        style={
          {
            "--columns-desktop": columnsDesktop,
            "--columns-mobile": columnsMobile,
            "--max-logo-height": `${heightMap[maxLogoHeight]}px`,
          } as React.CSSProperties
        }
      >
        {logos.map((logo, index) => {
          const LogoElement = (
            <figure key={index} className="logo-item">
              <img
                src={logo.logoUrl}
                alt={logo.altText}
                className="logo-image"
                loading="lazy"
                style={{ maxHeight: `${heightMap[maxLogoHeight]}px` }}
              />
              <figcaption className="sr-only">{logo.companyName}</figcaption>
            </figure>
          );

          if (logo.linkUrl) {
            return (
              <a
                key={index}
                href={logo.linkUrl}
                target={logo.openInNewTab ? "_blank" : "_self"}
                rel={logo.openInNewTab ? "noopener noreferrer" : ""}
                className="logo-link"
                title={logo.companyName}
              >
                {LogoElement}
              </a>
            );
          }

          return LogoElement;
        })}
      </div>
    </section>
  );
}
