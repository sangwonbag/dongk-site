import React, { useState, useEffect } from "react";
import { newsSlides } from "../../data/news";
import "./HeroSlider.css";

export default function HeroSlider() {
    const [idx, setIdx] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIdx((prev) => (prev + 1) % newsSlides.length);
        }, 4000); // 4 seconds auto-play
        return () => clearInterval(timer);
    }, []);

    if (!newsSlides.length) return null;

    const cur = newsSlides[idx];

    return (
        <div className="hero-slider">
            <div className="slider-track">
                <div className="news-item" onClick={() => cur.link && window.location.assign(cur.link)}>
                    {cur.image && (
                        <img
                            className={cur.type === "banner" ? "news-thumb-banner" : "news-thumb-icon"}
                            src={cur.image}
                            alt={cur.title}
                        />
                    )}
                    <div className="news-copy">
                        <div className="news-title">{cur.title}</div>
                        <div className="news-text">
                            {cur.text.split(" / ").map((line, i) => (
                                <span key={i}>{line}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="slider-dots">
                {newsSlides.map((_, i) => (
                    <div
                        key={i}
                        className={`slider-dot ${i === idx ? "active" : ""}`}
                        onClick={() => setIdx(i)}
                    />
                ))}
            </div>
        </div>
    );
}
