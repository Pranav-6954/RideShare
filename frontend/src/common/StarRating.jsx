import React, { useState } from 'react';

const StarRating = ({ rating, setRating, readOnly = false }) => {
    const [hover, setHover] = useState(0);

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {!readOnly && (
                <button
                    onClick={() => setRating(Math.max(1, rating - 1))}
                    style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: '1px solid var(--glass-border)',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        transition: 'all 0.2s ease',
                        opacity: (rating || 0) <= 1 ? 0.3 : 1
                    }}
                    disabled={(rating || 0) <= 1}
                >
                    −
                </button>
            )}

            <div style={{ display: 'flex', gap: '5px' }}>
                {[...Array(5)].map((star, index) => {
                    const ratingValue = index + 1;
                    return (
                        <label key={index} style={{ cursor: readOnly ? 'default' : 'pointer' }}>
                            {!readOnly && (
                                <input
                                    type="radio"
                                    name="rating"
                                    value={ratingValue}
                                    onClick={() => setRating(ratingValue)}
                                    style={{ display: 'none' }}
                                />
                            )}
                            <span
                                onMouseEnter={() => !readOnly && setHover(ratingValue)}
                                onMouseLeave={() => !readOnly && setHover(0)}
                                style={{
                                    color: ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9",
                                    fontSize: "1.8rem",
                                    filter: ratingValue <= (hover || rating) ? 'drop-shadow(0 0 8px rgba(255, 193, 7, 0.4))' : 'none',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                &#9733;
                            </span>
                        </label>
                    );
                })}
            </div>

            {!readOnly && (
                <button
                    onClick={() => setRating(Math.min(5, (rating || 0) + 1))}
                    style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: '1px solid var(--glass-border)',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        transition: 'all 0.2s ease',
                        opacity: (rating || 0) >= 5 ? 0.3 : 1
                    }}
                    disabled={(rating || 0) >= 5}
                >
                    +
                </button>
            )}
        </div>
    );
};

export default StarRating;
