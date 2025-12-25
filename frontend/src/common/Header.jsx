import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { verifyJWT, getToken } from "../utils/jwt";
import NotificationBell from "./NotificationBell";

const Header = ({ isDark, toggleTheme }) => {
  const navigate = useNavigate();
  const token = getToken();
  const user = verifyJWT(token);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="glass" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      padding: '0.75rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--glass-border)',
      backdropFilter: 'blur(20px) saturate(180%)',
      backgroundColor: 'rgba(var(--glass-bg-rgb), 0.7)',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
    }}>
      <div className="flex items-center gap-4">
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            fontSize: '1.5rem',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
          }}>
            RIDE SHARE
          </span>
        </Link>

        {/* Theme Toggle (Bulb) */}
        <div
          onClick={toggleTheme}
          style={{
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '12px',
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          title="Toggle Theme"
        >
          <span style={{ fontSize: '1.2rem', filter: isDark ? 'grayscale(1)' : 'none' }}>
            {isDark ? '🌙' : '☀️'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {!user && (
          <>
            <Link to="/login" className="btn" style={{ color: 'var(--text-main)' }}>Sign In</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </>
        )}

        {user && (
          <>
            <div className="flex items-center gap-4">
              {user.role === "user" && (
                <>
                  <Link to="/user-rides" className="nav-item" style={{ textDecoration: 'none', fontWeight: 600, color: 'var(--text-main)' }}>Find Rides</Link>
                  <Link to="/my-bookings" className="nav-item" style={{ textDecoration: 'none', fontWeight: 600, color: 'var(--text-main)' }}>My Bookings</Link>
                </>
              )}
              {user.role === "driver" && (
                <>
                  <Link to="/driver-dashboard" className="nav-item" style={{ textDecoration: 'none', fontWeight: 600, color: 'var(--text-main)' }}>Dashboard</Link>
                  <Link to="/driver/add-ride" className="nav-item" style={{ textDecoration: 'none', fontWeight: 600, color: 'var(--text-main)' }}>Post Ride</Link>
                  <Link to="/driver/reviews" className="nav-item" style={{ textDecoration: 'none', fontWeight: 600, color: 'var(--text-main)' }}>My Reviews</Link>
                  <Link to="/driver/earnings" className="nav-item" style={{ textDecoration: 'none', fontWeight: 600, color: 'var(--text-main)' }}>My Earnings</Link>
                </>
              )}
              {user.role === "admin" && (
                <>
                  <Link to="/dashboard" className="nav-item" style={{ textDecoration: 'none', fontWeight: 600, color: 'var(--text-main)' }}>Admin Panel</Link>
                  <Link to="/admin/users" className="nav-item" style={{ textDecoration: 'none', fontWeight: 600, color: 'var(--text-main)' }}>Users</Link>
                </>
              )}
            </div>

            <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 4px' }}></div>

            <div className="flex items-center gap-4">
              <NotificationBell userEmail={user.email} />

              <div className="flex items-center gap-3">
                <div style={{ textAlign: 'right', display: 'none', '@media (min-width: 768px)': { display: 'block' } }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{user.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</div>
                </div>

                {user.profileImage ? (
                  <img src={user.profileImage} alt="Profile" style={{ width: '36px', height: '36px', borderRadius: '12px', objectFit: 'cover', border: '2px solid var(--glass-border)' }} />
                ) : (
                  <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {user.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>

              <button onClick={handleLogout} className="btn" style={{ padding: '8px', color: 'var(--danger)' }} title="Logout">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Header;

