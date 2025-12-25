// src/admin/AdminUsers.jsx
import React, { useEffect, useState } from "react";
import { apiFetch, getToken, verifyJWT } from "../utils/jwt";
import { useNavigate } from "react-router-dom";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  // load users from backend
  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/admin/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(err.message || "Failed to load users");
      if (err.status === 401 || err.status === 403) {
        // if unauthorized, go to login
        navigate("/login");
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // client-side quick guard: verify token and role
    const token = getToken();
    const user = verifyJWT(token);
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleEdit = async (id, currentRole) => {
    const name = prompt("New name:");
    const email = prompt("New email:");
    const role = prompt("New role (user/driver/admin):", currentRole);
    if (!name || !email || !role) return;
    try {
      await apiFetch(`/api/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name, email, role }),
      });
      await loadUsers();
      alert("User updated.");
    } catch (err) {
      console.error("Edit failed:", err);
      alert(err.message || "Failed to update user");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await apiFetch(`/api/admin/users/${id}`, { method: "DELETE" });
      await loadUsers();
      alert("User deleted.");
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.message || "Failed to delete user");
    }
  };

  const handleApprove = async (id) => {
    try {
      await apiFetch(`/api/admin/users/${id}/approve`, { method: "POST" });
      await loadUsers();
      alert("User approved as admin.");
    } catch (err) {
      console.error("Approve failed:", err);
      alert(err.message || "Failed to approve user");
    }
  };

  const handleRevoke = async (id) => {
    try {
      await apiFetch(`/api/admin/users/${id}/revoke`, { method: "POST" });
      await loadUsers();
      alert("Admin rights revoked.");
    } catch (err) {
      console.error("Revoke failed:", err);
      alert(err.message || "Failed to revoke admin");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await apiFetch(`/api/admin/users/${id}/toggle-status`, { method: "POST" });
      await loadUsers();
    } catch (err) {
      console.error("Toggle failed:", err);
      alert(err.message || "Failed to toggle user status");
    }
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="container">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            User Management
          </h1>
          <p className="text-muted mb-0">Manage roles, permissions and account lifecycle</p>
        </div>
        <div className="flex gap-3">
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            <input
              type="text"
              className="input"
              placeholder="Search name, email, role..."
              style={{ paddingLeft: '40px', width: '300px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="badge primary" style={{ padding: '0.5rem 1rem' }}>{users.length} Total Users</div>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20">
          <div className="spinner mb-4 mx-auto"></div>
          <p className="text-muted">Fetching user directory...</p>
        </div>
      ) : error ? (
        <div className="glass-card text-center py-10 border-danger">
          <p className="text-danger mb-0">Error: {error}</p>
        </div>
      ) : (
        <div className="glass-card slide-up" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-container">
            <table className="table">
              <thead style={{ background: 'rgba(255,255,255,0.03)' }}>
                <tr>
                  <th style={{ padding: '1.5rem' }}>User Info</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Privileges</th>
                  <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-muted">No users matching "{searchTerm}"</td>
                  </tr>
                )}
                {paginatedUsers.map((u, idx) => (
                  <tr key={u.id} className="hover-trigger" style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1.5rem' }}>
                      <div className="flex items-center gap-3">
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{u.name}</div>
                          <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'primary' : u.role === 'driver' ? 'success' : 'secondary'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {u.requestedAdmin ? (
                        <div className="flex items-center gap-2 text-warning" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                          <span style={{ width: '8px', height: '8px', background: 'var(--warning)', borderRadius: '50%' }}></span>
                          PENDING ADMIN
                        </div>
                      ) : (
                        <div className="flex items-center gap-2" style={{ fontSize: '0.75rem', fontWeight: 700, color: u.active ? 'var(--success)' : 'var(--danger)' }}>
                          <span style={{ width: '8px', height: '8px', background: u.active ? 'var(--success)' : 'var(--danger)', borderRadius: '50%' }}></span>
                          {u.active ? 'ENABLED' : 'SUSPENDED'}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {u.superAdmin && <div className="badge primary" style={{ fontSize: '0.6rem' }}>SUPER ADMIN</div>}
                        <div className="badge outline" style={{ fontSize: '0.6rem' }}>ID: {u.id}</div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                      <div className="flex justify-end gap-2">
                        <button
                          className={`btn btn-sm ${u.active ? 'btn-outline' : 'btn-success'}`}
                          onClick={() => handleToggleStatus(u.id)}
                          disabled={u.superAdmin}
                          title={u.active ? "Deactivate User" : "Activate User"}
                          style={{ padding: '0', width: '38px', height: '38px', borderRadius: '10px', opacity: u.superAdmin ? 0.3 : 1 }}
                        >
                          {u.active ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          )}
                        </button>

                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => handleEdit(u.id, u.role)}
                          title="Edit User"
                          style={{ padding: '0', width: '38px', height: '38px', borderRadius: '10px' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>


                        {u.role === "pending-admin" && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleApprove(u.id)}
                            title="Approve Admin Request"
                            style={{ padding: '6px', width: '32px', height: '32px' }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </button>
                        )}

                        {u.role === "admin" && !u.superAdmin && (
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleRevoke(u.id)}
                            title="Revoke Admin Rights"
                            style={{ padding: '6px', width: '32px', height: '32px' }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                          </button>
                        )}

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(u.id)}
                          title="Delete User"
                          disabled={u.superAdmin}
                          style={{ padding: '0', width: '38px', height: '38px', borderRadius: '10px', opacity: u.superAdmin ? 0.3 : 1 }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredUsers.length > itemsPerPage && (
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
      )}
    </div>
  );
};

export default AdminUsers;
