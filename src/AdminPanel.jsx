// AdminPanel.jsx
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import "./App.css"; // Import styles
import ReservationTable from "./ReservationTable";
import Overview from "./Overview";
import Expenses from "./Expenses";


function AdminPanel({ signOut }) {
  const [reservations, setReservations] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const fetchReservations = async () => {
    try {
      const response = await fetch("https://eb8ya8rtoc.execute-api.us-east-1.amazonaws.com/main/reservation");
      const data = await response.json();
      if (data.success) {
        setReservations(data.reservations);
      }
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await fetch("https://eb8ya8rtoc.execute-api.us-east-1.amazonaws.com/main/expenses");
      const data = await response.json();
      if (data.success) {
        setExpenses(data.expenses);
      }
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    }
  };

  const fetchData = () => {
    fetchReservations();
    fetchExpenses();
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      <ReservationTable onDataChanged={fetchData} />
      <Overview reservations={reservations} expenses={expenses} />
      <Expenses expenses={expenses} onExpensesChanged={fetchData} />
    </div>
  );
}

AdminPanel.propTypes = {
  signOut: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

export default AdminPanel;