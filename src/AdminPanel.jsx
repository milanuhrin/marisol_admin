import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./App.css"; // Import styles

const API_URL = "https://9de4pwfk8e.execute-api.us-east-1.amazonaws.com/dev/availability";

// Function to ensure dates are always stored in UTC
const formatDate = (date) => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0]; // Convert to UTC date
};

function AdminPanel({ signOut }) {
  const [reservedDates, setReservedDates] = useState([]); // Reserved days from database
  const [selectedDates, setSelectedDates] = useState([]); // Selected days (turn blue)

  useEffect(() => {
    const fetchReservedDates = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
  
        if (data.success && data.availability) {
          const reservedDatesList = data.availability.map((item) => item.date);
          console.log("✅ Reserved Dates (from API):", reservedDatesList);
          setReservedDates(reservedDatesList);
        }
      } catch (error) {
        console.error("❌ Error fetching availability:", error);
      }
    };
  
    fetchReservedDates();
  }, []);

  // Handle selecting/deselecting dates (including reserved ones)
  const handleDateClick = (date) => {
    const dateStr = formatDate(date); // Ensure correct date format in UTC

    setSelectedDates((prevSelected) => {
      if (prevSelected.includes(dateStr)) {
        return prevSelected.filter((d) => d !== dateStr); // Unselect if already selected
      } else {
        return [...prevSelected, dateStr]; // Select (turn blue)
      }
    });

    console.log("📅 Clicked Date:", dateStr);
  };

  // Reserve dates (POST request)
  const reserveDates = async () => {
    try {
      const newReservations = selectedDates
        .map(date => formatDate(new Date(date))) // Ensure correct format
        .filter(date => !reservedDates.includes(date));

      console.log("🚀 Sending reservation request for:", newReservations);

      if (newReservations.length > 0) {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dates: newReservations, available: false }),
        });

        setReservedDates([...reservedDates, ...newReservations]);
        setSelectedDates([]); 
        alert("Rezervácia úspešná!");
      }
    } catch (error) {
      console.error("❌ Error reserving dates:", error);
      alert("Chyba pri rezervácii");
    }
  };

  // Unreserve dates (DELETE request)
  const unreserveDates = async () => {
    try {
      const unreservations = selectedDates.filter(date => reservedDates.includes(date));

      console.log("🗑 Unreserving dates:", unreservations);

      if (unreservations.length > 0) {
        await fetch(API_URL, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dates: unreservations }),
        });

        setReservedDates(reservedDates.filter(date => !unreservations.includes(date)));
        setSelectedDates([]); 
        alert("Odrezervovanie úspešné!");
      }
    } catch (error) {
      console.error("❌ Error unreserving dates:", error);
      alert("Chyba pri odrezervovaní");
    }
  };

  // Apply styles to calendar days
  const tileClassName = ({ date, view }) => {
    if (view !== "month") return null;

    const dateStr = formatDate(date); // Ensure format is YYYY-MM-DD

    if (selectedDates.includes(dateStr)) return "selected-day"; 
    if (reservedDates.includes(dateStr)) return "reserved-day"; 

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

      <button onClick={reserveDates} style={{ marginTop: "20px", padding: "10px", backgroundColor: "red", color: "white" }}>
        Rezervovať
      </button>
      <button onClick={unreserveDates} style={{ marginLeft: "10px", padding: "10px", backgroundColor: "green", color: "white" }}>
        Odrezervovať
      </button>

      {/* Legend */}
      <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "15px" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: "20px", height: "20px", backgroundColor: "gray", marginRight: "5px" }}></div>
          Obsadený (Reserved)
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: "20px", height: "20px", backgroundColor: "blue", marginRight: "5px" }}></div>
          Vybrané (Selected)
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: "20px", height: "20px", backgroundColor: "green", marginRight: "5px" }}></div>
          Voľný (Available)
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