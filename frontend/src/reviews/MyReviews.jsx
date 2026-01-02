import React, { useEffect, useState } from "react";
import { apiFetch, verifyJWT, getToken } from "../utils/jwt";
import Pagination from "../common/Pagination";

const MyReviews = () => {
    const [activeTab, setActiveTab] = useState('received'); // 'received' | 'given'
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const token = getToken();
    const user = verifyJWT(token);

    const fetchReviews = () => {
        if (!user) return;
        setLoading(true);
        const endpoint = activeTab === 'received'
            ? `/api/reviews/user/${user.email}`
            : `/api/reviews/user/${user.email}/given`;

        apiFetch(endpoint)
            .then(data => {
                // Sort by date descending
                const sorted = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setReviews(sorted);
            })
            .catch(() => setReviews([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        setCurrentPage(1);
        fetchReviews();
    }, [user?.email, activeTab]);

    const paginatedReviews = reviews.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const starBreakdown = [5, 4, 3, 2, 1].map(s => {
        const count = reviews.filter(r => r.rating === s).length;
        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
        return { stars: s, count, percentage };
    });

    const average = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

    return (
        <div className="container" style={{ paddingBottom: '5rem' }}>
            <div className="animate-slide-up" style={{ marginBottom: '2rem' }}>
                <h1 style={{ marginBottom: '0.5rem' }}>Your Reputation</h1>
                <p style={{ color: 'var(--text-muted)' }}>Track feedback you've received and given</p>
            </div>

            {/* Tabs */}
            <div className="tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
                <button
                    className={`btn ${activeTab === 'received' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}
                    onClick={() => setActiveTab('received')}
                >
                    Reviews About Me
                </button>
                <button
                    className={`btn ${activeTab === 'given' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}
                    onClick={() => setActiveTab('given')}
                >
                    My Posted Reviews
                </button>
            </div>

            {loading ? (
                <div style={{ padding: '4rem', textAlign: 'center' }}>Loading reviews...</div>
            ) : (
                <>
                    {/* Active Tab Content */}
                    {reviews.length > 0 && (
                        <div className="card glass animate-slide-up" style={{ marginBottom: '3rem', padding: '2.5rem' }}>
                            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', alignItems: 'center' }}>
                                <div style={{ textAlign: 'center', borderRight: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{average}</div>
                                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', margin: '1rem 0' }}>
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <span key={s} style={{ color: s <= Math.round(parseFloat(average)) ? '#fbbf24' : '#d1d5db', fontSize: '1.5rem' }}>★</span>
                                        ))}
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{reviews.length} {activeTab === 'received' ? 'received' : 'given'}</div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {starBreakdown.map(b => (
                                        <div key={b.stars} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ minWidth: '60px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>{b.stars} Stars</div>
                                            <div style={{ flex: 1, height: '8px', background: 'var(--neutral-100)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${b.percentage}%`, background: 'var(--primary)', borderRadius: '4px' }}></div>
                                            </div>
                                            <div style={{ minWidth: '30px', fontSize: '0.85rem', textAlign: 'right', fontWeight: 700 }}>{b.count}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {reviews.length === 0 ? (
                        <div className="card glass animate-slide-up" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                            <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem', opacity: 0.5 }}>
                                {activeTab === 'received' ? '⭐' : '✍️'}
                            </div>
                            <h3>{activeTab === 'received' ? "No reviews yet" : "No reviews given"}</h3>
                            <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0.5rem auto 0 auto' }}>
                                {activeTab === 'received'
                                    ? "Ratings will appear here once you complete rides and other users share their experience."
                                    : "You haven't reviewed anyone yet. Complete a ride to rate your driver or passenger."}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                                {paginatedReviews.map((r, idx) => (
                                    <div key={r.id} className="card glass animate-slide-up" style={{ padding: '2rem', animationDelay: `${idx * 0.1}s`, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <span key={s} style={{ color: s <= r.rating ? '#fbbf24' : '#d1d5db', fontSize: '1.2rem' }}>★</span>
                                                ))}
                                            </div>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                {new Date(r.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontStyle: 'italic', color: 'var(--text-main)', lineHeight: '1.6', fontSize: '1.1rem' }}>
                                                "{r.comment || "No detailed feedback provided."}"
                                            </p>
                                        </div>

                                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>
                                                {activeTab === 'received'
                                                    ? r.reviewerEmail?.charAt(0).toUpperCase()
                                                    : r.revieweeEmail?.charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                {activeTab === 'received' ? (
                                                    <>By <strong>{r.reviewerEmail}</strong></>
                                                ) : (
                                                    <>To <strong>{r.revieweeEmail}</strong></>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Pagination
                                currentPage={currentPage}
                                totalItems={reviews.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                            />
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default MyReviews;
