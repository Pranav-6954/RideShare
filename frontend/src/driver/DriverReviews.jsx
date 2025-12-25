import React, { useState, useEffect } from "react";
import { apiFetch, verifyJWT } from "../utils/jwt";
import StarRating from "../common/StarRating";

const DriverReviews = () => {
    const token = localStorage.getItem("token");
    const user = verifyJWT(token);

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ average: 0, total: 0 });

    const fetchReviews = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await apiFetch(`/api/reviews/user/${user.email}`);
            setReviews(data);

            if (data.length > 0) {
                const total = data.length;
                const sum = data.reduce((acc, r) => acc + r.rating, 0);
                setStats({
                    average: (sum / total).toFixed(1),
                    total: total
                });
            }
        } catch (err) {
            console.error("Failed to fetch reviews", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    return (
        <div className="container">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Ratings & Reviews
                    </h1>
                    <p className="text-muted">Here's what your passengers have to say about you</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-12">
                <div className="glass-card text-center" style={{ padding: '2rem' }}>
                    <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
                        {stats.average}
                    </div>
                    <div style={{ margin: '0.75rem 0' }}>
                        <StarRating rating={Math.round(stats.average)} readOnly={true} />
                    </div>
                    <div className="text-muted font-bold">Average Rating</div>
                </div>

                <div className="glass-card text-center" style={{ padding: '2rem' }}>
                    <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
                        {stats.total}
                    </div>
                    <div style={{ margin: '0.75rem 0', display: 'flex', justifyContent: 'center' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    </div>
                    <div className="text-muted font-bold">Total Reviews</div>
                </div>

                <div className="glass-card text-center" style={{ padding: '2rem' }}>
                    <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--success)', lineHeight: 1 }}>
                        {reviews.filter(r => r.rating >= 4).length}
                    </div>
                    <div style={{ margin: '0.75rem 0', display: 'flex', justifyContent: 'center' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                    </div>
                    <div className="text-muted font-bold">Happy Passengers</div>
                </div>
            </div>

            <div className="glass-card">
                <h3 className="mb-8">All Reviews</h3>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="spinner"></div>
                        <p className="mt-4 text-muted">Loading your reviews...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-12">
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                        <h4>No reviews yet</h4>
                        <p className="text-muted">Complete more rides to earn ratings!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(r => (
                            <div key={r.id} className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                                            {r.reviewerEmail.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>{r.reviewerEmail}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <StarRating rating={r.rating} readOnly={true} />
                                </div>
                                <p style={{ lineHeight: 1.6, color: 'var(--text-main)', fontStyle: 'italic', margin: 0 }}>
                                    "{r.comment || "No comment provided."}"
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DriverReviews;
