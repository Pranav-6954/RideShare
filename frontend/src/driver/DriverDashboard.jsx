import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { apiFetch, verifyJWT } from "../utils/jwt";
import StarRating from "../common/StarRating";

const DriverDashboard = () => {
    const nav = useNavigate();
    const token = localStorage.getItem("token");
    const user = verifyJWT(token);

    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0 });

    const [myRides, setMyRides] = useState([]);
    const [myReviews, setMyReviews] = useState([]);
    const [loadingRides, setLoadingRides] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");
    const [searchText, setSearchText] = useState("");
    const [sortOrder, setSortOrder] = useState("desc");

    // Pagination states
    const [ridesPage, setRidesPage] = useState(1);
    const [requestsPage, setRequestsPage] = useState(1);
    const [reviewsPage, setReviewsPage] = useState(1);
    const [rateModalOpen, setRateModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const itemsPerPage = 5;

    // WebSocket Connection
    useEffect(() => {
        if (!user || user.role !== "driver") return;

        const client = new Client({
            webSocketFactory: () => new SockJS("http://localhost:8084/ws"),
            onConnect: () => {
                client.subscribe("/topic/driver/" + user.email, (msg) => {
                    setStatusMsg({ type: "success", text: "New Request: " + msg.body });
                    fetchBookings();
                });
            },
            onStompError: (err) => console.error("WebSocket Error:", err),
        });

        client.activate();

        return () => {
            client.deactivate();
        };
    }, []);

    // Derived state for filtering and sorting
    const filteredBookings = bookings
        .filter(b => {
            const name = b.passengers && b.passengers.length > 0 ? b.passengers[0].name : "Unknown";
            return name.toLowerCase().includes(searchText.toLowerCase()) ||
                b.userEmail.toLowerCase().includes(searchText.toLowerCase());
        })
        .sort((a, b) => {
            const dateA = new Date(a.vehicle?.date || 0);
            const dateB = new Date(b.vehicle?.date || 0);
            return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });

    const toggleSort = () => setSortOrder(prev => prev === "asc" ? "desc" : "asc");

    const fetchBookings = async () => {
        setLoadingRides(true);
        setErrorMsg("");
        try {
            // Fetch Bookings with Stats
            const bookingData = await apiFetch("/api/bookings/driver");
            setBookings(bookingData);
            const total = bookingData.length;
            const pending = bookingData.filter(b => b.status === "PENDING").length;
            const confirmed = bookingData.filter(b => b.status === "CONFIRMED").length;
            setStats({ total, pending, confirmed });

            // Fetch My Rides
            const rideData = await apiFetch("/api/vehicles/driver-posts");
            setMyRides(rideData);

            // Fetch My Reviews
            const reviewData = await apiFetch(`/api/reviews/user/${user.email}`);
            setMyReviews(reviewData);

        } catch (err) {
            console.error("Dashboard Fetch Error:", err);
            setErrorMsg(err.message || "Failed to load dashboard data");
        } finally {
            setLoadingRides(false);
        }
    };

    useEffect(() => { fetchBookings(); }, []);

    const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

    // Auto-clear message after 3 seconds
    useEffect(() => {
        if (statusMsg.text) {
            const timer = setTimeout(() => setStatusMsg({ type: "", text: "" }), 4000);
            return () => clearTimeout(timer);
        }
    }, [statusMsg]);

    const updateStatus = async (id, status) => {
        try {
            await apiFetch(`/api/bookings/${id}/status`, {
                method: "PUT",
                body: JSON.stringify({ status })
            });
            setStatusMsg({ type: "success", text: `Booking Request ${status.toLowerCase()} successfully!` });
            fetchBookings(); // Full refresh ensures stats are correct
        } catch (err) {
            setStatusMsg({ type: "error", text: "Failed to update: " + err.message });
        }
    };

    const handleOpenRate = (booking) => {
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
                    reviewerEmail: user.email,
                    revieweeEmail: selectedBooking.userEmail,
                    bookingId: selectedBooking.id,
                    rating: parseInt(rating),
                    comment: comment
                })
            });
            setStatusMsg({ type: "success", text: "Passenger rated successfully!" });
            setRateModalOpen(false);
        } catch (err) {
            setStatusMsg({ type: "error", text: "Failed to submit rating: " + err.message });
        }
    };

    const isRideCompleted = (dateStr) => {
        if (!dateStr) return false;
        return new Date(dateStr) < new Date();
    };


    return (
        <div className="container mt-4 pb-20">
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Driver Command Center
                    </h1>
                    <p className="text-muted mb-0">Manage your deployments, requests, and performance</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-primary" onClick={() => nav("/driver/add-ride")}>+ Post New Ride</button>
                </div>
            </header>

            {statusMsg.text && (
                <div className={`glass-card mb-8 slide-up`} style={{
                    background: statusMsg.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                    border: `1px solid ${statusMsg.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`,
                    color: statusMsg.type === 'error' ? '#ef4444' : '#22c55e',
                    padding: '1rem'
                }}>
                    <div className="flex items-center gap-2 font-bold">
                        {statusMsg.type === 'error' ? '⚠️' : '✅'} {statusMsg.text}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 fade-in">
                <div className="glass-card text-center transition-all hover:-translate-y-1">
                    <div style={{ padding: '20px', background: 'var(--primary-glow)', borderRadius: '16px', color: 'var(--primary)', width: 'fit-content', margin: '0 auto 1.5rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 17h6" /><path d="M2 12h12" /><path d="M2 7h16" /><path d="M20 12h.01" /><path d="M20 17h.01" /><path d="M20 7h.01" /></svg>
                    </div>
                    <h3 className="text-primary mb-1" style={{ fontSize: '2.5rem', fontWeight: 800 }}>{stats.total}</h3>
                    <p className="text-muted text-xs font-bold uppercase tracking-widest opacity-60">Total Requests</p>
                </div>
                <div className="glass-card text-center transition-all hover:-translate-y-1">
                    <div style={{ padding: '20px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '16px', color: 'var(--warning)', width: 'fit-content', margin: '0 auto 1.5rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    </div>
                    <h3 className="text-warning mb-1" style={{ fontSize: '2.5rem', fontWeight: 800 }}>{stats.pending}</h3>
                    <p className="text-muted text-xs font-bold uppercase tracking-widest opacity-60">Awaiting Action</p>
                </div>
                <div className="glass-card text-center transition-all hover:-translate-y-1">
                    <div style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', color: 'var(--success)', width: 'fit-content', margin: '0 auto 1.5rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    </div>
                    <h3 className="text-success mb-1" style={{ fontSize: '2.5rem', fontWeight: 800 }}>{stats.confirmed}</h3>
                    <p className="text-muted text-xs font-bold uppercase tracking-widest opacity-60">Active Bookings</p>
                </div>
            </div>

            <div className="glass-card mb-12 slide-up" style={{ padding: '0', overflow: 'hidden', animationDelay: '0.1s' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="mb-0" style={{ fontSize: '1.25rem' }}>My Active Deployments</h3>
                    <div className="badge primary">{myRides.length} Active</div>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <tr>
                                <th style={{ paddingLeft: '1.5rem' }}>Route</th>
                                <th>Date</th>
                                <th>Fare</th>
                                <th>Seats</th>
                                <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {errorMsg && <tr><td colSpan="5" className="text-center py-10 text-danger">{errorMsg}</td></tr>}
                            {loadingRides && <tr><td colSpan="5" className="text-center py-10">
                                <div className="spinner mx-auto mb-2"></div>
                                <span className="text-muted">Loading your fleet...</span>
                            </td></tr>}
                            {!loadingRides && !errorMsg && myRides.length === 0 && <tr><td colSpan="5" className="text-center py-10 text-muted">No rides posted yet. Start by creating one!</td></tr>}
                            {!loadingRides && !errorMsg && myRides.slice((ridesPage - 1) * itemsPerPage, ridesPage * itemsPerPage).map(r => (
                                <tr key={r.id} className="hover-trigger transition-all">
                                    <td style={{ paddingLeft: '1.5rem', fontWeight: 600 }}>{r.fromLocation} &rarr; {r.toLocation}</td>
                                    <td>{new Date(r.date).toLocaleDateString()}</td>
                                    <td className="text-success font-bold">₹{r.price}</td>
                                    <td>
                                        <div className="badge outline">{r.tickets} Left</div>
                                    </td>
                                    <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                                        <button className="btn btn-sm btn-outline" onClick={() => nav(`/driver/reserve/${r.id}`)}>
                                            Reserve Seats
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination My Rides */}
                {myRides.length > itemsPerPage && (
                    <div className="flex justify-center items-center py-4 gap-4" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--glass-border)' }}>
                        <button className="btn btn-sm btn-secondary" disabled={ridesPage === 1} onClick={() => setRidesPage(p => p - 1)}>&larr;</button>
                        <span className="text-xs font-bold opacity-60">Page {ridesPage} of {Math.ceil(myRides.length / itemsPerPage)}</span>
                        <button className="btn btn-sm btn-secondary" disabled={ridesPage === Math.ceil(myRides.length / itemsPerPage)} onClick={() => setRidesPage(p => p + 1)}>&rarr;</button>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="mb-0">Incoming Requests</h3>
                    <p className="text-muted text-xs mb-0">Approve or reject passenger bookings</p>
                </div>
                <div className="flex gap-2">
                    <div style={{ position: 'relative', width: '250px' }}>
                        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '0.8rem' }}>🔍</span>
                        <input
                            className="input"
                            style={{ padding: '8px 12px 8px 32px', fontSize: '0.85rem' }}
                            placeholder="Filter by name..."
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-sm btn-secondary" onClick={toggleSort} style={{ minWidth: '120px' }}>
                        Date {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                </div>
            </div>

            <div className="glass-card slide-up" style={{ padding: '0', overflow: 'hidden', animationDelay: '0.2s' }}>
                <div className="table-container">
                    <table className="table">
                        <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <tr>
                                <th style={{ paddingLeft: '1.5rem' }}>Passenger Profile</th>
                                <th>Route</th>
                                <th>Date</th>
                                <th>Seats</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Decision</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.length === 0 && <tr><td colSpan="6" className="text-center py-10 text-muted">No booking requests found.</td></tr>}
                            {filteredBookings.slice((requestsPage - 1) * itemsPerPage, requestsPage * itemsPerPage).map(b => (
                                <tr key={b.id} className="hover-trigger transition-all">
                                    <td style={{ paddingLeft: '1.5rem' }}>
                                        <div className="flex items-center gap-3">
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', color: 'var(--primary)' }}>
                                                {b.userEmail.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{b.passengers && b.passengers[0] ? b.passengers[0].name : b.userEmail}</div>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{b.userEmail}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '0.85rem' }}>
                                        {b.vehicle?.fromLocation} <span className="opacity-30">&rarr;</span> {b.vehicle?.toLocation}
                                    </td>
                                    <td style={{ fontSize: '0.85rem' }}>{b.vehicle?.date}</td>
                                    <td><div className="badge outline">{b.seats}</div></td>
                                    <td>
                                        <span className={`badge ${b.status === "CONFIRMED" ? "success" : b.status === "PENDING" ? "warning" : "danger"}`}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                                        {b.status === "PENDING" && (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    style={{ padding: '0', width: '38px', height: '38px', borderRadius: '10px' }}
                                                    onClick={() => updateStatus(b.id, "CONFIRMED")}
                                                    title="Accept Request"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    style={{ padding: '0', width: '38px', height: '38px', borderRadius: '10px' }}
                                                    onClick={() => updateStatus(b.id, "REJECTED")}
                                                    title="Reject Request"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                </button>
                                            </div>
                                        )}
                                        {b.status === "CONFIRMED" && (
                                            <div className="flex justify-end items-center gap-3">
                                                <span className="text-success font-bold flex items-center gap-1 text-xs uppercase tracking-tighter">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                    Verified
                                                </span>
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    style={{ fontSize: '0.7rem', padding: '4px 10px', borderColor: 'var(--accent)', color: 'var(--accent)' }}
                                                    onClick={() => handleOpenRate(b)}
                                                >
                                                    Rate
                                                </button>
                                            </div>
                                        )}

                                        {b.status === "CANCELLED" && <span className="text-muted text-xs opacity-50 italic">Cancelled</span>}
                                        {b.status === "REJECTED" && <span className="text-danger text-xs opacity-50 italic">Rejected</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Requests */}
                {filteredBookings.length > itemsPerPage && (
                    <div className="flex justify-center items-center py-4 gap-4" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--glass-border)' }}>
                        <button className="btn btn-sm btn-secondary" disabled={requestsPage === 1} onClick={() => setRequestsPage(p => p - 1)}>&larr;</button>
                        <span className="text-xs font-bold opacity-60">Page {requestsPage} of {Math.ceil(filteredBookings.length / itemsPerPage)}</span>
                        <button className="btn btn-sm btn-secondary" disabled={requestsPage === Math.ceil(filteredBookings.length / itemsPerPage)} onClick={() => setRequestsPage(p => p + 1)}>&rarr;</button>
                    </div>
                )}
            </div>

            <div className="glass-card mt-12 slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h3 className="mb-0">Driver Reputation</h3>
                        <p className="text-muted text-xs mb-0">What passengers are saying about your service</p>
                    </div>
                    {myReviews.length > 0 && (
                        <div className="badge success" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
                            ⭐ {(myReviews.reduce((acc, r) => acc + r.rating, 0) / myReviews.length).toFixed(1)} Rating
                        </div>
                    )}
                </div>

                {myReviews.length === 0 ? (
                    <div className="text-center py-10 glass" style={{ borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                        <p className="text-muted mb-0">No reviews yet. Complete more rides to build your reputation!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {myReviews.slice((reviewsPage - 1) * itemsPerPage, reviewsPage * itemsPerPage).map(r => (
                            <div key={r.id} className="glass p-5 hover-trigger" style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent)' }}>
                                            {r.reviewerEmail.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.reviewerEmail}</div>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className="scale-75 origin-right">
                                        <StarRating rating={r.rating} readOnly={true} />
                                    </div>
                                </div>
                                <p className="mb-0 text-sm italic" style={{ lineHeight: 1.6 }}>"{r.comment}"</p>
                            </div>
                        ))}
                        {/* Pagination Reviews */}
                        {myReviews.length > itemsPerPage && (
                            <div className="flex justify-center items-center py-4 gap-4 mt-2">
                                <button className="btn btn-sm btn-secondary" disabled={reviewsPage === 1} onClick={() => setReviewsPage(p => p - 1)}>&larr;</button>
                                <span className="text-xs font-bold opacity-60">Page {reviewsPage} of {Math.ceil(myReviews.length / itemsPerPage)}</span>
                                <button className="btn btn-sm btn-secondary" disabled={reviewsPage === Math.ceil(myReviews.length / itemsPerPage)} onClick={() => setReviewsPage(p => p + 1)}>&rarr;</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Driver rating Passenger Modal */}
            {rateModalOpen && (
                <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 3000 }}>
                    <div className="glass-card slide-up" style={{ width: '100%', maxWidth: '400px', padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '20px', background: 'var(--primary-glow)', borderBottom: '1px solid var(--glass-border)', textAlign: 'center' }}>
                            <h3 className="mb-0">Rate Passenger</h3>
                            <p className="text-muted text-xs mb-0 mt-1">Reviewing {selectedBooking?.userEmail}</p>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div className="flex justify-center mb-6">
                                <StarRating rating={rating} setRating={setRating} />
                            </div>
                            <div className="mb-6">
                                <label className="text-xs font-bold uppercase opacity-60 mb-2 block">Notes on passenger CONDUCT</label>
                                <textarea
                                    className="input w-full"
                                    style={{ height: '100px', fontSize: '0.85rem' }}
                                    placeholder="Was the passenger on time? Polite?"
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button className="btn btn-secondary flex-1" onClick={() => setRateModalOpen(false)}>Cancel</button>
                                <button className="btn btn-primary flex-1" onClick={handleSubmitRate}>Submit Review</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverDashboard;
