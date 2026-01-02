import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { apiFetch } from "../utils/jwt";

import Pagination from "../common/Pagination";
import StarRating from "../common/StarRating";
import { useToast } from "../common/ToastContainer";

const DriverHistory = () => {
    const { showToast } = useToast();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    // Rating Modal State
    const [rateModalOpen, setRateModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    const itemsPerPage = 10;

    const fetchHistory = () => {
        setLoading(true);
        apiFetch("/api/bookings/driver")
            .then(data => {
                if (!Array.isArray(data)) {
                    console.error("Expected array but got:", data);
                    setBookings([]);
                    return;
                }
                // Show Completed, Paid, and Driver Completed (Waiting for Payment)
                // Filter out Cancelled/Rejected? Unless user wants to see them.
                // User asked for "Completed payment history", but also "Ride Completed".
                const history = data.filter(b =>
                    ["COMPLETED", "PAID", "DRIVER_COMPLETED", "CASH_PAYMENT_PENDING", "PAYMENT_PENDING"].includes(b.status)
                );

                // Sort by newest first
                history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setBookings(history);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const handleOpenRate = (booking) => {
        // DEBUG: Force alert to prove function call
        // window.alert("Opening Rate Modal for " + booking.userEmail);
        console.log("Opening rate modal for booking:", booking);
        setSelectedBooking(booking);
        setRating(5);
        setComment("");
        setRateModalOpen(true);
    };

    const handleSubmitRate = async () => {
        if (!selectedBooking) return;
        try {
            await apiFetch("/api/reviews", {
                method: "POST",
                body: JSON.stringify({
                    revieweeEmail: selectedBooking.userEmail,
                    bookingId: selectedBooking.id,
                    rating: parseInt(rating),
                    comment: comment
                })
            });
            showToast("Passenger rated successfully!", 'success');
            setRateModalOpen(false);
        } catch (err) {
            showToast("Failed to submit rating: " + err.message, 'error');
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const paginated = bookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (loading) return <div className="container p-10 text-center">Loading history...</div>;

    return (
        <div className="container mt-4 pb-20">
            <h1 style={{ marginBottom: '2rem' }}>Payment & Ride History</h1>

            <div className="card glass">
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ margin: 0 }}>Completed Transactions</h3>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Record of all successful payments and rides</p>
                </div>

                {/* Debug: Status Breakdown (Turned Off) */}
                {/* <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.05)', fontSize: '0.8rem', display: 'flex', gap: '1rem', overflowX: 'auto' }}>
                    <strong>Diagnostics (All Bookings Found): {bookings.length + (loading ? 0 : 0)}</strong>
                    {Object.entries(bookings.reduce((acc, b) => ({ ...acc, [b.status]: (acc[b.status] || 0) + 1 }), {})).map(([k, v]) => (
                        <span key={k} className="badge badge-neutral">{k}: {v}</span>
                    ))}
                </div> */}

                {bookings.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📜</div>
                        <p className="text-muted">No completed payment history found.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="table" style={{ width: '100%' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Date</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Passenger</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Route</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Amount</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Method</th>
                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map(b => (
                                    <tr key={b.id} className="hover-trigger">
                                        <td style={{ padding: '1rem' }}>
                                            {new Date(b.ride?.date || b.createdAt).toLocaleDateString()}
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {new Date(b.createdAt).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 600 }}>{b.passengers?.[0]?.name || "User"}</div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{b.userEmail}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {b.ride?.fromLocation} &rarr; {b.ride?.toLocation}
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--success)' }}>
                                            ₹{b.totalPrice}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                                                <span className={`badge ${b.paymentMethod === 'CASH' ? 'badge-success' : 'badge-primary'}`}>
                                                    {b.paymentMethod === 'CASH' ? '💵 Cash' : '💳 Stripe'}
                                                </span>
                                                {/* Rate Button for Completed Rides */}
                                                {(b.status === 'COMPLETED' || b.status === "PAID" || b.status === "DRIVER_COMPLETED") && (
                                                    <button
                                                        className="btn btn-primary"
                                                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem', height: 'auto', whiteSpace: 'nowrap' }}
                                                        onClick={() => handleOpenRate(b)}
                                                    >
                                                        Rate Passenger
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span className={`badge badge-${(b.status === "COMPLETED" || b.status === "PAID") ? "success" : "warning"}`}>
                                                {b.status === 'DRIVER_COMPLETED' ? "RIDE COMPLETED" :
                                                    b.status === 'COMPLETED' || b.status === 'PAID' ? "PAYMENT RECEIVED" :
                                                        b.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {bookings.length > itemsPerPage && (
                    <Pagination
                        currentPage={currentPage}
                        totalItems={bookings.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="card glass p-6 text-center">
                    <h3 className="text-success" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        ₹{bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)}
                    </h3>
                    <p className="text-muted text-xs uppercase font-bold">Total Earnings</p>
                </div>
                <div className="card glass p-6 text-center">
                    <h3 className="text-primary" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        {bookings.length}
                    </h3>
                    <p className="text-muted text-xs uppercase font-bold">Completed Rides</p>
                </div>
            </div>
            {/* Rate Passenger Modal */}
            {rateModalOpen && createPortal(
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card glass slide-up" style={{ width: '100%', maxWidth: '400px', padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '20px', background: 'var(--primary-glow)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                            <h3 className="mb-0">Rate Passenger</h3>
                            <p className="text-muted text-xs mb-0 mt-1" style={{ fontSize: '0.8rem' }}>Reviewing {selectedBooking?.userEmail}</p>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <button type="button" className="btn btn-outline"
                                    style={{ padding: '0.4rem', minWidth: '40px', fontSize: '1.2rem' }}
                                    onClick={() => setRating(Math.max(1, rating - 1))}>−</button>

                                <StarRating rating={rating} setRating={setRating} />

                                <button type="button" className="btn btn-outline"
                                    style={{ padding: '0.4rem', minWidth: '40px', fontSize: '1.2rem' }}
                                    onClick={() => setRating(Math.min(5, rating + 1))}>+</button>
                            </div>
                            <div className="text-center mb-4" style={{ fontWeight: 700, color: 'var(--primary)' }}>{rating}/5 Stars</div>
                            <div className="mb-6" style={{ marginBottom: '1.5rem' }}>
                                <label className="text-xs font-bold uppercase opacity-60 mb-2 block" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>Notes on passenger</label>
                                <textarea
                                    className="input w-full"
                                    style={{ height: '100px', fontSize: '0.85rem', width: '100%' }}
                                    placeholder="Was the passenger on time? Polite?"
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-3" style={{ display: 'flex', gap: '0.75rem' }}>
                                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setRateModalOpen(false)}>Cancel</button>
                                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmitRate}>Submit Review</button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default DriverHistory;
