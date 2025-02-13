import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./App.css"; // Import styles

const API_URL = "https://eb8ya8rtoc.execute-api.us-east-1.amazonaws.com/main/availability";

// ✅ Ensure dates are always stored in UTC format
const formatDate = (date) => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0]; // Convert to UTC date
};

function AdminPanel({ signOut }) {
  const [reservedDates, setReservedDates] = useState([]); // Reserved days from database
  const [selectedDates, setSelectedDates] = useState([]); // Selected days (turn blue)

  // ✅ Fetch reserved dates from backend
  const fetchReservedDates = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
  
      if (data.success && data.availability) {
        const dates = data.availability.map((item) => item.date);
        setReservedDates(dates); // Update state
      } else {
        console.error("🚨 Unexpected API response:", data);
      }
    } catch (error) {
      console.error("❌ Error fetching reserved dates:", error);
    }
  };

  // 🔄 Fetch reserved dates on component mount
  useEffect(() => {
    fetchReservedDates();
  }, []);

  // 🟦 Handle selecting/deselecting dates
  const handleDateClick = (date) => {
    const dateStr = formatDate(date); // Convert date to UTC format

    setSelectedDates((prevSelected) =>
      prevSelected.includes(dateStr)
        ? prevSelected.filter((d) => d !== dateStr) // Unselect
        : [...prevSelected, dateStr] // Select (turn blue)
    );

    console.log("📅 Clicked Date:", dateStr);
  };

  // 🔴 Reserve selected dates (POST request) + Auto Refresh
  const reserveDates = async () => {
    try {
      const newReservations = selectedDates.filter(date => !reservedDates.includes(date));

      if (newReservations.length > 0) {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dates: newReservations, available: false }),
        });

        // ✅ Update `reservedDates` state directly (No need to re-fetch)
        setReservedDates((prev) => [...prev, ...newReservations]);
        setSelectedDates([]); // Clear selection
        alert("Rezervácia úspešná!");
      }
    } catch (error) {
      console.error("Error reserving dates:", error);
      alert("Chyba pri rezervácii");
    }
  };

  // 🟢 Unreserve selected dates (DELETE request) + Auto Refresh
  const unreserveDates = async () => {
    try {
      const unreservations = selectedDates.filter(date => reservedDates.includes(date));

      if (unreservations.length > 0) {
        await fetch(API_URL, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dates: unreservations }),
        });

        // ✅ Update `reservedDates` state directly (No need to re-fetch)
        setReservedDates((prev) => prev.filter(date => !unreservations.includes(date)));
        setSelectedDates([]); // Clear selection
        alert("Odrezervovanie úspešné!");
      }
    } catch (error) {
      console.error("Error unreserving dates:", error);
      alert("Chyba pri odrezervovaní");
    }
  };

  // 🎨 Apply styles to calendar days
  const tileClassName = ({ date, view }) => {
    if (view !== "month") return null;

    const dateStr = formatDate(date);

    if (selectedDates.includes(dateStr)) return "selected-day"; // Blue
    if (reservedDates.includes(dateStr)) return "reserved-day"; // Gray

    return null;
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <button onClick={signOut}>Logout</button>

      <h2>Admin Panel - Manage Availability</h2>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <Calendar
          onClickDay={handleDateClick}
          tileClassName={tileClassName}
        />
      </div>

     {/* 🔴 Rezervovať Button */}
     <button
        onClick={reserveDates}
        style={{
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "red",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
          transition: "background-color 0.3s ease",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#b30000")} // Darker red on hover
        onMouseOut={(e) => (e.target.style.backgroundColor = "red")} // Revert to red
      >
        Rezervovať
      </button>

      {/* 🟢 Odrezervovať Button */}
      <button
        onClick={unreserveDates}
        style={{
          marginLeft: "10px",
          padding: "10px",
          backgroundColor: "green",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
          transition: "background-color 0.3s ease",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#005f00")} // Darker green on hover
        onMouseOut={(e) => (e.target.style.backgroundColor = "green")} // Revert to green
      >
        Odrezervovať
      </button>

      {/* 📝 Legend */}
      <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "15px" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: "20px", height: "20px", backgroundColor: "gray", marginRight: "5px" }}></div>
          Obsadený
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: "20px", height: "20px", backgroundColor: "blue", marginRight: "5px" }}></div>
          Vybraný
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: "20px", height: "20px", backgroundColor: "green", marginRight: "5px" }}></div>
          Voľný
        </div>
      </div>
    </div>
  );
}

AdminPanel.propTypes = {
  signOut: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

export default AdminPanel;