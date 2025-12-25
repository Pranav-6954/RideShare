import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/jwt";

// IMPORTANT: Insert your Stripe Publishable Key here
const stripePromise = loadStripe("pk_test_51Si6Y5QtS4SHV1lQktzwaw0AxvKrxjSdYRwz7fYlUFwxArsF3IE97rZrR5lW9j9A605BVwJaM4HkoUxsnMlssXZu00R6j8kEYZ");

function CheckoutForm({ amount }) {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const { bookingId } = useLocation().state || {};

    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsLoading(true);
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin + "/booking-success?bookingId=" + bookingId,
            },
            redirect: "if_required"
        });

        if (error) {
            console.error("Stripe confirmPayment error:", error);
            setMessage(error.message || "An unexpected error occurred.");
            alert("Payment Failed: " + (error.message || "Unexpected error"));
        } else {
            if (paymentIntent && paymentIntent.status === "succeeded") {
                if (bookingId) {
                    try {
                        await apiFetch(`/api/payment/confirm`, {
                            method: "POST",
                            body: JSON.stringify({
                                paymentIntentId: paymentIntent.id,
                                paymentMethodId: paymentIntent.payment_method
                            })
                        });
                    } catch (e) { console.error("Update failed:", e); }
                }
                setMessage("Payment Successful! Redirecting...");
                setTimeout(() => {
                    navigate("/booking-success", { state: { bookingId, amount } });
                }, 1500);
            } else {
                setMessage("Payment processing...");
            }
        }
        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="slide-up">
            <div className="glass mb-8" style={{ padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}>
                <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
            </div>

            <button
                disabled={isLoading || !stripe || !elements}
                className="btn btn-primary w-full"
                style={{ padding: '16px', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
                {isLoading ? (
                    <>
                        <div className="spinner-sm"></div>
                        Processing...
                    </>
                ) : (
                    <>
                        Pay ₹{amount}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                    </>
                )}
            </button>

            {message && (
                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontWeight: 600, color: message.includes("Failed") || message.includes("error") ? 'var(--error)' : 'var(--success)', animation: 'fadeIn 0.3s ease' }}>
                    {message}
                </div>
            )}
        </form>
    );
}

export default function PaymentPage() {
    const [clientSecret, setClientSecret] = useState("");
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const amount = location.state?.amount || 0;
    const bookingId = location.state?.bookingId;

    useEffect(() => {
        if (!bookingId || amount <= 0) {
            setError("Invalid booking or amount. Please try again.");
            return;
        }

        apiFetch("/api/payment/create-payment-intent", {
            method: "POST",
            body: JSON.stringify({ amount, bookingId }),
        })
            .then((data) => {
                if (data.clientSecret) {
                    setClientSecret(data.clientSecret);
                } else {
                    throw new Error("Could not initialize payment intent.");
                }
            })
            .catch(err => {
                setError(err.message || "Failed to connect to payment server.");
            });
    }, [amount, bookingId]);

    const appearance = {
        theme: 'night',
        variables: {
            colorPrimary: '#6366f1',
            colorBackground: 'rgba(15, 23, 42, 0.8)',
            colorText: '#f8fafc',
            colorDanger: '#ef4444',
            fontFamily: 'Outfit, sans-serif',
            borderRadius: '12px',
        },
    };

    const options = { clientSecret, appearance };

    return (
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div className="glass-card" style={{ maxWidth: '550px', width: '100%', padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '2rem', background: 'var(--primary-glow)', borderBottom: '1px solid var(--glass-border)', textAlign: 'center' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.2rem' }}>🔒</div>
                    <h2 className="mb-0">Secure Payment</h2>
                    <p className="text-muted mb-0 mt-2">Complete your booking for #BK-{bookingId}</p>
                </div>

                <div style={{ padding: '2.5rem' }}>
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <div className="text-xs text-muted font-bold uppercase letter-spacing-1 mb-1">Payable Amount</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>₹{amount}</div>
                        </div>
                        <div className="text-right">
                            <div className="badge warning" style={{ background: 'var(--accent)', color: 'white' }}>Stripe Test Mode</div>
                        </div>
                    </div>

                    <div className="glass-card mb-8" style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', padding: '1rem' }}>
                        <div className="flex gap-3">
                            <span style={{ fontSize: '1.2rem' }}>💡</span>
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#eab308' }}>Demo Instructions</div>
                                <p className="text-xs text-muted mb-0 mt-1">
                                    No real money will be charged. Use <b>4242...</b> for cards or <b>success@stripeupi</b> for UPI tests.
                                </p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-danger mb-8 slide-up">
                            <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Failed to Initialize</div>
                            <p className="text-sm mb-4">{error}</p>
                            <div className="flex gap-4">
                                <button className="btn btn-primary btn-sm" onClick={() => window.location.reload()}>Retry</button>
                                <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>Go Back</button>
                            </div>
                        </div>
                    )}

                    {!error && !clientSecret && (
                        <div className="text-center py-12">
                            <div className="spinner mx-auto mb-4"></div>
                            <p className="text-muted">Establishing secure connection...</p>
                        </div>
                    )}

                    {!error && clientSecret && (
                        <Elements options={options} stripe={stripePromise}>
                            <CheckoutForm amount={amount} />
                        </Elements>
                    )}

                    <div className="mt-8 pt-6 flex items-center justify-center gap-4 opacity-50" style={{ borderTop: '1px solid var(--glass-border)' }}>
                        <svg width="120" height="30" viewBox="0 0 100 24" fill="currentColor"><path d="M12.92 11.23c0-2.3-1.61-3.66-3.8-3.66-2.28 0-3.9 1.4-3.9 3.66 0 2.3 1.62 3.66 3.9 3.66 2.19 0 3.8-1.36 3.8-3.66zm-5.46 0c0-1.04.66-1.78 1.66-1.78.96 0 1.62.74 1.62 1.78 0 1.05-.66 1.79-1.62 1.79-.99 0-1.66-.74-1.66-1.79zm11.77-3.41h-1.83l.26-1h1.83l.26-1h1.84l-.26 1h1.83l.26-1h1.84l-.26 1H25l-.26 1h-1.84l-.32 1.25c-.24.96-1 1.25-1.78 1.25h-.54l-.26 1H21c1.55 0 2.91-.77 3.32-2.25L24.64 8.7h1.83l-.26 1h-1.83l.41 1.58c.24.96-1 1.25-1.78 1.25h-.54l-.26 1h.75c1.55 0 2.91-.77 3.32-2.25l.39-1.58h1.83l.26-1h-1.83l-.32 1.25c-.41 1.48-1.77 2.25-3.32 2.25h-.73l.26-1h.54c.78 0 1.54-.29 1.78-1.25l-.41-1.58h-1.83l.26-1h1.83l-.39 1.58c-.41 1.48-1.77 2.25-3.32 2.25h-.73z"></path></svg>
                        <div style={{ width: '1px', height: '20px', background: 'var(--glass-border)' }}></div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Powered by Stripe</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

