import React, { useState, useEffect } from "react";
import { X, RotateCcw, Check } from "lucide-react";
import { formatShapeOrPattern } from "../../utils/brandUtils";
import { DONGSHIN_MAJOR_CATEGORIES } from "../../utils/dongshinUtils";
import { SORT_OPTIONS } from "../../utils/sortUtils";
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
  activeDongshinMajor,
  onDongshinMajorChange,
  visibleDongshinDetails,
  activeDongshinDetail,
  onDongshinDetailChange,
  nameFilter,
  setNameFilter,
  codeFilter,
  setCodeFilter,
  specFilter,
  setSpecFilter,
  sortOption = "default",
  onSortChange,
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
          {/* Sort Selection */}
          <div className="filter-sheet-group">
            <label className="sheet-label">정렬 기준</label>
            <div className="sheet-chips-grid">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`sheet-chip ${sortOption === opt.value ? "active" : ""}`}
                  onClick={() => onSortChange && onSortChange(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

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



          {/* Dongshin 2-Tier Lineup Filter */}
          {activeTab === "데코타일" && (activeBrand === "동신" || activeBrand === "동신포리마") && (
            <>
              <div className="filter-sheet-group">
                <label className="sheet-label">대분류</label>
                <div className="sheet-chips-grid">
                  {DONGSHIN_MAJOR_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      className={`sheet-chip ${activeDongshinMajor === cat ? "active" : ""}`}
                      onClick={() => onDongshinMajorChange && onDongshinMajorChange(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {visibleDongshinDetails && visibleDongshinDetails.length > 0 && (
                <div className="filter-sheet-group">
                  <label className="sheet-label">세부 라인업</label>
                  <div className="sheet-chips-grid">
                    {visibleDongshinDetails.map((det) => (
                      <button
                        key={det}
                        className={`sheet-chip ${activeDongshinDetail === det ? "active" : ""}`}
                        onClick={() => onDongshinDetailChange && onDongshinDetailChange(det)}
                      >
                        {det}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Lineup (Non-Dongshin) */}
          {!(activeTab === "데코타일" && (activeBrand === "동신" || activeBrand === "동신포리마")) && visibleLines && visibleLines.length > 2 && (
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

          {/* Shape (for KCC Decotile) */}
          {activeTab === "데코타일" && activeBrand === "KCC" && visibleShapes && visibleShapes.length > 1 && (
            <div className="filter-sheet-group">
              <label className="sheet-label">형태 선택</label>
              <div className="sheet-chips-grid">
                {visibleShapes.map((s) => (
                  <button
                    key={s}
                    className={`sheet-chip ${activeShape === s ? "active" : ""}`}
                    onClick={() => onShapeChange && onShapeChange(s)}
                  >
                    {s === "all" ? "전체 형태" : s}
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
