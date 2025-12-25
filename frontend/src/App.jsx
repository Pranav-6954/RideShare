import React, { useState, useEffect } from "react";
import Snowfall from "react-snowfall";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

/* Common */
import Header from "./common/Header";
import ProtectedRoute from "./common/ProtectedRoute";
import RootRedirect from "./components/RootRedirect";

/* Auth */
import Login from "./auth/Login";
import Register from "./auth/Register";

/* Admin */
import Dashboard from "./admin/Dashboard";
import AdminUsers from "./admin/AdminUsers";
import AddVehicle from "./admin/AddVehicle";
import VehiclesList from "./admin/VehiclesList";
import DriverDashboard from "./driver/DriverDashboard";
import DriverReserve from "./driver/DriverReserve";
import DriverHistory from "./driver/DriverHistory";
import DriverReviews from "./driver/DriverReviews";
import DriverEarnings from "./driver/DriverEarnings";

/* User */
import UserBus from "./user/UserBus";

/* Bookings */
import BookingForm from "./bookings/BookingForm";
import ConfirmBooking from "./bookings/ConfirmBooking";
import UserBookings from "./bookings/UserBookings";
import PaymentSuccess from "./bookings/PaymentSuccess";
import PaymentPage from "./bookings/PaymentPage";

export default function App() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === "dark" || (!saved && prefersDark)) {
      document.body.classList.add("dark-mode");
      setIsDark(true);
    } else {
      document.body.classList.add("light-mode");
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.body.classList.remove("dark-mode");
      document.body.classList.add("light-mode");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.body.classList.remove("light-mode");
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <Router>
      <Snowfall
        snowflakeCount={isDark ? 200 : 100}
        color={isDark ? "#ffffff" : "#acc1ff"}
        style={{
          position: "fixed",
          width: "100vw",
          height: "100vh",
          zIndex: 1000,
          pointerEvents: "none",
        }}
      />
      <Header isDark={isDark} toggleTheme={toggleTheme} />
      <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
        <Routes>
          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/add-vehicle" element={<ProtectedRoute allowedRoles={["admin"]}><AddVehicle /></ProtectedRoute>} />
          <Route path="/admin/edit-vehicle/:id" element={<ProtectedRoute allowedRoles={["admin"]}><AddVehicle /></ProtectedRoute>} />
          <Route path="/admin/vehicles" element={<ProtectedRoute allowedRoles={["admin"]}><VehiclesList /></ProtectedRoute>} />

          {/* Driver */}
          <Route path="/driver-dashboard" element={<ProtectedRoute allowedRoles={["driver"]}><DriverDashboard /></ProtectedRoute>} />
          <Route path="/driver/reserve/:id" element={<ProtectedRoute allowedRoles={["driver"]}><DriverReserve /></ProtectedRoute>} />
          <Route path="/driver/add-ride" element={<ProtectedRoute allowedRoles={["driver"]}><AddVehicle /></ProtectedRoute>} />
          <Route path="/driver/history" element={<ProtectedRoute allowedRoles={["driver"]}><DriverHistory /></ProtectedRoute>} />
          <Route path="/driver/reviews" element={<ProtectedRoute allowedRoles={["driver"]}><DriverReviews /></ProtectedRoute>} />

          {/* User */}
          <Route path="/user-rides" element={<ProtectedRoute allowedRoles={["user"]}><UserBus /></ProtectedRoute>} />
          <Route path="/book/:id" element={<ProtectedRoute allowedRoles={["user"]}><BookingForm /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute allowedRoles={["user"]}><PaymentPage /></ProtectedRoute>} />
          <Route path="/confirm-booking" element={<ProtectedRoute allowedRoles={["user"]}><ConfirmBooking /></ProtectedRoute>} />
          <Route path="/booking-success" element={<ProtectedRoute allowedRoles={["user"]}><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute allowedRoles={["user"]}><UserBookings /></ProtectedRoute>} />

          {/* fallback -> login */}
          <Route path="*" element={<Login />} />
        </Routes>
      </main>
    </Router>
  );
}
