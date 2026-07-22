import React, { useState, useEffect } from "react";
import { X, RotateCcw, Check } from "lucide-react";
import "./MobileFilterSheet.css";

export default function MobileFilterSheet({
  isOpen,
  onClose,
  categories,
  activeTab,
  onCategoryChange,
  visibleBrands,
  activeBrand,
  onBrandChange,
  visibleThicknesses,
  activeThickness,
  onThicknessChange,
  visibleShapes,
  activeShape,
  onShapeChange,
  visibleLines,
  activeLine,
  onLineChange,
  nameFilter,
  setNameFilter,
  codeFilter,
  setCodeFilter,
  specFilter,
  setSpecFilter,
  totalCount,
  onResetFilters,
}) {
  if (!isOpen) return null;

  const handleReset = () => {
    onResetFilters();
  };

  return (
    <div className="mobile-filter-sheet-overlay" onClick={onClose}>
      <div className="mobile-filter-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mobile-filter-sheet-header">
          <h2>상세 필터</h2>
          <button className="sheet-close-btn" onClick={onClose} aria-label="닫기">
            <X size={22} />
          </button>
        </div>

        {/* Content Body */}
        <div className="mobile-filter-sheet-body">
          {/* Category */}
          <div className="filter-sheet-group">
            <label className="sheet-label">카테고리</label>
            <div className="sheet-chips-grid">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`sheet-chip ${activeTab === cat ? "active" : ""}`}
                  onClick={() => onCategoryChange(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Brand */}
          {visibleBrands && visibleBrands.length > 1 && (
            <div className="filter-sheet-group">
              <label className="sheet-label">브랜드</label>
              <div className="sheet-chips-grid">
                {visibleBrands.map((b) => (
                  <button
                    key={b}
                    className={`sheet-chip ${activeBrand === b ? "active" : ""}`}
                    onClick={() => onBrandChange(b)}
                  >
                    {b === "all" ? "전체 브랜드" : b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Thickness (for 장판) */}
          {activeTab === "장판" && visibleThicknesses && visibleThicknesses.length > 1 && (
            <div className="filter-sheet-group">
              <label className="sheet-label">두께 선택</label>
              <div className="sheet-chips-grid">
                {visibleThicknesses.map((t) => (
                  <button
                    key={t}
                    className={`sheet-chip ${activeThickness === t ? "active" : ""}`}
                    onClick={() => onThicknessChange(t)}
                  >
                    {t === "all" ? "전체 두께" : t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Shape (for KCC Decotile) */}
          {activeTab === "데코타일" && activeBrand === "KCC" && visibleShapes && visibleShapes.length > 1 && (
            <div className="filter-sheet-group">
              <label className="sheet-label">형태 분류</label>
              <div className="sheet-chips-grid">
                {visibleShapes.map((s) => (
                  <button
                    key={s}
                    className={`sheet-chip ${activeShape === s ? "active" : ""}`}
                    onClick={() => onShapeChange(s)}
                  >
                    {s === "all" ? "전체 형태" : s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lineup */}
          {visibleLines && visibleLines.length > 2 && (
            <div className="filter-sheet-group">
              <label className="sheet-label">라인업</label>
              <div className="sheet-chips-grid">
                {visibleLines.map((l) => (
                  <button
                    key={l}
                    className={`sheet-chip ${activeLine === l ? "active" : ""}`}
                    onClick={() => onLineChange(l)}
                  >
                    {l === "all" ? "전체 라인업" : l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Inputs */}
          <div className="filter-sheet-group">
            <label className="sheet-label">직접 검색 조건</label>
            <div className="sheet-inputs-stack">
              <input
                type="text"
                className="sheet-input"
                placeholder="제품명 검색 (예: 오크, 타일)"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
              />
              <input
                type="text"
                className="sheet-input"
                placeholder="상품코드 검색 (예: CM21882)"
                value={codeFilter}
                onChange={(e) => setCodeFilter(e.target.value)}
              />
              <input
                type="text"
                className="sheet-input"
                placeholder="규격/두께 검색 (예: 1.8T, 2.2mm)"
                value={specFilter}
                onChange={(e) => setSpecFilter(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Footer Fixed Actions */}
        <div className="mobile-filter-sheet-footer">
          <button className="btn-sheet-reset" onClick={handleReset}>
            <RotateCcw size={16} /> 초기화
          </button>
          <button className="btn-sheet-apply" onClick={onClose}>
            상품 {totalCount}개 보기
          </button>
        </div>
      </div>
    </div>
  );
}
