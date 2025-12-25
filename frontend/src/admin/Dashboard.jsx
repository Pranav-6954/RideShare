// src/admin/Dashboard.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch, getToken, verifyJWT } from "../utils/jwt";

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0, drivers: 0, vehicles: 0, bookings: 0,
    cancelledBookings: 0, totalVolume: 0, totalRides: 0,
    onlineVolume: 0, cashVolume: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    const user = verifyJWT(token);
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [statsData, activityData] = await Promise.all([
          apiFetch("/api/admin/stats/detailed"),
          apiFetch("/api/admin/activity")
        ]);

        setStats({
          users: statsData.userCount,
          drivers: statsData.driverCount,
          vehicles: statsData.totalRides,
          bookings: statsData.totalBookings,
          cancelledBookings: statsData.cancelledBookings,
          totalVolume: statsData.totalVolume,
          totalRides: statsData.totalRides,
          onlineVolume: statsData.onlineVolume,
          cashVolume: statsData.cashVolume
        });
        setActivities(activityData);

      } catch (err) {
        console.error("Dashboard load failed:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  return (
    <div className="container">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Admin Command Center
          </h1>
          <p className="text-muted mb-0">Real-time platform performance & logistics</p>
        </div>
        <div className="flex gap-3">
          <Link className="btn btn-primary" to="/admin/users">Manage Users</Link>
          <Link className="btn btn-outline" to="/admin/vehicles">Review Rides</Link>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20">
          <div className="spinner mb-4 mx-auto"></div>
          <p className="text-muted">Analyzing platform data...</p>
        </div>
      ) : error ? (
        <div className="glass-card text-center py-10 border-danger">
          <p className="text-danger mb-0">Error: {error}</p>
          <button className="btn btn-sm btn-outline mt-4" onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="glass-card slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex justify-between items-start mb-4">
                <div style={{ padding: '12px', background: 'var(--primary-glow)', borderRadius: '12px', color: 'var(--primary)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <div className="badge primary">Users</div>
              </div>
              <h3 className="mb-1" style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.users.toLocaleString()}</h3>
              <p className="text-muted text-xs mb-0 uppercase tracking-wider font-bold opacity-60">Total Registered Passengers</p>
            </div>

            <div className="glass-card slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex justify-between items-start mb-4">
                <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--success)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </div>
                <div className="badge success">Drivers</div>
              </div>
              <h3 className="mb-1" style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.drivers.toLocaleString()}</h3>
              <p className="text-muted text-xs mb-0 uppercase tracking-wider font-bold opacity-60">Verified Platform Partners</p>
            </div>

            <div className="glass-card slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex justify-between items-start mb-4">
                <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
                </div>
                <div className="badge secondary">Rides</div>
              </div>
              <h3 className="mb-1" style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.totalRides.toLocaleString()}</h3>
              <p className="text-muted text-xs mb-0 uppercase tracking-wider font-bold opacity-60">Total Rides Created</p>
            </div>

            <div className="glass-card slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex justify-between items-start mb-4">
                <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', color: 'var(--warning)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line><line x1="7" y1="15" x2="17" y2="15"></line></svg>
                </div>
                <div className="badge warning">Bookings</div>
              </div>
              <h3 className="mb-1" style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.bookings.toLocaleString()}</h3>
              <p className="text-muted text-xs mb-0 uppercase tracking-wider font-bold opacity-60">{stats.cancelledBookings} Cancellations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 glass-card slide-up" style={{ animationDelay: '0.5s', background: 'var(--primary-glow)' }}>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h4 className="mb-1">Platform Revenue</h4>
                  <p className="text-muted text-xs mb-0">Total transaction volume across all methods</p>
                </div>
                <div className="text-right">
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>₹{stats.totalVolume.toLocaleString()}</div>
                  <div className="badge success">Total Volume</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Online (Stripe)</span>
                  </div>
                  <h4 className="mb-0">₹{stats.onlineVolume?.toLocaleString() || 0}</h4>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginTop: '1rem', overflow: 'hidden' }}>
                    <div style={{ width: `${(stats.onlineVolume / (stats.totalVolume || 1)) * 100}%`, height: '100%', background: 'var(--primary)' }}></div>
                  </div>
                </div>

                <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)' }}></div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Cash Payments</span>
                  </div>
                  <h4 className="mb-0">₹{stats.cashVolume?.toLocaleString() || 0}</h4>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginTop: '1rem', overflow: 'hidden' }}>
                    <div style={{ width: `${(stats.cashVolume / (stats.totalVolume || 1)) * 100}%`, height: '100%', background: 'var(--accent)' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card slide-up" style={{ animationDelay: '0.6s' }}>
              <h4 className="mb-6">Cancellations</h4>
              <div className="text-center py-6">
                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--warning)', marginBottom: '0.5rem' }}>
                  {((stats.cancelledBookings / (stats.bookings || 1)) * 100).toFixed(1)}%
                </div>
                <p className="text-muted">Churn Rate</p>
              </div>
              <div className="flex justify-between items-center p-3 glass mb-2" style={{ borderRadius: 'var(--radius-sm)' }}>
                <span className="text-sm">Confirmed Bookings</span>
                <span className="font-bold">{stats.bookings - stats.cancelledBookings}</span>
              </div>
              <div className="flex justify-between items-center p-3 glass" style={{ borderRadius: 'var(--radius-sm)' }}>
                <span className="text-sm">Cancelled/Rejected</span>
                <span className="font-bold text-danger">{stats.cancelledBookings}</span>
              </div>
            </div>
          </div>

          <div className="glass-card slide-up" style={{ animationDelay: '0.7s' }}>
            <h4 className="mb-6">Recent Platform Activity</h4>
            <div className="grid grid-cols-1 gap-2">
              {activities.length === 0 && <p className="text-center py-10 text-muted">No recent events tracked.</p>}
              {activities.map((act, i) => {
                const getIcon = () => {
                  if (act.type === 'USER_REGISTRATION') return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
                  if (act.type === 'RIDE_CREATED') return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 22 8 22 13 16 13 16 8"></polygon><circle cx="4.5" cy="18.5" r="2.5"></circle><circle cx="12.5" cy="18.5" r="2.5"></circle></svg>;
                  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M3 10h18"></path></svg>;
                };
                return (
                  <div key={i} className="flex items-center gap-4 p-4 glass hover-trigger" style={{ borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', color: 'var(--primary)' }}>
                      {getIcon()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{act.message}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{act.user} • {act.type.replace(/_/g, ' ')}</div>
                    </div>
                    <div className="badge outline" style={{ fontSize: '0.6rem' }}>RECENT</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
