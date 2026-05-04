import { getAutoMatchedCover } from '../../utils/samplebookResolver';
import { getComputedBrand } from '../../utils/brandUtils';
import './SampleBookCard.css';

const SampleBookCard = ({ book, onClick }) => {
    const autoCover = getAutoMatchedCover(book);
    const coverSrc = book.cover || autoCover;

    return (
        <div className="sb-card" onClick={() => onClick(book)}>
            <div className="sb-card-cover">
                {coverSrc ? (
                    <img
                        src={coverSrc}
                        alt={book.title}
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
                    <span>{getComputedBrand(book)}</span>
                </div>

                {book.isNew && <div className="sb-badge-new">NEW</div>}
            </div>
            <div className="sb-card-info">
                <div className="sb-brand-tag">{getComputedBrand(book)}</div>
                <div className="sb-card-title">{book.title}</div>
                <div className="sb-card-desc">{book.description}</div>
            </div>
        </div>
    );
};

export default SampleBookCard;
