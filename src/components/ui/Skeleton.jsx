import React from "react";
import "./Skeleton.css";

export default function Skeleton({ width = "100%", height = "20px", radius = "var(--radius-md)", className = "" }) {
  return (
    <div 
      className={`ui-skeleton-placeholder skeleton-shimmer-pulse ${className}`}
      style={{ width, height, borderRadius: radius }}
    />
  );
}
