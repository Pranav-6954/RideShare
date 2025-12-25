import React, { useEffect, useState } from "react";
import { apiFetch } from "../utils/jwt";
import { useNavigate } from "react-router-dom";

const VehiclesList = () => {
  const [list, setList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const nav = useNavigate();
  useEffect(() => { apiFetch("/api/vehicles").then(setList).catch(() => setList([])); }, []);
  const remove = async (id) => { if (!confirm("Delete?")) return; await apiFetch(`/api/vehicles/${id}`, { method: "DELETE" }); setList(list.filter(v => v.id !== id)); };
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = list.filter(v =>
    v.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.toLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.driverEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vehicleType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="container">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Ride Logistics
          </h1>
          <p className="text-muted mb-0">Monitor and manage all active vehicle deployments</p>
        </div>
        <div className="flex gap-3">
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            <input
              type="text"
              className="input"
              placeholder="Search location, driver, type..."
              style={{ paddingLeft: '40px', width: '300px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => nav("/admin/add-vehicle")}>+ Create Ride</button>
        </div>
      </header>

      <div className="glass-card slide-up" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-container">
          <table className="table">
            <thead style={{ background: 'rgba(255,255,255,0.03)' }}>
              <tr>
                <th style={{ padding: '1.5rem' }}>Driver & Vehicle</th>
                <th>Route Info</th>
                <th>Date</th>
                <th>Capacity</th>
                <th>Pricing</th>
                <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-muted">No rides found matching your criteria.</td>
                </tr>
              )}
              {paginated.map(v => (
                <tr key={v.id} className="hover-trigger" style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1.5rem' }}>
                    <div className="flex items-center gap-3">
                      <div style={{ fontSize: '1.5rem' }}>{v.vehicleType === 'CAR' ? '🚗' : '🚐'}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{v.driverName || "Official Partner"}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{v.driverEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span style={{ fontWeight: 600 }}>{v.fromLocation}</span>
                      <span style={{ opacity: 0.3 }}>➜</span>
                      <span style={{ fontWeight: 600 }}>{v.toLocation}</span>
                    </div>
                    <div className="badge outline" style={{ fontSize: '0.6rem', marginTop: '4px' }}>{v.vehicleType}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{new Date(v.date).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span style={{ fontWeight: 600 }}>{v.tickets}</span>
                      <span className="text-muted text-xs">seats left</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, color: 'var(--success)' }}>₹{v.price}</div>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                    <div className="flex justify-end gap-2">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => nav(`/admin/edit-vehicle/${v.id}`)}
                        title="Edit Ride"
                        style={{ padding: '0', width: '38px', height: '38px', borderRadius: '10px' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => remove(v.id)}
                        title="Delete Ride"
                        style={{ padding: '0', width: '38px', height: '38px', borderRadius: '10px' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filtered.length > itemsPerPage && (
          <div className="flex justify-center items-center py-6 gap-4" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--glass-border)' }}>
            <button
              className="btn btn-sm btn-secondary"
              style={{ padding: '8px 16px' }}
              onClick={() => {
                setCurrentPage(p => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === 1}
            >
              &larr; Previous
            </button>
            <div className="text-sm font-bold opacity-70">
              Page {currentPage} of {totalPages}
            </div>
            <button
              className="btn btn-sm btn-secondary"
              style={{ padding: '8px 16px' }}
              onClick={() => {
                setCurrentPage(p => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === totalPages}
            >
              Next &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehiclesList;
