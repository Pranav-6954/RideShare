import React, { useState } from "react";

const StarRating = ({ rating, setRating, readOnly = false }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="star-rating" style={{ display: 'flex', gap: '2px' }}>
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;

                return (
                    <span
                        key={index}
                        style={{
                            cursor: readOnly ? 'default' : 'pointer',
                            color: ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9",
                            fontSize: "1.5rem",
                            transition: "color 0.2s"
                        }}
                        onClick={() => !readOnly && setRating(ratingValue)}
                        onMouseEnter={() => !readOnly && setHover(ratingValue)}
                        onMouseLeave={() => !readOnly && setHover(0)}
                    >
                        ★
                    </span>
                );
            })}
        </div>
    );
};

export default StarRating;
