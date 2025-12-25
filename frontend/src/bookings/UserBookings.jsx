import React, { useEffect, useState } from "react";
import { apiFetch, verifyJWT } from "../utils/jwt";
import { useNavigate } from "react-router-dom";
import StarRating from "../common/StarRating";

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch("/api/bookings/me")
      .then(data => {
        setBookings(data);
        setLoading(false);
        setCurrentPage(1);
      })
      .catch(() => {
        setBookings([]);
        setLoading(false);
      });
  }, []);

  const getDaysLeft = (dateStr) => {
    if (!dateStr) return null;
    const rideDate = new Date(dateStr);
    const today = new Date();
    const diffTime = rideDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Completed";
    if (diffDays === 0) return "Today";
    return `${diffDays} days left`;
  };

  const formatTime = (iso) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handlePay = (booking) => {
    navigate("/payment", {
      state: {
        bookingId: booking.id,
        amount: booking.totalPrice || (booking.seats * booking.vehicle.price)
      }
    });
  };

  const handleViewReceipt = async (bookingId) => {
    try {
      const data = await apiFetch(`/api/payment/booking/${bookingId}`);
      setSelectedPayment(data);
      setReceiptModalOpen(true);
    } catch (err) {
      alert("Receipt not found for this booking.");
    }
  };

  const handleOpenReview = (booking) => {
    setSelectedBooking(booking);
    setRating(5);
    setComment("");
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedBooking) return;
    try {
      const user = verifyJWT();
      await apiFetch("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          reviewerEmail: user.email,
          revieweeEmail: selectedBooking.vehicle.driverEmail,
          bookingId: selectedBooking.id,
          rating: parseInt(rating),
          comment: comment
        })
      });
      alert("Review Submitted!");
      setReviewModalOpen(false);
    } catch (err) {
      alert("Failed to submit review");
    }
  };

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <div className="spinner mb-4 mx-auto"></div>
        <p className="text-muted">Fetching your booking history...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            My Bookings
          </h1>
          <p className="text-muted mb-0">Track your past and upcoming travels</p>
        </div>
        <div className="badge primary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
          {bookings.length} Total Bookings
        </div>
      </header>

      {bookings.length === 0 ? (
        <div className="glass-card text-center py-20 slide-up">
          <div style={{ padding: '24px', background: 'var(--primary-glow)', borderRadius: '50%', width: 'fit-content', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
          </div>
          <h3>No bookings yet</h3>
          <p className="text-muted mb-6">Start exploring rides and book your first trip!</p>
          <button className="btn btn-primary" onClick={() => navigate("/user-rides")}>Browse Rides</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6">
            {bookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((b, idx) => {
              const daysLeft = b.vehicle ? getDaysLeft(b.vehicle.date) : null;
              return (
                <div key={b.id} className="glass-card slide-up hover-trigger" style={{ animationDelay: `${idx * 0.1}s`, padding: '0', overflow: 'hidden' }}>
                  <div className="flex flex-col md:flex-row">
                    <div style={{ padding: '1.5rem', flex: 1 }}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className={`badge ${b.status === "CONFIRMED" ? "success" : b.status === "PENDING" ? "warning" : "error"}`} style={{ marginBottom: '0.5rem' }}>
                            {b.status}
                          </span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Booked on {formatTime(b.createdAt)}</div>
                        </div>
                        <div className="text-right">
                          <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>₹{b.totalPrice || (b.seats * b.vehicle.price)}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{b.seats} Seat(s)</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-6">
                        <div style={{ flex: 1 }}>
                          <div className="text-xs text-muted uppercase font-bold letter-spacing-1">From</div>
                          <div style={{ fontWeight: 600 }}>{b.vehicle.fromLocation}</div>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>&rarr;</div>
                        <div style={{ flex: 1, textAlign: 'right' }}>
                          <div className="text-xs text-muted uppercase font-bold letter-spacing-1">To</div>
                          <div style={{ fontWeight: 600 }}>{b.vehicle.toLocation}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 items-center justify-between" style={{ padding: '1rem 0', borderTop: '1px solid var(--glass-border)' }}>
                        <div className="flex items-center gap-2">
                          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{b.vehicle.date}</div>
                            {daysLeft && <div style={{ fontSize: '0.7rem', color: daysLeft === 'Completed' ? 'var(--text-muted)' : 'var(--accent)' }}>{daysLeft}</div>}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {b.status === "PENDING" && (
                            <button onClick={() => handlePay(b)} className="btn btn-success btn-sm">Pay Now</button>
                          )}
                          {(b.status === "CONFIRMED" || b.status === "COMPLETED") && (
                            <div className="flex gap-2">
                              <button onClick={() => handleViewReceipt(b.id)} className="btn btn-secondary btn-sm">
                                Receipt
                              </button>
                              <button onClick={() => handleOpenReview(b)} className="btn btn-outline btn-sm" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>
                                Rate Driver
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.05)', padding: '1.5rem', width: '100%', mdWidth: '250px', borderLeft: '1px solid var(--glass-border)' }}>
                      <div className="text-xs text-muted uppercase font-bold mb-3">Vehicle & Contact</div>
                      <div className="mb-4">
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{b.vehicle.vehicleType}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.vehicle.vehicleNumber}</div>
                      </div>
                      {b.vehicle.driverPhone && (
                        <div className="flex items-center gap-2" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                          <span style={{ fontSize: '0.9rem' }}>{b.vehicle.driverPhone}</span>
                        </div>
                      )}
                      <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Driver Email</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500, wordBreak: 'break-all' }}>{b.vehicle.driverEmail}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {bookings.length > itemsPerPage && (
            <div className="flex justify-center items-center mt-12 gap-4">
              <button
                className="btn btn-secondary"
                style={{ padding: '10px 20px' }}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                &larr; Previous
              </button>
              <div className="glass-card" style={{ padding: '10px 20px', fontWeight: 600 }}>
                Page {currentPage} of {Math.ceil(bookings.length / itemsPerPage)}
              </div>
              <button
                className="btn btn-secondary"
                style={{ padding: '10px 20px' }}
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(bookings.length / itemsPerPage), p + 1))}
                disabled={currentPage === Math.ceil(bookings.length / itemsPerPage)}
              >
                Next &rarr;
              </button>
            </div>
          )}
        </>
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
          <div className="glass-card slide-up" style={{ width: '100%', maxWidth: '450px', padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '2rem', background: 'var(--primary-glow)', borderBottom: '1px solid var(--glass-border)', textAlign: 'center' }}>
              <h2 className="mb-0">Rate Your Experience</h2>
              <p className="text-muted mb-0 mt-2">How was your ride with the driver?</p>
            </div>

            <div style={{ padding: '2rem' }}>
              <div className="text-center mb-8">
                <div className="text-xs text-muted uppercase font-bold mb-3">Select Rating</div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <StarRating rating={rating} setRating={setRating} />
                </div>
              </div>

              <div className="mb-8">
                <label className="text-xs text-muted uppercase font-bold mb-2 block">Your Feedback</label>
                <textarea
                  className="input w-full"
                  style={{ height: '120px', padding: '15px' }}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Tell us what you liked or what could be improved..."
                />
              </div>

              <div className="flex gap-4">
                <button className="btn btn-secondary flex-1" onClick={() => setReviewModalOpen(false)}>Cancel</button>
                <button className="btn btn-primary flex-1" onClick={handleSubmitReview}>Submit Review</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receiptModalOpen && selectedPayment && (
        <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
          <div className="glass-card slide-up" style={{ width: '100%', maxWidth: '400px', padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '2rem', background: 'var(--success-glow)', borderBottom: '1px solid var(--glass-border)', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--success)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
              </div>
              <h2 className="mb-0">Payment Receipt</h2>
              <p className="text-muted mb-0 mt-2">Transaction successfully processed</p>
            </div>

            <div style={{ padding: '2rem' }}>
              <div className="mb-6">
                <div className="text-xs text-muted uppercase font-bold mb-1">Passnger Email</div>
                <div style={{ fontWeight: 600 }}>{selectedPayment.userEmail}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-xs text-muted uppercase font-bold mb-1">Amount Paid</div>
                  <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: '1.2rem' }}>₹{selectedPayment.amount}</div>
                </div>
                <div>
                  <div className="text-xs text-muted uppercase font-bold mb-1">Status</div>
                  <div className="badge success">{selectedPayment.status}</div>
                </div>
              </div>

              <div className="mb-6 pt-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
                <div className="text-xs text-muted uppercase font-bold mb-2">Transaction Details</div>
                {selectedPayment.stripePaymentIntentId && (
                  <div className="mb-2">
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Stripe Intent ID</div>
                    <div style={{ fontSize: '0.8rem', wordBreak: 'break-all', fontFamily: 'monospace' }}>{selectedPayment.stripePaymentIntentId}</div>
                  </div>
                )}
              </div>

              <button className="btn btn-primary w-full" onClick={() => setReceiptModalOpen(false)}>Close Receipt</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
                .hover-trigger:hover {
                    border-color: var(--primary) !important;
                    transform: translateY(-4px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                }
                .letter-spacing-1 { letter-spacing: 1px; }
            `}</style>
    </div>
  );
};

export default UserBookings;

