import React, { useEffect, useState } from "react";
import { apiFetch } from "../utils/jwt";

const TransactionHistory = () => {
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        apiFetch("/api/payments/my-history")
            .then(setPayments)
            .catch(console.error);
    }, []);

    return (
        <div className="container mt-4">
            <h2>Transaction History</h2>
            <div className="table-container fade-in">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Booking ID</th>
                            <th>Order ID</th>
                            <th>Payment ID</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.length === 0 && <tr><td colSpan="6" className="text-center">No transactions found</td></tr>}
                        {payments.map(p => (
                            <tr key={p.id}>
                                <td>{p.id}</td>
                                <td>{p.bookingId}</td>
                                <td>{p.razorpayOrderId}</td>
                                <td>{p.razorpayPaymentId || "-"}</td>
                                <td>₹{p.amount}</td>
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

export default TransactionHistory;
