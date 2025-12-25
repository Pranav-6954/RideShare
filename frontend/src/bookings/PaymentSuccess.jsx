import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "../utils/jwt";

const PaymentSuccess = () => {
  const nav = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  const [confirming, setConfirming] = useState(false);
  const [bookingId, setBookingId] = useState(location.state?.bookingId || query.get("bookingId"));
  const amount = location.state?.amount;
  const paymentIntentId = query.get("payment_intent");

  useEffect(() => {
    // If we have a payment intent and a booking ID from the URL (Redirect Flow)
    if (paymentIntentId && bookingId && !confirming) {
      setConfirming(true);
      const confirmData = async () => {
        try {
          // Confirm Payment in our DB (Backend now handles Booking status update too)
          await apiFetch(`/api/payment/confirm`, {
            method: "POST",
            body: JSON.stringify({
              paymentIntentId: paymentIntentId
            })
          });
          console.log("Redirect payment confirmed successfully.");
        } catch (err) {
          console.error("Failed to confirm redirect payment:", err);
        } finally {
          setConfirming(false);
        }
      };
      confirmData();
    }
  }, [paymentIntentId, bookingId]);

  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="glass-card text-center slide-up" style={{ maxWidth: '600px', padding: '4rem 2rem' }}>
        {confirming ? (
          <div className="flex flex-col items-center py-10">
            <div className="spinner mb-4"></div>
            <h2 className="text-muted">Verifying your payment...</h2>
            <p className="text-sm">Please do not close this window.</p>
          </div>
        ) : (
          <>
            <div className="success-animation mb-8">
              <div className="checkmark-circle">
                <div className="background"></div>
                <div className="checkmark draw"></div>
              </div>
            </div>

            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--success)' }}>Booking Confirmed!</h1>
            <p className="text-muted mb-8" style={{ fontSize: '1.2rem' }}>
              Your ride has been successfully booked.
              {amount && <span> A payment of <strong>₹{amount}</strong> has been processed securely.</span>}
            </p>

            <div className="glass mb-10" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)', textAlign: 'left' }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted text-sm">Booking ID</span>
                <span style={{ fontWeight: 700 }}>#BK-{bookingId || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted text-sm">Status</span>
                <span className="badge success">Confirmed</span>
              </div>
            </div>
          </>
        )}

        <div className="flex gap-4">
          <button className="btn btn-secondary" style={{ flex: 1, padding: '14px' }} onClick={() => nav("/")}>
            Go to Home
          </button>
          <button className="btn btn-primary" style={{ flex: 1, padding: '14px' }} onClick={() => nav("/my-bookings")}>
            View My Bookings
          </button>
        </div>

        <p className="text-muted mt-8" style={{ fontSize: '0.85rem' }}>
          We've sent a confirmation email to your registered email address.
          Safe travels! 🚗✨
        </p>
      </div>

      <style>{`
                .checkmark-circle {
                    width: 100px;
                    height: 100px;
                    position: relative;
                    display: inline-block;
                    vertical-align: top;
                    margin-left: auto;
                    margin-right: auto;
                }
                .checkmark-circle .background {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    background: var(--success);
                    position: absolute;
                    opacity: 0.2;
                }
                .checkmark-circle .checkmark {
                    border-radius: 5px;
                }
                .checkmark-circle .checkmark.draw:after {
                    animation-duration: 800ms;
                    animation-timing-function: ease;
                    animation-name: checkmark;
                    transform: scaleX(-1) rotate(135deg);
                }
                .checkmark-circle .checkmark:after {
                    opacity: 1;
                    height: 50px;
                    width: 25px;
                    transform-origin: left top;
                    border-right: 8px solid var(--success);
                    border-top: 8px solid var(--success);
                    content: "";
                    left: 25px;
                    top: 55px;
                    position: absolute;
                }
                @keyframes checkmark {
                    0% {
                        height: 0;
                        width: 0;
                        opacity: 1;
                    }
                    20% {
                        height: 0;
                        width: 25px;
                        opacity: 1;
                    }
                    40% {
                        height: 50px;
                        width: 25px;
                        opacity: 1;
                    }
                    100% {
                        height: 50px;
                        width: 25px;
                        opacity: 1;
                    }
                }
            `}</style>
    </div>
  );
};

export default PaymentSuccess;

