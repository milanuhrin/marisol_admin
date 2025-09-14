// AdminPanel.jsx
import PropTypes from "prop-types";
import "./App.css"; // Import styles
import ReservationTable from "./ReservationTable";

function AdminPanel({ signOut }) {
  return (
    <div style={{ textAlign: "center", marginTop: "10px" }}>
      <button
        onClick={() => {
          signOut();
          setTimeout(() => {
            window.location.href = "https://marisol.sk/";
          }, 1000); // Small delay to ensure logout completes
        }}
        style={{
          backgroundColor: "#e53935",
          color: "#fff",
          border: "none",
          borderRadius: "24px",
          padding: "10px 28px",
          fontSize: "1.5rem",
          fontWeight: "bold",
          cursor: "pointer",
          marginBottom: "18px",
          transition: "background 0.2s"
        }}
        onMouseOver={e => (e.currentTarget.style.backgroundColor = "#b71c1c")}
        onMouseOut={e => (e.currentTarget.style.backgroundColor = "#e53935")}
      >
        Logout
      </button>

      <h2>Administrácia</h2>

      <ReservationTable />
    </div>
  );
}

AdminPanel.propTypes = {
  signOut: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

export default AdminPanel;