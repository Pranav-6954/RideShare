import React, { useEffect, useState } from "react";
import { apiFetch, getToken, verifyJWT } from "../utils/jwt";
import { useNavigate } from "react-router-dom";
import { useToast } from "../common/ToastContainer";
import ConfirmModal from "../common/ConfirmModal";

const VehiclesList = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const nav = useNavigate();
  const { showToast } = useToast();
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

  const fetchRides = () => {
    setLoading(true);
    // Use Admin endpoint to see ALL rides
    apiFetch("/api/admin/rides")
      .then(data => setList(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(err);
        setList([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const token = getToken();
    const user = verifyJWT(token);
    if (!user || user.role !== "ROLE_ADMIN") {
      nav("/login");
      return;
    }
    fetchRides();
  }, [nav]);

  const remove = async (id) => {
    setConfirmModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    const { id } = confirmModal;
    setConfirmModal({ isOpen: false, id: null });
    try {
      await apiFetch(`/api/rides/${id}`, { method: "DELETE" });
      setList(list.filter(v => v.id !== id));
      showToast("Ride deleted successfully", 'success');
    } catch (err) {
      showToast(err.message || "Failed to delete ride", 'error');
    }
  };

  const filtered = list.filter(v =>
    v.fromLocation?.toLowerCase().includes(search.toLowerCase()) ||
    v.toLocation?.toLowerCase().includes(search.toLowerCase()) ||
    v.driverEmail?.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      <div className="animate-slide-up" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>Ride Moderation</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor and manage all active rides on the platform</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: '300px' }}>
            <input className="input"
              style={{ marginBottom: 0, padding: '0.75rem 1rem 0.75rem 2.5rem' }}
              placeholder="Search routes or drivers..."
              value={search}
              onChange={e => setSearch(e.target.value)} />
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
          </div>
          <button className="btn btn-primary" onClick={() => nav("/admin/add-vehicle")}>+ Create Ride</button>
        </div>
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: '5rem' }}><h3>Scanning network for rides...</h3></div>
      ) : (
        <div className="card glass animate-slide-up" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '25%', padding: '1.2rem 1.5rem' }}>Driver Info</th>
                  <th style={{ width: '25%', padding: '1.2rem 1.5rem' }}>Route / Path</th>
                  <th style={{ width: '15%', padding: '1.2rem 1.5rem' }}>Schedule</th>
                  <th style={{ width: '10%', padding: '1.2rem 1.5rem' }}>Capacity</th>
                  <th style={{ width: '10%', padding: '1.2rem 1.5rem' }}>Economy</th>
                  <th style={{ textAlign: 'right', padding: '1.2rem 1.5rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>No active rides match your criteria</td></tr>
                )}
                {filtered.map((v, idx) => (
                  <tr key={v.id} style={{ animationDelay: `${idx * 0.05}s` }} className="animate-slide-up">
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <div style={{ fontWeight: 600 }}>{v.driverName || "Independent Driver"}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v.driverEmail}</div>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <div style={{ fontWeight: 600 }}>{v.fromLocation} → {v.toLocation}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary)', opacity: 0.7 }}>{v.route || "Direct Route"}</div>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <div style={{ fontWeight: 600 }}>{v.date}</div>
                      {v.time && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.time}</div>}
                      <div style={{ fontSize: '0.8rem' }}><span className="badge" style={{ background: 'var(--neutral-100)', padding: '2px 8px' }}>{v.vehicleType}</span></div>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <div style={{ fontWeight: 700, color: v.tickets < 5 ? 'var(--danger)' : 'inherit' }}>{v.tickets} Seats</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Remaining</div>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--success)' }}>₹{v.price}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Per passenger</div>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => nav(`/admin/edit-vehicle/${v.id}`)}>Edit</button>
                        <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => remove(v.id)}>Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Ride"
        message="Are you sure you want to permanently remove this ride? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
        type="danger"
      />
    </div>
  );
};

export default VehiclesList;
