import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/jwt";

const BookingForm = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [bus, setBus] = useState(null);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [seats, setSeats] = useState(1);
  const [passengers, setPassengers] = useState([{ name: "", age: "", gender: "Male" }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/api/vehicles/${id}`).then(data => {
      setBus(data);
      setPickup(data.fromLocation);
      setDropoff(data.toLocation);
      setFromCity(data.fromLocation);
      setToCity(data.toLocation);
    }).catch(() => nav("/user-rides"))
      .finally(() => setLoading(false));
  }, [id, nav]);

  const stops = React.useMemo(() => {
    if (!bus) return [];
    return bus.route ? bus.route.split(" -> ") : [bus.fromLocation, bus.toLocation];
  }, [bus]);

  const [dynamicPrice, setDynamicPrice] = useState(0);

  useEffect(() => {
    if (!bus || !fromCity || !toCity) return;

    // Fetch price for the selected segment
    apiFetch("/api/fare/calculate", {
      method: "POST",
      body: JSON.stringify({
        fromLocation: fromCity,
        toLocation: toCity,
        viaRoute: bus.route // Use the ride's route as context
      })
    })
      .then(data => {
        setDynamicPrice(data.recommendedPrice);
      })
      .catch(() => {
        // Fallback to proportional if API fails or isn't configured with keys
        const startIdx = stops.findIndex(s => s.toLowerCase().includes(fromCity.toLowerCase()));
        const endIdx = stops.findIndex(s => s.toLowerCase().includes(toCity.toLowerCase()));
        if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
          const totalHops = stops.length - 1;
          const userHops = endIdx - startIdx;
          const fraction = userHops / (totalHops || 1);
          setDynamicPrice(Number((bus.price * fraction).toFixed(2)));
        } else {
          setDynamicPrice(bus.price);
        }
      });
  }, [fromCity, toCity, bus, stops]);

  useEffect(() => {
    const n = Number(seats) || 1;
    setPassengers(prev => {
      const arr = [...prev];
      while (arr.length < n) arr.push({ name: "", age: "", gender: "Male" });
      arr.length = n;
      return arr;
    });
  }, [seats]);

  const changePassenger = (i, field, val) => {
    setPassengers(prev => {
      const a = [...prev];
      a[i] = { ...a[i], [field]: val };
      return a;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const finalPickup = stops.length > 2 ? fromCity : pickup;
      const finalDropoff = stops.length > 2 ? toCity : dropoff;
      const totalPrice = Number((dynamicPrice * seats).toFixed(2));

      nav("/confirm-booking", {
        state: {
          bookingData: {
            bus: bus,
            seats: seats,
            passengerNames: passengers.map(p => p.name),
            pickup: finalPickup,
            dropoff: finalDropoff,
            segmentPrice: Number(dynamicPrice),
            totalPrice: totalPrice
          }
        }
      });
    } catch (err) { setError(err.message || "Error"); }
  };

  if (loading) return (
    <div className="container flex items-center justify-center" style={{ minHeight: '60vh' }}>
      <div className="text-center">
        <div className="spinner mb-4"></div>
        <p className="text-muted">Preparing your booking...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="container">
      <div className="glass-card text-center py-12">
        <div className="text-danger text-4xl mb-4">⚠️</div>
        <h2>Oops! Something went wrong</h2>
        <p className="text-muted">{error}</p>
        <button className="btn btn-primary mt-6" onClick={() => nav("/user-rides")}>Back to Rides</button>
      </div>
    </div>
  );

  return (
    <div className="container">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Ride Details & Selection */}
        <div className="lg:col-span-12">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', background: 'linear-gradient(to right, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Complete Your Booking
          </h1>
        </div>

        <div className="lg:col-span-5">
          <div className="glass-card mb-8" style={{ padding: '0', overflow: 'hidden', position: 'sticky', top: '100px' }}>
            <div style={{ padding: '1.5rem', background: 'var(--primary-glow)', borderBottom: '1px solid var(--glass-border)' }}>
              <h3 className="mb-0">Trip Summary</h3>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div className="flex items-center gap-4 mb-6">
                <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🚗</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{bus.vehicleType}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Posted by {bus.driverName}</div>
                </div>
              </div>

              <div className="mb-6">
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Full Route</div>
                <div style={{ fontWeight: 600 }}>{bus.fromLocation} &rarr; {bus.toLocation}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{bus.date}</div>
              </div>

              <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                <div className="flex justify-between mb-2">
                  <span className="text-muted">Price per Seat</span>
                  <span style={{ fontWeight: 700 }}>₹{dynamicPrice}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-muted">Seats selected</span>
                  <span style={{ fontWeight: 700 }}>x{seats}</span>
                </div>
                <div className="flex justify-between pt-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Total Amount</span>
                  <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--success)' }}>₹{(dynamicPrice * seats).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7">
          <form onSubmit={submit}>
            <div className="glass-card mb-8">
              <h3 className="mb-6">Trip Details</h3>

              {stops.length > 2 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="form-group">
                    <label className="label">Boarding Stop</label>
                    <select
                      className="select"
                      value={fromCity}
                      onChange={e => setFromCity(e.target.value)}
                    >
                      {stops.slice(0, stops.length - 1).map((s, i) => (
                        <option key={i} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">Dropping Stop</label>
                    <select
                      className="select"
                      value={toCity}
                      onChange={e => setToCity(e.target.value)}
                    >
                      {stops.map((s, i) => (
                        <option key={i} value={s} disabled={i <= stops.findIndex(st => st === fromCity)}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="form-group">
                    <label className="label">From</label>
                    <input className="input" value={pickup} onChange={e => setPickup(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="label">To</label>
                    <input className="input" value={dropoff} onChange={e => setDropoff(e.target.value)} required />
                  </div>
                </div>
              )}

              <div className="form-group mb-0">
                <label className="label">Number of Passengers</label>
                <div className="flex items-center gap-4">
                  <input
                    className="input"
                    type="range"
                    min="1"
                    max={bus.tickets}
                    value={seats}
                    onChange={e => setSeats(Number(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <span style={{ minWidth: '40px', fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>{seats}</span>
                </div>
                <div className="flex justify-between text-xs text-muted mt-2">
                  <span>1 Seat</span>
                  <span>{bus.tickets} Seats Max</span>
                </div>
              </div>
            </div>

            <h3 className="mb-6">Passenger Details</h3>
            {passengers.map((p, i) => (
              <div className="glass-card mb-6 slide-up" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex justify-between items-center mb-6">
                  <h4 className="mb-0">Passenger #{i + 1}</h4>
                  <span className="badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>Traveler</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="form-group">
                    <label className="label">Full Name</label>
                    <input className="input" placeholder="e.g. John Doe" value={p.name} onChange={e => changePassenger(i, "name", e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="label">Age</label>
                    <input className="input" type="number" placeholder="e.g. 25" min="1" max="120" value={p.age} onChange={e => changePassenger(i, "age", e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="label">Gender</label>
                    <select className="select" value={p.gender} onChange={e => changePassenger(i, "gender", e.target.value)}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-4 mt-8">
              <button type="button" className="btn btn-secondary" onClick={() => nav(-1)} style={{ padding: '16px 32px' }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '16px 32px', fontSize: '1.1rem', fontWeight: 700 }}>
                Proceed to Confirmation
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '10px' }}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;

