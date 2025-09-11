import { useEffect, useState } from "react";

const API_URL = "https://eb8ya8rtoc.execute-api.us-east-1.amazonaws.com/main/reservation";

function ReservationTable() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (data.success) {
        setReservations(data.reservations);
      } else {
        console.error("⚠️ Unexpected response:", data);
      }
    } catch (error) {
      console.error("❌ Failed to fetch reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReservation = async (reservationId) => {
    if (!window.confirm(`Naozaj chceš vymazať rezerváciu ${reservationId}?`)) return;

    try {
      const response = await fetch(`${API_URL}/${reservationId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        setReservations((prev) =>
          prev.filter((r) => r.reservationId !== reservationId)
        );
        alert("Rezervácia bola úspešne vymazaná.");
      } else {
        alert("Nepodarilo sa vymazať rezerváciu.");
      }
    } catch (error) {
      console.error("❌ Delete error:", error);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  if (loading) return <p>Načítavam rezervácie...</p>;

  return (
    <div style={{ marginTop: "30px", marginBottom: "50px" }}>
      <h3>📋 Zoznam rezervácií</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={cellStyle}>ID</th>
            <th style={cellStyle}>Dátum od</th>
            <th style={cellStyle}>Dátum do</th>
            <th style={cellStyle}>Hosť</th>
            <th style={cellStyle}>Kontakt</th>
            <th style={cellStyle}>Platforma</th>
            <th style={cellStyle}>Check-in/out</th>
            <th style={cellStyle}>Poznámka</th>
            <th style={cellStyle}>Akcie</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((res) => (
            <tr key={res.reservationId}>
              <td style={cellStyle}>{res.reservationId}</td>
              <td style={cellStyle}>{res.startDate}</td>
              <td style={cellStyle}>{res.endDate}</td>
              <td style={cellStyle}>{res.guestName}</td>
              <td style={cellStyle}>{res.guestContact}</td>
              <td style={cellStyle}>{res.platform}</td>
              <td style={cellStyle}>
                {res.checkInTime} / {res.checkOutTime}
              </td>
              <td style={cellStyle}>{res.info}</td>
              <td style={cellStyle}>
                <button onClick={() => alert("🛠 Tu bude edit formulár")}>Upraviť</button>
                <button
                  onClick={() => deleteReservation(res.reservationId)}
                  style={{ marginLeft: "8px", color: "red" }}
                >Zmazať</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const cellStyle = {
    padding: "10px",
    border: "1px solid #ccc",
    textAlign: "left",
    whiteSpace: "nowrap",          // Zabraňuje zalomeniu textu
    overflow: "hidden",
    textOverflow: "ellipsis",      // Pridá ... ak je text príliš dlhý
    maxWidth: "300px",             // Limituje príliš dlhý text
  };

export default ReservationTable;