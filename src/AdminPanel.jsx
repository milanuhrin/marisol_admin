import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const API_URL = "https://9de4pwfk8e.execute-api.us-east-1.amazonaws.com/dev/availability"; // Replace with your API Gateway URL

function AdminPanel({ signOut, user }) {
  const [selectedDates, setSelectedDates] = useState([]);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.availability) {
          const unavailableDates = data.availability.map((item) => item.date);
          console.log("Fetched unavailable dates:", unavailableDates); // ✅ Debugging
          setSelectedDates(unavailableDates); // ✅ Load unavailable dates correctly
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
      // Get unavailable dates from the API (to find out which ones were unselected)
      const response = await fetch(API_URL);
      const data = await response.json();
      const previouslyReserved = data.success ? data.availability.map((item) => item.date) : [];
  
      // Compare with currently selected dates
      const newReservations = selectedDates.filter(date => !previouslyReserved.includes(date));
      const unreservations = previouslyReserved.filter(date => !selectedDates.includes(date));
  
      // Send API request to reserve new dates
      if (newReservations.length > 0) {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dates: newReservations, available: false }),
        });
      }
  
      // Send API request to unreserve removed dates
      if (unreservations.length > 0) {
        await fetch(API_URL, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dates: unreservations }),
        });
      }
  
      alert("Availability updated successfully!");
    } catch (error) {
      console.error("Error updating availability:", error);
      alert("Error updating availability");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Welcome, {user?.username}</h2>
      <button onClick={signOut}>Logout</button>

      <h2>Admin Panel - Manage Availability</h2>
      <Calendar
        onClickDay={handleDateChange}
        tileDisabled={({ date }) => selectedDates.includes(date.toLocaleDateString("en-CA"))}
      />
      <button onClick={saveAvailability}>Rezervovat</button>
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