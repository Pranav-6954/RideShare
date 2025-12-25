import { Link, Outlet, useNavigate } from "react-router-dom";
import "../index.css";

const Layout = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      <header>
        <h1>Admin Dashboard</h1>
        <nav>
          {!token && <Link to="/login">Login</Link>}
          {!token && <Link to="/register">Register</Link>}
          {token && <button onClick={handleLogout}>Logout</button>}
        </nav>
      </header>
      <div className="container">
        <div className="sidebar">
          <h2>Menu</h2>
          {token && <Link to="/dashboard">Dashboard</Link>}
        </div>
        <div className="main">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Layout;
