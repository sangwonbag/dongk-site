import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './NewsBannerSlider.css';

const NewsBannerSlider = ({ banners }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % banners.length);
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, banners.length]);

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
    };

    const goToPrev = () => {
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    if (!banners || banners.length === 0) return null;

    return (
        <div
            className="news-banner-slider"
            onMouseEnter={() => setIsPlaying(false)}
            onMouseLeave={() => setIsPlaying(true)}
        >
            <div
                className="slider-track"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {banners.map((banner) => (
                    <div
                        key={banner.id}
                        className={`slider-item ${banner.isDark ? 'dark-theme' : 'light-theme'}`}
                        style={{ backgroundImage: banner.image ? `url(${banner.image})` : undefined }}
                    >
                        <div className="slider-content">
                            <h2 className="slider-title">{banner.title}</h2>
                            <p className="slider-subtitle">{banner.subtitle}</p>
                            {banner.ctaLink && (
                                <Link to={banner.ctaLink} className="slider-button">
                                    {banner.ctaText}
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button className="slider-control prev" onClick={goToPrev} aria-label="Previous slide">
                <ChevronLeft size={32} />
            </button>
            <button className="slider-control next" onClick={goToNext} aria-label="Next slide">
                <ChevronRight size={32} />
            </button>

            <div className="slider-dots">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        className={`slider-dot ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default NewsBannerSlider;
