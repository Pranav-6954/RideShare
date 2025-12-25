import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8084";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user", confirmPassword: "", gender: "Male", profileImage: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      setErr("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          gender: form.gender,
          profileImage: form.profileImage
        })
      });

      const text = await res.text();
      let data = null;
      try { data = JSON.parse(text); } catch (e) { data = text; }

      if (!res.ok) {
        const errorMsg = (typeof data === 'object' && data?.error) ? data.error : (typeof data === 'string' ? data : "Registration failed.");
        setErr(errorMsg);
        setLoading(false);
        return;
      }

      setMsg("Account created successfully! Redirecting to login...");
      setTimeout(() => nav("/login"), 2000);
    } catch (networkError) {
      setErr(networkError.message || "Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center" style={{ minHeight: '90vh', padding: '2rem 0' }}>
      <div className="glass-card fade-in" style={{ maxWidth: '600px', width: '100%' }}>
        <div className="text-center mb-8">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Join Ride Share
          </h1>
          <p className="text-muted">Create your account to start sharing rides</p>
        </div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="label">Full Name</label>
            <input
              className="input"
              placeholder="John Doe"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="label">Email Address</label>
            <input
              className="input"
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="label">Confirm Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="label">Gender</label>
              <select className="select" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">I want to be a</label>
              <select className="select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="user">Passenger</option>
                <option value="driver">Driver</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Profile Picture URL (Optional)</label>
            <input
              className="input"
              type="text"
              placeholder="https://..."
              value={form.profileImage}
              onChange={(e) => setForm({ ...form, profileImage: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1rem' }} disabled={loading}>
            {loading ? "Creating Account..." : "Register Now"}
          </button>
        </form>

        {msg && (
          <div className="badge badge-success text-center mt-6" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            {msg}
          </div>
        )}

        {err && (
          <div className="badge badge-danger text-center mt-6" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            {err}
          </div>
        )}

        <div className="text-center mt-8">
          <p className="text-muted">
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

