import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const API_URL = "https://9de4pwfk8e.execute-api.us-east-1.amazonaws.com/dev/availability"; // Replace with your API Gateway URL

function AdminPanel({ signOut, user }) {
  const [selectedDates, setSelectedDates] = useState([]);
  const [initialReservedDates, setInitialReservedDates] = useState([]); // Keep track of original reserved dates

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.availability) {
          const unavailableDates = data.availability.map((item) => item.date);
          console.log("Fetched unavailable dates:", unavailableDates); // ✅ Debugging
          setSelectedDates(unavailableDates);
          setInitialReservedDates(unavailableDates); // Store initial reserved dates
        }
      })
      .catch((err) => console.error("Error fetching availability:", err));
  }, []);

  const handleDateChange = (date) => {
    const dateStr = date.toLocaleDateString("en-CA"); // Format as YYYY-MM-DD
  
    setSelectedDates((prevDates) => {
      if (prevDates.includes(dateStr)) {
        return prevDates.filter((d) => d !== dateStr); // Unreserve (remove from selected)
      } else {
        return [...prevDates, dateStr]; // Reserve (add to selected)
      }
    });
  };

  const saveAvailability = async () => {
    try {
      // Compare with currently selected dates
      const newReservations = selectedDates.filter(date => !initialReservedDates.includes(date));
  
      // Reserve new dates
      if (newReservations.length > 0) {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dates: newReservations, available: false }),
        });
      }
  
      alert("Rezervácia úspešná!");
    } catch (error) {
      console.error("Error updating availability:", error);
      alert("Chyba pri rezervácii");
    }
  };

  const unreserveAvailability = async () => {
    try {
      const unreservations = initialReservedDates.filter(date => !selectedDates.includes(date));

      if (unreservations.length > 0) {
        await fetch(API_URL, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dates: unreservations }),
        });
      }

      alert("Odrezervovanie úspešné!");
    } catch (error) {
      console.error("Error unreserving availability:", error);
      alert("Chyba pri odrezervovaní");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Welcome, {user?.username}</h2>
      <button onClick={signOut}>Logout</button>

      <h2>Admin Panel - Manage Availability</h2>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <Calendar onClickDay={handleDateChange} />
      </div>

      <p>Vybrané dátumy: {selectedDates.join(", ")}</p>
      <button onClick={saveAvailability}>Rezervovať</button>
      <button onClick={unreserveAvailability} style={{ marginLeft: "10px", backgroundColor: "red", color: "white" }}>
        Odrezervovať
      </button>
    </div>
  );
}

// ✅ Add prop validation
AdminPanel.propTypes = {
  signOut: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

// ✅ Named export for correct Fast Refresh behavior
export default AdminPanel;