import React, { useState, useEffect } from "react";
import { apiFetch, verifyJWT } from "../utils/jwt";
import { useNavigate, useParams } from "react-router-dom";

const AddVehicle = () => {
  const { id } = useParams();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const [tickets, setTickets] = useState("");
  const [type, setType] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [route, setRoute] = useState("");
  const [reservedSeats, setReservedSeats] = useState(0);
  const [phone, setPhone] = useState("");

  const nav = useNavigate();
  const isEdit = !!id;
  const [recommendedPrice, setRecommendedPrice] = useState(0);
  const [manualRoute, setManualRoute] = useState(false);

  useEffect(() => {
    if (from && to) {
      const timer = setTimeout(() => {
        // We only send the route if the user purposefully edited it, 
        // otherwise let backend suggest a route for this pair.
        const body = { fromLocation: from, toLocation: to };
        if (manualRoute) body.viaRoute = route;

        apiFetch("/api/fare/calculate", {
          method: "POST",
          body: JSON.stringify(body)
        })
          .then(data => {
            setRecommendedPrice(data.recommendedPrice);
            // ONLY auto-suggest route if user hasn't manually edited yet
            if (data.suggestedRoute && (!route || !manualRoute)) {
              setRoute(data.suggestedRoute);
            }
          })
          .catch(console.error);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [from, to]); // REMOVED route from dependencies to prevent infinite loop

  useEffect(() => {
    if (isEdit) {
      apiFetch(`/api/vehicles/${id}`).then(v => {
        setFrom(v.fromLocation);
        setTo(v.toLocation);
        setDate(v.date);
        setPrice(v.price);
        setTickets(v.tickets);
        setType(v.vehicleType);
        setImageUrl(v.imageUrl || "");
        setRoute(v.route || "");
        setPhone(v.driverPhone || "");
        setManualRoute(true); // Edit mode usually has a saved route

        apiFetch("/api/fare/calculate", {
          method: "POST",
          body: JSON.stringify({ fromLocation: v.fromLocation, toLocation: v.toLocation, viaRoute: v.route })
        }).then(d => setRecommendedPrice(d.recommendedPrice)).catch(console.error);
      }).catch(err => {
        alert("Failed to load vehicle details");
        nav("/admin/vehicles");
      });
    }
  }, [id, isEdit, nav]);

  const submit = async (e) => {
    e.preventDefault();
    if (recommendedPrice > 0 && Number(price) > recommendedPrice) {
      const proceed = window.confirm(`Your price (₹${price}) is higher than the recommended fare (₹${recommendedPrice}). High prices may result in fewer bookings. Do you want to proceed?`);
      if (!proceed) return;
    }
    try {
      const body = {
        fromLocation: from,
        toLocation: to,
        date,
        price: Number(price),
        tickets: Number(tickets),
        vehicleType: type,
        imageUrl,
        route,
        reservedSeats: Number(reservedSeats),
        driverPhone: phone
      };

      if (isEdit) {
        await apiFetch(`/api/vehicles/${id}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        await apiFetch("/api/vehicles", { method: "POST", body: JSON.stringify(body) });
      }
      const user = verifyJWT();
      if (user?.role === "driver") nav("/driver-dashboard");
      else nav("/admin/vehicles");
    } catch (err) { alert(err.message || "Error"); }
  };

  // Helper functions for route chips
  const addStop = () => {
    if (newStop) {
      const stops = route ? route.split(" -> ") : [];
      // Insert before destination (if exists in list, else append)
      // Logic: we want the list to be distinct. 
      // Current simulation: "From -> Stop1 -> Stop2 -> To".
      // We will rebuild the string.
      // Easiest is to treat "route" string as the source of truth.
      if (!stops.includes(newStop)) {
        if (stops.length >= 2) {
          stops.splice(stops.length - 1, 0, newStop);
        } else {
          stops.push(newStop);
        }
        setRoute(stops.join(" -> "));
      }
      setManualRoute(true);
      setNewStop("");
    }
  };

  const removeStop = (stopToRemove) => {
    const stops = route.split(" -> ");
    const newStops = stops.filter(s => s !== stopToRemove);
    setRoute(newStops.join(" -> "));
    setManualRoute(true);
  };

  // Local state for the "Add stop" input
  const [newStop, setNewStop] = useState("");

  return (
    <div className="container mt-4">
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 className="mb-4 text-center">{isEdit ? "Edit Ride" : "Add New Ride"}</h2>
        <form onSubmit={submit}>
          <div className="grid grid-cols-2 gap-2">
            <div className="form-group">
              <label className="label">From Location</label>
              <input className="input" placeholder="e.g. New York" value={from} onChange={e => setFrom(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="label">To Location</label>
              <input className="input" placeholder="e.g. Boston" value={to} onChange={e => setTo(e.target.value)} required />
            </div>
          </div>

          {/* Via Route Input with Map Button */}
          <div className="form-group">
            <div className="flex justify-between items-center mb-1">
              <label className="label mb-0">Via Route (Waypoints)</label>
              <div className="flex gap-2">
                {manualRoute && (
                  <button
                    type="button"
                    className="btn btn-xs btn-outline btn-warning"
                    onClick={() => { setRoute(""); setManualRoute(false); }}
                  >
                    🔄 Reset suggestions
                  </button>
                )}
                {(from && to) && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&waypoints=${encodeURIComponent(route.split(' -> ').slice(1, -1).join('|'))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-xs btn-outline btn-primary"
                    title="View Route on Google Maps"
                  >
                    🗺️ View Map
                  </a>
                )}
              </div>
            </div>

            <div className="p-2 border rounded bg-gray-50 flex flex-wrap gap-2 min-h-[45px]">
              {/* Start Point */}
              <span className="badge badge-primary font-bold">{from || "?"}</span>
              <span className="text-gray-400">→</span>

              {/* Chips */}
              {route.split(" -> ").slice(1, -1).map((stop, i) => (
                <React.Fragment key={i}>
                  <div className="badge badge-secondary gap-1 pr-1">
                    {stop}
                    <button type="button" onClick={() => removeStop(stop)} className="btn btn-ghost btn-xs text-white hover:bg-red-600 circle h-4 w-4 min-h-0 p-0 flex items-center justify-center rounded-full leading-none">×</button>
                  </div>
                  <span className="text-gray-400">→</span>
                </React.Fragment>
              ))}

              {/* End Point */}
              <span className="badge badge-primary font-bold">{to || "?"}</span>

              <div className="flex items-center gap-1 ml-auto">
                <input
                  className="input input-xs border-gray-300 w-32"
                  placeholder="+ Stop"
                  value={newStop}
                  onChange={e => setNewStop(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addStop(); } }}
                />
                <button type="button" onClick={addStop} className="btn btn-xs btn-success">+</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="form-group">
              <label className="label">Date</label>
              <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="label">Vehicle Type</label>
              <input className="input" placeholder="e.g. Bus, Van, Sedan" value={type} onChange={e => setType(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="form-group">
              <label className="label">Price</label>
              <input
                className="input"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
              />
              {recommendedPrice > 0 && (
                <small className="block mt-1 text-sm font-bold text-success">
                  Max Recommended Price: ₹{recommendedPrice}
                </small>
              )}
              {price > recommendedPrice && recommendedPrice > 0 && (
                <small className="block mt-1 text-sm font-bold text-danger">
                  Error: Price cannot exceed ₹{recommendedPrice}
                </small>
              )}
            </div>
            <div className="form-group">
              <label className="label">Available Seats (Total)</label>
              <input className="input" type="number" placeholder="e.g. 40" value={tickets} onChange={e => setTickets(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="label">Mobile Number</label>
              <input className="input" placeholder="e.g. +1234567890" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="label">Reserve for Self</label>
              <input className="input" type="number" min="0" max={tickets} value={reservedSeats} onChange={e => setReservedSeats(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Image URL (Optional)</label>
            <input className="input" placeholder="https://example.com/bus.jpg" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>{isEdit ? "Update Ride" : "Add Ride"}</button>
        </form>
      </div>
    </div>
  );
};

export default AddVehicle;
