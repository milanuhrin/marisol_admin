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

      <ReservationTable />
    </div>
  );
}

AdminPanel.propTypes = {
  signOut: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

export default AdminPanel;