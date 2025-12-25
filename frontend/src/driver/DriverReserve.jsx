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
        apiFetch(`/api/vehicles/${id}`)
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
                    vehicleId: ride.id,
                    seats: parseInt(seats),
                    passengers: [{ name: "Driver Reserved", age: 0, gender: "N/A" }]
                })
            });
            nav("/driver-dashboard");
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="container mt-4 text-center">Loading...</div>;
    if (error) return <div className="container mt-4 text-center text-danger">Error: {error}</div>;
    if (!ride) return <div className="container mt-4 text-center">Ride not found</div>;

    return (
        <div className="container mt-4">
            <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <h2 className="text-center mb-4">Reserve Seats</h2>
                <div className="mb-4">
                    <p><strong>Route:</strong> {ride.fromLocation} &rarr; {ride.toLocation}</p>
                    <p><strong>Available Seats:</strong> {ride.tickets}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label">Number of seats to reserve for yourself/offline:</label>
                        <input
                            type="number"
                            className="input"
                            min="1"
                            max={ride.tickets}
                            value={seats}
                            onChange={(e) => setSeats(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-warning w-100">Confirm Reservation</button>
                </form>
            </div>
        </div>
    );
};

export default DriverReserve;
