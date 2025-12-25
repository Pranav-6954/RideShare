import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyJWT, apiFetch } from "../utils/jwt";

const ConfirmBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = verifyJWT(token);

  const bookingData = location.state?.bookingData || null;
  const [offerPrice, setOfferPrice] = useState(0);

  useEffect(() => {
    if (!user || user.role !== "user") {
      navigate("/login");
      return;
    }
    if (!bookingData) {
      navigate("/user-rides");
      return;
    }
    if (bookingData) {
      const initialPrice = bookingData.totalPrice || (Number(bookingData.bus.price || 0) * Number(bookingData.seats || 0));
      setOfferPrice(initialPrice);
    }
  }, [bookingData, navigate, user]);

  if (!bookingData || !bookingData.bus) {
    return (
      <div className="container">
        <div className="glass-card text-center py-12">
          <h2>No booking data found.</h2>
          <button className="btn btn-primary mt-6" onClick={() => navigate("/user-rides")}>Browse Rides</button>
        </div>
      </div>
    );
  }

  const { bus, seats, passengerNames } = bookingData;
  const standardTotal = Number(bus.price) * Number(seats || 0);

  const [paymentMethod, setPaymentMethod] = useState("ONLINE"); // ONLINE or CASH

  const handlePayment = async () => {
    try {
      if (offerPrice <= 0) { alert("Price must be greater than 0"); return; }

      const bookingBody = {
        vehicleId: bus.id,
        seats: Number(seats),
        pickupLocation: bookingData.pickup || bus.fromLocation,
        dropoffLocation: bookingData.dropoff || bus.toLocation,
        totalPrice: Number(offerPrice),
        paymentMethod: paymentMethod,
        passengers: passengerNames.map(name => ({ name, age: 30, gender: 'Other' }))
      };

      const bookingRes = await apiFetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify(bookingBody)
      });

      if (paymentMethod === "CASH") {
        alert("Booking Confirmed! Please pay ₹" + offerPrice + " directly to the driver at pickup.");
        navigate("/booking-success", { state: { bookingId: bookingRes.id, amount: Number(offerPrice) } });
      } else {
        navigate("/payment", { state: { amount: Number(offerPrice), bookingId: bookingRes.id } });
      }
    } catch (err) {
      alert("Process Failed: " + err.message);
    }
  };

  return (
    <div className="container">
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', background: 'linear-gradient(to right, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center' }}>
          Review & Confirm
        </h1>

        <div className="glass-card mb-8 slide-up" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '2rem', background: 'var(--primary-glow)', borderBottom: '1px solid var(--glass-border)' }}>
            <div className="flex justify-between items-center">
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.5rem' }}>Booking Summary</div>
                <h2 className="mb-0">{bus.fromLocation} &rarr; {bus.toLocation}</h2>
              </div>
              <div className="text-right">
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>₹{offerPrice}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Amount</div>
              </div>
            </div>
          </div>

          <div style={{ padding: '2rem' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Date & Vehicle</div>
                  <div style={{ fontWeight: 600 }}>{bus.date} • {bus.vehicleType}</div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Route Specifics</div>
                  <div style={{ fontWeight: 600 }}>{bookingData.pickup} &rarr; {bookingData.dropoff}</div>
                </div>
              </div>
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Seats Reserved</div>
                  <div style={{ fontWeight: 600 }}>{seats} Passenger(s)</div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Passengers</div>
                  <div style={{ fontWeight: 600 }}>{passengerNames.join(", ")}</div>
                </div>
              </div>
            </div>

            <div className="glass mb-8" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="mb-1">Make an Offer</h4>
                  <p className="text-muted text-xs mb-0">You can suggest a price to the driver for negotiation.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{standardTotal}</span>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--primary)' }}>₹</span>
                    <input
                      type="number"
                      className="input"
                      style={{ width: '130px', paddingLeft: '25px', textAlign: 'right', fontWeight: 800, fontSize: '1.1rem', border: offerPrice !== standardTotal ? '2px solid var(--accent)' : '1px solid var(--glass-border)' }}
                      value={offerPrice}
                      onChange={e => setOfferPrice(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
              {offerPrice > standardTotal && (
                <div style={{ fontSize: '0.7rem', color: 'var(--warning)', mt: '0.5rem', textAlign: 'right' }}>Note: Offering more may increase your chances of quick acceptance.</div>
              )}
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '1px' }}>Select Payment Method</div>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`glass-card ${paymentMethod === 'ONLINE' ? 'active-glow' : ''}`}
                  style={{ cursor: 'pointer', padding: '1.25rem', border: paymentMethod === 'ONLINE' ? '2px solid var(--primary)' : '1px solid var(--glass-border)', background: paymentMethod === 'ONLINE' ? 'rgba(99, 102, 241, 0.1)' : 'transparent' }}
                  onClick={() => setPaymentMethod("ONLINE")}
                >
                  <div className="flex items-center gap-3">
                    <div style={{ fontSize: '1.5rem' }}>💳</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Online (Stripe)</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>Credit / Debit / UPI</div>
                    </div>
                  </div>
                </div>
                <div
                  className={`glass-card ${paymentMethod === 'CASH' ? 'active-glow' : ''}`}
                  style={{ cursor: 'pointer', padding: '1.25rem', border: paymentMethod === 'CASH' ? '2px solid var(--primary)' : '1px solid var(--glass-border)', background: paymentMethod === 'CASH' ? 'rgba(99, 102, 241, 0.1)' : 'transparent' }}
                  onClick={() => setPaymentMethod("CASH")}
                >
                  <div className="flex items-center gap-3">
                    <div style={{ fontSize: '1.5rem' }}>💵</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Pay by Cash</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>At Pickup/Dropoff</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '1.5rem 2rem', background: 'rgba(0,0,0,0.1)', display: 'flex', gap: '1rem', borderTop: '1px solid var(--glass-border)' }}>
            <button className="btn btn-secondary" style={{ flex: 1, padding: '14px' }} onClick={() => navigate(-1)}>
              Back
            </button>
            <button className="btn btn-primary" style={{ flex: 2, padding: '14px', fontSize: '1rem', fontWeight: 700 }} onClick={handlePayment}>
              {paymentMethod === "ONLINE" ? "Proceed to Stripe" : "Confirm with Cash"}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '10px' }}><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </button>
          </div>
        </div>

        <p className="text-center text-muted" style={{ fontSize: '0.85rem' }}>
          By clicking "Pay & Confirm", you agree to our Terms of Service and Privacy Policy.
          Payments are handled securely via Stripe.
        </p>
      </div>
    </div>
  );
};

export default ConfirmBooking;

