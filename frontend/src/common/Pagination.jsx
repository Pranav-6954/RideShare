import React from 'react';

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <div className="flex justify-center items-center gap-2 mt-6 animate-slide-up">
            <button
                className="btn btn-outline"
                style={{ padding: '0.4rem 0.8rem', minWidth: 'auto' }}
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                Prev
            </button>

            {pages.map(page => (
                <button
                    key={page}
                    className={`btn ${currentPage === page ? 'btn-primary' : 'btn-outline'}`}
                    style={{
                        padding: '0.4rem 0.8rem',
                        minWidth: '35px',
                        background: currentPage === page ? 'var(--primary)' : 'transparent',
                        borderColor: currentPage === page ? 'var(--primary)' : 'var(--border)'
                    }}
                    onClick={() => onPageChange(page)}
                >
                    {page}
                </button>
            ))}

            <button
                className="btn btn-outline"
                style={{ padding: '0.4rem 0.8rem', minWidth: 'auto' }}
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
