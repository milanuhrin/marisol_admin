// ReservationTable.jsx

import { useEffect, useState } from "react";

const API_URL = "https://eb8ya8rtoc.execute-api.us-east-1.amazonaws.com/main/reservation";

function ReservationTable() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editReservation, setShowEditForm] = useState(null);

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
    console.log("🗑 Attempting to delete reservation:", reservationId);
    if (!window.confirm(`Naozaj chceš vymazať rezerváciu ${reservationId}?`)) {
      console.log("❌ Deletion cancelled by user.");
      return;
    }

    try {
      console.log("➡️ Entering deleteReservation try block for:", reservationId);
      const response = await fetch(`${API_URL}/${reservationId}`, {
        method: "DELETE",
      });

      console.log("🔄 Response received:", response);
      const text = await response.text();
      console.log("📦 Raw response text:", text);
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.error("❌ Failed to parse JSON:", e);
        alert("Neplatná odpoveď zo servera.");
        return;
      }

      if (result.success) {
        setReservations((prev) =>
          prev.filter((r) => r.reservationId !== reservationId)
        );
        alert("Rezervácia bola úspešne vymazaná.");
        console.log("✅ Reservation deleted successfully.");
      } else {
        alert("Nepodarilo sa vymazať rezerváciu.");
        console.log("⚠️ Deletion failed, result.success is false.");
      }
    } catch (error) {
      console.error("❌ Delete error:", error);
      alert("Chyba siete pri mazaní rezervácie.");
      console.log("⚠️ Alerted user about network error during deletion.");
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  if (loading) return <p>Načítavam rezervácie...</p>;

  return (
    <div style={{ marginTop: "30px", marginBottom: "50px" }}>
      <h3>Zoznam rezervácií</h3>
      <button onClick={() => setShowForm(!showForm)} style={{ marginBottom: "20px" }}>
        {showForm ? "Skryť formulár" : "➕ Nová rezervácia"}
      </button>

      {showForm && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target;
            const reservationId = `RES${form.startDate.value.replaceAll("-", "")}`;
            const newReservation = {
              reservationId,
              startDate: form.startDate.value,
              endDate: form.endDate.value,
              guestName: form.guestName.value,
              guestContact: form.guestContact.value,
              checkInTime: form.checkInTime.value,
              checkOutTime: form.checkOutTime.value,
              platform: form.platform.value,
              info: form.info.value,
            };
            // Remove empty fields before sending
            Object.keys(newReservation).forEach(
              (key) => newReservation[key] === "" && delete newReservation[key]
            );

            try {
              console.log("📤 Sending new reservation:", newReservation);
              const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newReservation),
              });

              const result = await response.json();
              if (result.success) {
                fetchReservations(); // Refresh
                form.reset();
                setShowForm(false);
                alert("Rezervácia bola pridaná.");
              } else {
                alert("Chyba pri vytváraní rezervácie.");
              }
            } catch (err) {
              console.error("❌ Submit error:", err);
              alert("Chyba siete.");
            }
          }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <input name="startDate" type="date" required placeholder="Dátum od" />
          <input name="endDate" type="date" required placeholder="Dátum do" />
          <input name="guestName" required placeholder="Meno hosťa" />
          <input name="guestContact" placeholder="Kontakt" />
          <input name="checkInTime" placeholder="Check-in (napr. 14:00)" />
          <input name="checkOutTime" placeholder="Check-out (napr. 10:00)" />
          <input name="platform" placeholder="Platforma (napr. AirBnB)" />
          <input name="info" placeholder="Poznámka" />
          <button type="submit" style={{ gridColumn: "span 2", padding: "10px", backgroundColor: "#007bff", color: "white", border: "none" }}>
            Uložiť rezerváciu
          </button>
        </form>
      )}

      {editReservation && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target;
            const updatedReservation = {
              startDate: form.startDate.value,
              endDate: form.endDate.value,
              guestName: form.guestName.value,
              guestContact: form.guestContact.value,
              checkInTime: form.checkInTime.value,
              checkOutTime: form.checkOutTime.value,
              platform: form.platform.value,
              info: form.info.value,
            };
            Object.keys(updatedReservation).forEach(
              (key) => updatedReservation[key] === "" && delete updatedReservation[key]
            );
            try {
              const response = await fetch(`${API_URL}/${editReservation.reservationId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedReservation),
              });
              const result = await response.json();
              if (result.success) {
                fetchReservations(); // refresh list
                setShowEditForm(null); // close form
                alert("Rezervácia bola upravená.");
              } else {
                alert("Chyba pri úprave rezervácie.");
              }
            } catch (err) {
              console.error("❌ Edit error:", err);
              alert("Chyba siete.");
            }
          }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "10px",
            marginBottom: "20px",
            border: "2px solid orange",
            padding: "20px",
            maxWidth: "1000px",
            marginLeft: "auto",
            marginRight: "auto",
            borderRadius: "8px",
            backgroundColor: "#fff",
          }}
        >
          <label>
            Dátum od
            <input name="startDate" type="date" defaultValue={editReservation.startDate} required />
          </label>
          <label>
            Dátum do
            <input name="endDate" type="date" defaultValue={editReservation.endDate} required />
          </label>
          <label>
            Meno hosťa
            <input name="guestName" defaultValue={editReservation.guestName} required />
          </label>
          <label>
            Kontakt
            <input name="guestContact" defaultValue={editReservation.guestContact || ""} />
          </label>
          <label>
            Check-in
            <input name="checkInTime" defaultValue={editReservation.checkInTime || ""} />
          </label>
          <label>
            Check-out
            <input name="checkOutTime" defaultValue={editReservation.checkOutTime || ""} />
          </label>
          <label>
            Platforma
            <input name="platform" defaultValue={editReservation.platform || ""} />
          </label>
          <label>
            Poznámka
            <input name="info" defaultValue={editReservation.info || ""} />
          </label>
          <button type="submit" style={{ gridColumn: "span 2", padding: "10px", backgroundColor: "orange", color: "white", border: "none" }}>
            Uložiť zmeny
          </button>
          <button type="button" onClick={() => setShowEditForm(null)} style={{ gridColumn: "span 2", padding: "10px" }}>
            Zrušiť
          </button>
        </form>
      )}

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
                <button onClick={() => setShowEditForm(res)}>Upraviť</button>
                <button
                  onClick={() => deleteReservation(res.reservationId)}
                  style={{ marginLeft: "8px", color: "red" }}
                >
                  Zmazať
                </button>
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