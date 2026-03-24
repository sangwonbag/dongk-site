import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import './SidebarFilter.css';

const SidebarFilter = ({ categories, selectedCategory, selectedBrand, onSelect, className = '' }) => {
    const [openCategories, setOpenCategories] = useState(
        Object.keys(categories).reduce((acc, cat) => ({ ...acc, [cat]: true }), {})
    );

    const toggleCategory = (category) => {
        setOpenCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    return (
        <div className={`sidebar-filter ${className}`}>
            <div className="filter-header">
                <h3 className="filter-title">카테고리</h3>
                {(selectedCategory || selectedBrand) && (
                    <button
                        className="reset-button"
                        onClick={() => onSelect(null, null)}
                    >
                        전체 보기
                    </button>
                )}
            </div>

            <div className="filter-group-list">
                {Object.entries(categories).map(([category, brands]) => (
                    <div key={category} className="filter-group">
                        <div
                            className={`filter-group-header ${selectedCategory === category && !selectedBrand ? 'active' : ''}`}
                            onClick={() => {
                                toggleCategory(category);
                                onSelect(category, null);
                            }}
                        >
                            <span>{category}</span>
                            <button
                                className="toggle-icon-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleCategory(category);
                                }}
                            >
                                {openCategories[category] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                        </div>

                        {openCategories[category] && (
                            <ul className="brand-list">
                                {brands.map(brand => (
                                    <li
                                        key={brand}
                                        className={`brand-item ${selectedBrand === brand ? 'active' : ''}`}
                                        onClick={() => onSelect(category, brand)}
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

export default SidebarFilter;
