// src/components/PaymentPage.jsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyJWT } from "../utils/jwt";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = verifyJWT(localStorage.getItem("token"));

  const bookingData = location.state?.bookingData || null;

  useEffect(() => {
    if (!user || user.role !== "user") return navigate("/login");
    if (!bookingData) return navigate("/user-rides");
  }, [bookingData, navigate, user]);

  if (!bookingData || !bookingData.bus) {
    return (
      <div className="container">
        <h2>No booking data found.</h2>
      </div>
    );
  }

  const { bus, seats, passengerNames, busIndex } = bookingData;

  const handleConfirmPayment = () => {
    // save booking now
    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    const newBooking = {
      userEmail: user.email,
      busIndex,
      seats,
      passengerNames,
      bus,
    };
    bookings.push(newBooking);
    localStorage.setItem("bookings", JSON.stringify(bookings));

    // reduce seat count
    const buses = JSON.parse(localStorage.getItem("buses")) || [];
    if (buses[busIndex]) {
      const remaining = (buses[busIndex].tickets || 0) - seats;
      buses[busIndex].tickets = remaining > 0 ? remaining : 0;
      localStorage.setItem("buses", JSON.stringify(buses));
    }

    navigate("/payment-success", { state: { booking: newBooking } });
  };

  return (
    <div className="container">
      <h2>Payment</h2>
      <p>Please confirm your ride and proceed to payment.</p>

      <h3>Ride Details</h3>
      <p>
        <strong>From:</strong> {bus.from} <br />
        <strong>To:</strong> {bus.to} <br />
        <strong>Date:</strong> {bus.date} <br />
        <strong>Vehicle:</strong> {bus.vehicleType} <br />
        <strong>Price per seat:</strong> {bus.price}
      </p>

      <h3>Passengers</h3>
      <p>
        <strong>Seats:</strong> {seats}
      </p>
      <ul>
        {passengerNames.map((n, i) => (
          <li key={i}>{n}</li>
        ))}
      </ul>

      <h3>Total Amount</h3>
      <p>{Number(bus.price) * Number(seats)}</p>

      <button onClick={handleConfirmPayment}>Confirm &amp; Pay</button>
    </div>
  );
};

export default PaymentPage;
