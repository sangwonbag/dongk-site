import { getAutoMatchedCover, safeEncodeURI } from '../../utils/samplebookResolver';
import { getComputedBrand } from '../../utils/brandUtils';
import './SampleBookCard.css';

const SampleBookCard = ({ book, onClick }) => {
    const autoCover = getAutoMatchedCover(book);
    const rawCover = book.cover || autoCover;
    const coverSrc = rawCover ? safeEncodeURI(rawCover) : null;
    const brandName = getComputedBrand(book);

    return (
        <div className="sb-card" onClick={() => onClick(book)}>
            <div className="sb-card-cover">
                {coverSrc ? (
                    <img
                        src={coverSrc}
                        alt={book.title}
                        loading="lazy"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                            }
                        }}
                    />
                ) : null}

                <div
                    className="sb-cover-placeholder"
                    style={{ display: coverSrc ? 'none' : 'flex' }}
                >
                    <div className="sb-placeholder-content">
                        <span className="sb-placeholder-brand">{brandName}</span>
                        <span className="sb-placeholder-title">{book.title}</span>
                    </div>
                </div>

                <div className="sb-badges">
                    {book.isRecommended && <div className="sb-badge-rec">추천</div>}
                    {book.isNew && <div className="sb-badge-new">NEW</div>}
                </div>
            </div>
            <div className="sb-card-info">
                <div className="sb-brand-tag">{brandName}</div>
                <div className="sb-card-title">{book.title}</div>
                <div className="sb-card-desc">{book.description}</div>
                <div className="sb-card-footer">
                    <span className="sb-open-btn">
                        {book.pdf ? "PDF 열기 ↗" : "미리보기 ↗"}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SampleBookCard;

