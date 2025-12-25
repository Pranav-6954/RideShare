import React, { useEffect, useState } from "react";
import { apiFetch } from "../utils/jwt";
import { useNavigate } from "react-router-dom";

const UserBus = () => {
  const [buses, setBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ from: "", to: "", date: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const nav = useNavigate();

  const fetchRides = (queryParams = "") => {
    setLoading(true);
    apiFetch(`/api/vehicles/search${queryParams}`)
      .then((data) => {
        setBuses(data);
        setFilteredBuses(data);
        setCurrentPage(1); // Reset to first page on new fetch
      })
      .catch(() => {
        setBuses([]);
        setFilteredBuses([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.from) params.append("from", search.from);
    if (search.to) params.append("to", search.to);
    if (search.date) params.append("date", search.date);

    setLoading(true);
    apiFetch(`/api/vehicles/search?${params.toString()}`).then(data => {
      setFilteredBuses(data);
      setCurrentPage(1);
    }).finally(() => setLoading(false));
  };

  const resetSearch = () => {
    setSearch({ from: "", to: "", date: "" });
    fetchRides();
  };

  return (
    <div className="container">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Find Your Next Ride
          </h1>
          <p className="text-muted">Safe, affordable, and shared rides anywhere you want to go.</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="glass-card mb-12" style={{ padding: '2rem' }}>
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="form-group mb-0">
            <label className="label">From</label>
            <input
              className="input"
              placeholder="e.g. Mumbai"
              value={search.from}
              onChange={(e) => setSearch({ ...search, from: e.target.value })}
            />
          </div>
          <div className="form-group mb-0">
            <label className="label">To</label>
            <input
              className="input"
              placeholder="e.g. Pune"
              value={search.to}
              onChange={(e) => setSearch({ ...search, to: e.target.value })}
            />
          </div>
          <div className="form-group mb-0">
            <label className="label">Date</label>
            <input
              type="date"
              className="input"
              value={search.date}
              onChange={(e) => setSearch({ ...search, date: e.target.value })}
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              Search Rides
            </button>
            <button type="button" className="btn btn-secondary" onClick={resetSearch} style={{ padding: '12px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
            </button>
          </div>
        </form>
      </div>

      {/* Ride Results */}
      {loading ? (
        <div className="text-center py-20">
          <div className="spinner"></div>
          <p className="mt-4 text-muted">Searching for available rides...</p>
        </div>
      ) : filteredBuses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 fade-in">
            {filteredBuses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((v) => (
              <div key={v.id} className="glass-card flex flex-column h-full transition-all hover:-translate-y-2" style={{ padding: '0', overflow: 'hidden' }}>
                {/* Vehicle Image / Header */}
                <div style={{ position: 'relative', height: '180px', background: 'var(--primary-glow)' }}>
                  {v.imageUrl ? (
                    <img src={v.imageUrl} alt="Vehicle" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="flex items-center justify-center h-full" style={{ color: 'var(--primary)', opacity: 0.4 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 22 8 22 13 16 13 16 8"></polygon><circle cx="4.5" cy="18.5" r="2.5"></circle><circle cx="12.5" cy="18.5" r="2.5"></circle></svg>
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                    <span className="badge success" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>₹{v.price}</span>
                  </div>
                  <div style={{ position: 'absolute', bottom: '1rem', left: '1rem' }}>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                      {v.vehicleType}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '1.5rem', flex: 1 }}>
                  <div className="flex justify-between items-start mb-4">
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Route</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem' }}>
                        {v.fromLocation} <span style={{ color: 'var(--primary)' }}>&rarr;</span> {v.toLocation}
                      </div>
                    </div>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(v.fromLocation)}&destination=${encodeURIComponent(v.toLocation)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary"
                      style={{ padding: '8px', borderRadius: '10px' }}
                      title="View on Maps"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="3"></circle><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"></path></svg>
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Departure</div>
                      <div style={{ fontWeight: 600 }}>{v.date}</div>
                    </div>
                    <div className="text-right">
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Available Seats</div>
                      <div style={{ fontWeight: 600, color: v.tickets < 3 ? 'var(--danger)' : 'var(--success)' }}>{v.tickets} Seats</div>
                    </div>
                  </div>

                  {/* Driver Info */}
                  <div className="flex items-center gap-3 mt-auto pt-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
                    {v.driverImage ? (
                      <img src={v.driverImage} alt="Driver" style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--secondary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--accent)' }}>
                        {v.driverName?.charAt(0) || 'D'}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{v.driverName}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Verified Driver</div>
                    </div>
                    <button
                      className="btn btn-accent btn-sm"
                      onClick={() => nav(`/book/${v.id}`)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {filteredBuses.length > itemsPerPage && (
            <div className="flex justify-center items-center mt-12 gap-4">
              <button
                className="btn btn-secondary"
                style={{ padding: '10px 20px' }}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                &larr; Previous
              </button>
              <div className="glass-card" style={{ padding: '10px 20px', fontWeight: 600 }}>
                Page {currentPage} of {Math.ceil(filteredBuses.length / itemsPerPage)}
              </div>
              <button
                className="btn btn-secondary"
                style={{ padding: '10px 20px' }}
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredBuses.length / itemsPerPage), p + 1))}
                disabled={currentPage === Math.ceil(filteredBuses.length / itemsPerPage)}
              >
                Next &rarr;
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="glass-card text-center py-20">
          <div style={{ padding: '32px', background: 'var(--primary-glow)', borderRadius: '50%', width: 'fit-content', margin: '0 auto 2rem', color: 'var(--primary)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>No matching rides found</h2>
          <p className="text-muted" style={{ maxWidth: '400px', margin: '0 auto 2rem' }}>Try adjusting your source, destination, or date filters to find available carpooling options.</p>
          <button className="btn btn-secondary btn-primary" style={{ padding: '12px 30px' }} onClick={resetSearch}>Clear All Filters</button>
        </div>
      )}
    </div>
  );
};

export default UserBus;

