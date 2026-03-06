"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

interface CTASectionBlockProps {
  title: string;
  description?: string;
  primaryCta: {
    text: string;
    url: string;
    openInNewTab?: boolean;
  };
  secondaryCta?: {
    text: string;
    url: string;
    openInNewTab?: boolean;
  };
  backgroundStyle?: "primary" | "secondary" | "light" | "dark" | "gradient";
  textAlignment?: "left" | "center" | "right";
}

export default function CTASectionBlock({
  title,
  description,
  primaryCta,
  secondaryCta,
  backgroundStyle = "primary",
  textAlignment = "center",
}: CTASectionBlockProps) {
  return (
    <section
      className={`cta-section cta-${backgroundStyle} text-${textAlignment}`}
    >
      <div className="cta-container">
        {title && <h2 className="cta-title">{title}</h2>}
        {description && (
          <div
            className="cta-description"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
        <div className="cta-buttons">
          <a
            href={primaryCta.url}
            target={primaryCta.openInNewTab ? "_blank" : "_self"}
            rel={primaryCta.openInNewTab ? "noopener noreferrer" : ""}
            className="btn btn-primary btn-lg"
          >
            {primaryCta.text}
            <ArrowRight size={18} className="btn-icon" />
          </a>
          {secondaryCta && (
            <a
              href={secondaryCta.url}
              target={secondaryCta.openInNewTab ? "_blank" : "_self"}
              rel={secondaryCta.openInNewTab ? "noopener noreferrer" : ""}
              className="btn btn-secondary btn-lg"
            >
              {secondaryCta.text}
              <ArrowRight size={18} className="btn-icon" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
