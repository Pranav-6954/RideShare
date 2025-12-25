import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { saveToken, verifyJWT, apiFetch } from "../utils/jwt";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8084";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = verifyJWT();
    if (user) {
      apiFetch("/api/auth/me")
        .then(data => {
          const role = data.role ? data.role.toLowerCase() : "user";
          if (role === "admin") nav("/dashboard");
          else if (role === "driver") nav("/driver-dashboard");
          else nav("/user-rides");
        })
        .catch(() => {
          localStorage.removeItem("token");
        });
    }
  }, [nav]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const text = await res.text();
      let data = null;
      try { data = JSON.parse(text); } catch (e) { data = text; }

      if (!res.ok) {
        setErr((typeof data === 'object' && data?.error) ? data.error : "Login failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      saveToken(data.token);
      const role = data.role ? data.role.toLowerCase() : "user";

      // Check for 'from' state to redirect back to intended page
      const from = location.state?.from?.pathname + location.state?.from?.search || "";

      if (from) {
        nav(from, { replace: true });
      } else if (role === "admin") {
        nav("/dashboard");
      } else if (role === "driver") {
        nav("/driver-dashboard");
      } else {
        nav("/user-rides");
      }
    } catch (error) {
      setErr(error.message || "Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center" style={{ minHeight: '80vh' }}>
      <div className="glass-card fade-in" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="text-center mb-8">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Welcome Back
          </h1>
          <p className="text-muted">Sign in to continue your journey</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="label">Email Address</label>
            <input
              className="input"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1rem' }} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {err && (
          <div className="badge badge-danger text-center mt-6" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            {err}
          </div>
        )}

        <div className="text-center mt-8">
          <p className="text-muted">
            Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

