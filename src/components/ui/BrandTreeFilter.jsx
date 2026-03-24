import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { BRAND_TREE } from '../../data/materials.db';
import './BrandTreeFilter.css';

const BrandTreeFilter = ({ selectedCategory, selectedSubCategory, onSelect, className = '' }) => {
    // Initialize open state for all categories by default to visualize the tree immediately
    const [openCategories, setOpenCategories] = useState(
        BRAND_TREE.reduce((acc, section) => ({ ...acc, [section.category]: true }), {})
    );

    const toggleCategory = (category) => {
        setOpenCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const handleReset = () => {
        onSelect(null, null);
    };

    // Helper to check if a specific sub-item is active
    const isItemActive = (cat, sub) => {
        return selectedCategory === cat && selectedSubCategory === sub;
    };

    return (
        <div className={`brand-tree-filter ${className}`}>
            <div className="bt-header">
                <h3 className="bt-title">브랜드</h3>
                {(selectedCategory || selectedSubCategory) && (
                    <button className="bt-reset-btn" onClick={handleReset}>
                        초기화
                    </button>
                )}
            </div>

            <div className="bt-list">
                {BRAND_TREE.map((section) => (
                    <div key={section.category} className="bt-section">
                        <div
                            className="bt-section-header"
                            onClick={() => toggleCategory(section.category)}
                        >
                            <span className={`bt-cat-name ${selectedCategory === section.category && !selectedSubCategory ? 'active' : ''}`}>
                                {section.category}
                            </span>
                            <button
                                className="bt-toggle-icon"
                            >
                                {openCategories[section.category] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                        </div>

                        {openCategories[section.category] && (
                            <ul className="bt-sub-list">
                                {section.brands.map(brand => (
                                    <li
                                        key={brand}
                                        className={`bt-sub-item ${isItemActive(section.category, brand) ? 'active' : ''}`}
                                        onClick={() => onSelect(section.category, brand)}
                                    >
                                        {brand}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BrandTreeFilter;
