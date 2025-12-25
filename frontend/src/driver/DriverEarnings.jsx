import React, { useEffect, useState } from "react";
import { apiFetch } from "../utils/jwt";

const DriverEarnings = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        apiFetch("/api/payment/driver-history")
            .then(data => {
                setPayments(data);
                setLoading(false);
            })
            .catch(() => {
                setPayments([]);
                setLoading(false);
            });
    }, []);

    const totalBalance = payments
        .filter(p => p.status === "CONFIRMED")
        .reduce((acc, current) => acc + current.amount, 0);

    const formatTime = (iso) => {
        if (!iso) return "-";
        return new Date(iso).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="container py-20 text-center">
                <div className="spinner mb-4 mx-auto"></div>
                <p className="text-muted">Calculating your earnings...</p>
            </div>
        );
    }

    return (
        <div className="container">
            <header className="mb-10">
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    My Earnings
                </h1>
                <p className="text-muted">Track your revenue and payment history</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="glass-card" style={{ background: 'var(--primary-glow)', border: '1px solid var(--primary)' }}>
                    <div className="text-xs text-muted uppercase font-bold letter-spacing-1 mb-2">Total Balance</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>₹{totalBalance.toFixed(2)}</div>
                    <div className="text-sm text-muted mt-2">Available for payout</div>
                </div>
                <div className="glass-card">
                    <div className="text-xs text-muted uppercase font-bold letter-spacing-1 mb-2">Completed Transactions</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{payments.filter(p => p.status === "CONFIRMED").length}</div>
                    <div className="text-sm text-muted mt-2">Successful payments</div>
                </div>
                <div className="glass-card">
                    <div className="text-xs text-muted uppercase font-bold letter-spacing-1 mb-2">Pending Payments</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--warning)' }}>{payments.filter(p => p.status === "PENDING").length}</div>
                    <div className="text-sm text-muted mt-2">Awaiting passenger action</div>
                </div>
            </div>

            <h3 className="mb-6">Transaction History</h3>
            {payments.length === 0 ? (
                <div className="glass-card text-center py-20">
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>💸</div>
                    <h4>No transactions found</h4>
                    <p className="text-muted">Your earnings will appear here once passengers start booking and paying for your rides.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4">
                        {payments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((p, idx) => (
                            <div key={p.id} className="glass-card slide-up hover-trigger" style={{ animationDelay: `${idx * 0.05}s`, padding: '1.25rem' }}>
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: p.status === 'CONFIRMED' ? 'var(--success-glow)' : 'var(--warning-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                            {p.status === 'CONFIRMED' ? '💰' : '⏳'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>Payment from {p.userEmail}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {formatTime(p.createdAt)} • Ref: #BK-{p.bookingId}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div style={{ fontWeight: 800, fontSize: '1.2rem', color: p.status === 'CONFIRMED' ? 'var(--success)' : 'inherit' }}>
                                            +₹{p.amount.toFixed(2)}
                                        </div>
                                        <span className={`badge ${p.status === 'CONFIRMED' ? 'success' : 'warning'}`} style={{ fontSize: '0.65rem' }}>
                                            {p.status}
                                        </span>
                                    </div>
                                </div>
                                {p.stripePaymentIntentId && (
                                    <div className="mt-3 pt-3 border-t flex justify-between items-center" style={{ borderColor: 'var(--glass-border)', fontSize: '0.7rem' }}>
                                        <span className="text-muted">Payment Provider: <span style={{ fontWeight: 700 }}>Stripe</span></span>
                                        <span className="text-muted">ID: {p.stripePaymentIntentId}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {/* Pagination Controls */}
                    {payments.length > itemsPerPage && (
                        <div className="flex justify-center items-center mt-12 gap-4">
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                    setCurrentPage(p => Math.max(1, p - 1));
                                    window.scrollTo({ top: 300, behavior: 'smooth' });
                                }}
                                disabled={currentPage === 1}
                            >
                                &larr; Previous
                            </button>
                            <div className="text-sm font-bold opacity-60">
                                Page {currentPage} of {Math.ceil(payments.length / itemsPerPage)}
                            </div>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                    setCurrentPage(p => Math.min(Math.ceil(payments.length / itemsPerPage), p + 1));
                                    window.scrollTo({ top: 300, behavior: 'smooth' });
                                }}
                                disabled={currentPage === Math.ceil(payments.length / itemsPerPage)}
                            >
                                Next &rarr;
                            </button>
                        </div>
                    )}
                </>
            )}

            <style>{`
                .hover-trigger:hover {
                    border-color: var(--primary) !important;
                    transform: translateX(4px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }
                .letter-spacing-1 { letter-spacing: 1px; }
            `}</style>
        </div>
    );
};

export default DriverEarnings;
