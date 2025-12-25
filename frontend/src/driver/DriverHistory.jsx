import React, { useEffect, useState } from "react";
import { apiFetch } from "../utils/jwt";

const DriverHistory = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch("/api/payments/driver-history")
            .then(data => setPayments(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const totalEarnings = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    return (
        <div className="container mt-4">
            <h2>Driver Earnings & History</h2>
            <div className="card mb-4" style={{ display: 'inline-block', padding: '1rem 2rem' }}>
                <h3 className="text-success m-0">Total Earnings: Rs. {totalEarnings.toFixed(2)}</h3>
            </div>

            <div className="table-container fade-in">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Payment Intent</th>
                            <th>Passenger Email</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan="5" className="text-center">Loading...</td></tr>}
                        {!loading && payments.length === 0 && <tr><td colSpan="5" className="text-center">No transactions found</td></tr>}
                        {payments.map(p => (
                            <tr key={p.id}>
                                <td>{new Date(p.id).toLocaleDateString()}</td> {/* Mock Date using ID if n/a */}
                                <td>{p.stripePaymentIntentId || "-"}</td>
                                <td>{p.userEmail}</td>
                                <td>{p.amount}</td>
                                <td>
                                    <span className={`badge ${p.status === "PAID" ? "success" : "warning"}`}>
                                        {p.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DriverHistory;
