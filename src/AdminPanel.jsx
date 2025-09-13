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
      >
        Logout
      </button>

      <h2>Administracia</h2>

      <h3>Zoznam rezervacii</h3>

      <button
        style={{
          marginTop: "10px",
          padding: "10px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Nova rezervacia
      </button>

      <ReservationTable />
    </div>
  );
}

AdminPanel.propTypes = {
  signOut: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

export default AdminPanel;