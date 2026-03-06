"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  title: string;
  description?: string;
  imageUrl: string;
  imageAlt: string;
  linkUrl?: string;
  ctaText?: string;
}

interface CarouselBlockProps {
  title: string;
  carouselType: "cardBox" | "image" | "profile" | "resource" | "content";
  slides: Slide[];
  autoplay?: boolean;
  autoplayInterval?: number;
  showNavigation?: boolean;
  showPagination?: boolean;
  slidesPerView?: number;
  gap?: number;
}

export default function CarouselBlock({
  title,
  carouselType,
  slides,
  autoplay = true,
  autoplayInterval = 5000,
  showNavigation = true,
  showPagination = true,
  slidesPerView = 3,
  gap = 20,
}: CarouselBlockProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(autoplay);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAutoplay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [isAutoplay, autoplayInterval, slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoplay(false);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoplay(false);
  };

  const scrollToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoplay(false);
  };

  const slideWidth = `calc((100% - ${gap * (slidesPerView - 1)}px) / ${slidesPerView})`;

  return (
    <section className="carousel-block">
      {title && <h2 className="carousel-title">{title}</h2>}

      <div
        className={`carousel-container carousel-${carouselType}`}
        ref={carouselRef}
        onMouseEnter={() => setIsAutoplay(false)}
        onMouseLeave={() => isAutoplay && setIsAutoplay(true)}
      >
        <div
          className="carousel-track"
          style={{
            transform: `translateX(-${currentSlide * (100 / slidesPerView + gap / (100 * slidesPerView / 100))}%)`,
          }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className="carousel-slide"
              style={{ width: slideWidth, marginRight: gap }}
            >
              <article className="slide-card">
                <figure className="slide-image-wrapper">
                  <img
                    src={slide.imageUrl}
                    alt={slide.imageAlt}
                    className="slide-image"
                    loading="lazy"
                  />
                </figure>
                <div className="slide-content">
                  <h3 className="slide-title">{slide.title}</h3>
                  {slide.description && (
                    <p className="slide-description">{slide.description}</p>
                  )}
                  {slide.linkUrl && slide.ctaText && (
                    <a href={slide.linkUrl} className="btn btn-sm btn-primary">
                      {slide.ctaText}
                    </a>
                  )}
                </div>
              </article>
            </div>
          ))}
        </div>

        {showNavigation && slides.length > 1 && (
          <>
            <button
              className="carousel-nav carousel-prev"
              onClick={handlePrev}
              aria-label="Previous slide"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              className="carousel-nav carousel-next"
              onClick={handleNext}
              aria-label="Next slide"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {showPagination && slides.length > 1 && (
        <div className="carousel-pagination">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`pagination-dot ${currentSlide === index ? "active" : ""}`}
              onClick={() => scrollToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={currentSlide === index}
            />
          ))}
        </div>
      )}
    </section>
  );
}
