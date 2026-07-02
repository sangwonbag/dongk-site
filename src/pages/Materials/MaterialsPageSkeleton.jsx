import React from "react";
import MainLayout from "../../components/layout/MainLayout";
import "./MaterialsPageSkeleton.css";

export default function MaterialsPageSkeleton() {
  // Generate 8 card placeholders
  const skeletonCards = Array.from({ length: 8 });

  return (
    <MainLayout>
      <div className="materials-container container skeleton-pulse-active">
        <main className="materials-content full">
          {/* 1. Header Title & Description Skeleton */}
          <div className="materials-header-skeleton">
            <div className="skeleton-title skeleton-shimmer" />
            <div className="skeleton-desc skeleton-shimmer" />
          </div>

          {/* 2. Search Bar Skeleton */}
          <div className="materials-search-skeleton">
            <div className="skeleton-search-input skeleton-shimmer" />
          </div>

          {/* 3. Category & Brand Filter Tabs Skeleton */}
          <div className="material-filter-skeleton-section">
            <div className="skeleton-row">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-chip skeleton-shimmer" />
              ))}
            </div>
            <div className="skeleton-row brand-row">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton-chip brand skeleton-shimmer" />
              ))}
            </div>
          </div>

          {/* 4. Results Header Skeleton */}
          <div className="results-header-skeleton">
            <div className="skeleton-text-short skeleton-shimmer" />
          </div>

          {/* 5. Products Grid Skeleton */}
          <div className="materials-grid">
            {skeletonCards.map((_, idx) => (
              <div key={idx} className="material-card-skeleton">
                <div className="card-thumb-skeleton skeleton-shimmer" />
                <div className="card-info-skeleton">
                  <div className="skeleton-line-meta skeleton-shimmer" />
                  <div className="skeleton-line-title skeleton-shimmer" />
                  <div className="skeleton-line-spec skeleton-shimmer" />
                  <div className="skeleton-line-price skeleton-shimmer" />
                  <div className="skeleton-buttons">
                    <div className="skeleton-button skeleton-shimmer" />
                    <div className="skeleton-button skeleton-shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
