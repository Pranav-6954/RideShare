import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/jwt";

const DriverReserve = () => {
    const { id } = useParams();
    const nav = useNavigate();
    const [ride, setRide] = useState(null);
    const [seats, setSeats] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        apiFetch(`/api/rides/${id}`)
            .then((data) => {
                setRide(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiFetch("/api/bookings", {
                method: "POST",
                body: JSON.stringify({
                    rideId: ride.id,
                    seats: parseInt(seats),
                    passengers: [{ name: "Driver Reserved", age: 0, gender: "N/A" }]
                })
            });
            nav("/driver-dashboard");
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}><h3>Consulting transit database...</h3></div>;
    if (error) return <div className="container"><div className="badge badge-danger">Operation Error: {error}</div></div>;
    if (!ride) return <div className="container" style={{ textAlign: 'center' }}><h3>Transit record not found.</h3></div>;

    return (
        <div className="container" style={{ paddingBottom: '5rem', maxWidth: '600px' }}>
            <div className="animate-slide-up" style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '0.5rem' }}>Reserve Inventory</h1>
                <p style={{ color: 'var(--text-muted)' }}>Block seats for offline passengers or personal use</p>
            </div>

            <div className="card glass animate-slide-up" style={{ padding: '2.5rem' }}>
                <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(var(--primary-rgb), 0.05)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Target Ride</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{ride.fromLocation} → {ride.toLocation}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        📅 {ride.date} | <span className="badge badge-primary">{ride.tickets} Seats Available</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="label">Reservation Capacity</label>
                        <input
                            type="number"
                            className="input"
                            min="1"
                            max={ride.tickets}
                            value={seats}
                            onChange={(e) => setSeats(e.target.value)}
                            required
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            These seats will be marked as "Reserved" and removed from public listing.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                        <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => nav(-1)}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Execute Reservation</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DriverReserve;
