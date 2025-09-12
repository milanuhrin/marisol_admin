// ReservationTable.jsx

import { useEffect, useState } from "react";
import PropTypes from 'prop-types';

const API_URL = "https://eb8ya8rtoc.execute-api.us-east-1.amazonaws.com/main/reservation";

function ReservationForm({ initialData = {}, onSubmit, onCancel, submitLabel, submitColor }) {
  const [deposit, setDeposit] = useState(
    initialData.deposit != null ? parseFloat(initialData.deposit) ?? '' : ''
  );
  const [advance, setAdvance] = useState(
    initialData.advance != null ? parseFloat(initialData.advance) ?? '' : ''
  );
  const [remaining, setRemaining] = useState(
    initialData.remaining != null ? parseFloat(initialData.remaining) ?? '' : ''
  );
  const [depositDate, setDepositDate] = useState(initialData.depositDate || "");
  const [advanceDate, setAdvanceDate] = useState(initialData.advanceDate || "");
  const [remainingDate, setRemainingDate] = useState(initialData.remainingDate || "");
  // Total is advance + remaining, deposit is not included
  const total = (parseFloat(advance || 0) + parseFloat(remaining || 0)).toFixed(2);

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        marginBottom: "20px",
      }}
    >
      <label>
        Dátum od
        <input name="startDate" type="date" defaultValue={initialData.startDate || ""} required />
      </label>
      <label>
        Dátum do
        <input name="endDate" type="date" defaultValue={initialData.endDate || ""} required />
      </label>
      <label>
        Meno
        <input name="guestName" defaultValue={initialData.guestName || ""} required />
      </label>
      <label>
        Kontakt
        <input name="guestContact" defaultValue={initialData.guestContact || ""} />
      </label>
      <label>
        Check-in
        <input name="checkInTime" defaultValue={initialData.checkInTime || ""} placeholder="napr. 14:00" />
      </label>
      <label>
        Check-out
        <input name="checkOutTime" defaultValue={initialData.checkOutTime || ""} placeholder="napr. 10:00" />
      </label>
      <label>
        Platforma
        <input name="platform" defaultValue={initialData.platform || ""} placeholder="napr. AirBnB" />
      </label>
      <label>
        Poznámka
        <input name="info" defaultValue={initialData.info || ""} />
      </label>
      <label>
        Depozit
        <input
          name="deposit"
          type="number"
          step="0.01"
          value={deposit === '' || isNaN(deposit) ? '' : deposit}
          onChange={e => {
            const val = e.target.value;
            setDeposit(val === '' ? '' : parseFloat(val));
          }}
        />
      </label>
      <label>
        Dátum depozitu
        <input
          name="depositDate"
          type="date"
          value={depositDate}
          onChange={e => setDepositDate(e.target.value)}
        />
      </label>
      <label>
        Záloha
        <input
          name="advance"
          type="number"
          step="0.01"
          value={advance === '' || isNaN(advance) ? '' : advance}
          onChange={e => {
            const val = e.target.value;
            setAdvance(val === '' ? '' : parseFloat(val));
          }}
        />
      </label>
      <label>
        Dátum zálohy
        <input
          name="advanceDate"
          type="date"
          value={advanceDate}
          onChange={e => setAdvanceDate(e.target.value)}
        />
      </label>
      <label>
        Doplatok
        <input
          name="remaining"
          type="number"
          step="0.01"
          value={remaining === '' || isNaN(remaining) ? '' : remaining}
          onChange={e => {
            const val = e.target.value;
            setRemaining(val === '' ? '' : parseFloat(val));
          }}
        />
      </label>
      <label>
        Dátum doplatku
        <input
          name="remainingDate"
          type="date"
          value={remainingDate}
          onChange={e => setRemainingDate(e.target.value)}
        />
      </label>
      <label>
        Spolu bez depozitu
        <input
          name="total"
          type="number"
          step="0.01"
          readOnly
          value={total}
        />
      </label>
      <button type="submit" style={{ padding: "10px", backgroundColor: submitColor, color: "white", border: "none" }}>
        {submitLabel}
      </button>
      <button type="button" onClick={onCancel} style={{ padding: "10px" }}>
        Zrušiť
      </button>
      {/* Hidden fields for date values for submit */}
      <input type="hidden" name="depositDate" value={depositDate} />
      <input type="hidden" name="advanceDate" value={advanceDate} />
      <input type="hidden" name="remainingDate" value={remainingDate} />
    </form>
  );
}

ReservationForm.propTypes = {
  initialData: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    guestName: PropTypes.string,
    guestContact: PropTypes.string,
    checkInTime: PropTypes.string,
    checkOutTime: PropTypes.string,
    platform: PropTypes.string,
    info: PropTypes.string,
    deposit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    depositDate: PropTypes.string,
    advance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    advanceDate: PropTypes.string,
    remaining: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    remainingDate: PropTypes.string,
    total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitLabel: PropTypes.string.isRequired,
  submitColor: PropTypes.string.isRequired,
}

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
        console.log("Fetched reservations:", data.reservations);
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

  if (loading) return <p>Načítavam rezervácie</p>;

  return (
    <div style={{ marginTop: "30px", marginBottom: "50px" }}>
      <h3>Rezervácie</h3>
      <button onClick={() => setShowForm(!showForm)} style={{ marginBottom: "20px" }}>
        {showForm ? "Skryť formulár" : "➕ Nová rezervácia"}
      </button>

      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <ReservationForm
            submitLabel="Uložiť rezerváciu"
            submitColor="#007bff"
            onCancel={() => setShowForm(false)}
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
                deposit: form.deposit.value ? parseFloat(form.deposit.value) : undefined,
                depositDate: form.depositDate.value ? form.depositDate.value : undefined,
                advance: form.advance.value ? parseFloat(form.advance.value) : undefined,
                advanceDate: form.advanceDate.value ? form.advanceDate.value : undefined,
                remaining: form.remaining.value ? parseFloat(form.remaining.value) : undefined,
                remainingDate: form.remainingDate.value ? form.remainingDate.value : undefined,
                total: form.total.value ? parseFloat(form.total.value) : undefined,
              };
              Object.keys(newReservation).forEach(key => {
                if (newReservation[key] === "" || newReservation[key] === undefined) {
                  delete newReservation[key];
                }
              });
              try {
                const response = await fetch(API_URL, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(newReservation),
                });
                const result = await response.json();
                if (response.status === 409 && result?.error === "Termín je už obsadený") {
                  alert(`❌ ${result.error}: ${result.conflictDates?.join(", ")}`);
                  return;
                }
                if (result.success) {
                  fetchReservations();
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
          />
        </Modal>
      )}

      {editReservation && (
        <Modal onClose={() => setShowEditForm(null)}>
          <ReservationForm
            initialData={editReservation}
            submitLabel="Uložiť zmeny"
            submitColor="orange"
            onCancel={() => setShowEditForm(null)}
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
                deposit: form.deposit.value ? parseFloat(form.deposit.value) : undefined,
                depositDate: form.depositDate.value ? form.depositDate.value : undefined,
                advance: form.advance.value ? parseFloat(form.advance.value) : undefined,
                advanceDate: form.advanceDate.value ? form.advanceDate.value : undefined,
                remaining: form.remaining.value ? parseFloat(form.remaining.value) : undefined,
                remainingDate: form.remainingDate.value ? form.remainingDate.value : undefined,
                total: form.total.value ? parseFloat(form.total.value) : undefined,
              };
              Object.keys(updatedReservation).forEach(key => {
                if (updatedReservation[key] === "" || updatedReservation[key] === undefined) {
                  delete updatedReservation[key];
                }
              });
              try {
                const response = await fetch(`${API_URL}/${editReservation.reservationId}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(updatedReservation),
                });
                const result = await response.json();
                if (response.status === 409 && result?.error === "Termín je už obsadený") {
                  alert(`❌ ${result.error}: ${result.conflictDates?.join(", ")}`);
                  return;
                }
                if (result.success) {
                  fetchReservations();
                  setShowEditForm(null);
                  alert("Rezervácia bola upravená.");
                } else {
                  alert("Chyba pri úprave rezervácie.");
                }
              } catch (err) {
                console.error("❌ Edit error:", err);
                alert("Chyba siete.");
              }
            }}
          />
        </Modal>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={cellStyle}>ID</th>
            <th style={cellStyle}>Dátum príchodu</th>
            <th style={cellStyle}>Dátum odchodu</th>
            <th style={cellStyle}>Meno hosťa</th>
            <th style={cellStyle}>Kontakt</th>
            <th style={cellStyle}>Platforma</th>
            <th style={cellStyle}>Check-in/out</th>
            <th style={cellStyle}>Poznámka</th>
            <th style={cellStyle}>Depozit (EUR)</th>
            <th style={cellStyle}>Dátum uhradenia depozitu</th>
            <th style={cellStyle}>Záloha (EUR)</th>
            <th style={cellStyle}>Dátum uhradenia zálohy</th>
            <th style={cellStyle}>Doplatok (EUR)</th>
            <th style={cellStyle}>Dátum uhradenia doplatku</th>
            <th style={cellStyle}>Spolu (EUR)</th>
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
              <td style={cellStyle}>{res.deposit !== undefined ? res.deposit : "-"}</td>
              <td style={cellStyle}>{res.depositDate || "-"}</td>
              <td style={cellStyle}>{res.advance !== undefined ? res.advance : "-"}</td>
              <td style={cellStyle}>{res.advanceDate || "-"}</td>
              <td style={cellStyle}>{res.remaining !== undefined ? res.remaining : "-"}</td>
              <td style={cellStyle}>{res.remainingDate || "-"}</td>
              <td style={cellStyle}>{res.total !== undefined ? res.total : "-"}</td>
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

function Modal({ children, onClose }) {
  return (
    <>
      <style>{`
        form label {
          display: flex;
          flex-direction: column;
          font-weight: bold;
          font-size: 14px;
          text-align: left;
          align-items: flex-start;
        }

        form input {
          width: 100%;
          box-sizing: border-box;
          padding: 6px 8px;
          margin-top: 4px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
        }
      `}</style>
      <div style={overlayStyle} onClick={onClose}>
        <div style={modalStyle} onClick={e => e.stopPropagation()}>
          <button onClick={onClose} style={closeButtonStyle} aria-label="Close modal">×</button>
          {children}
        </div>
      </div>
    </>
  );
}

Modal.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
  maxWidth: "800px",
  width: "90%",
  maxHeight: "90vh",
  overflowY: "auto",
  position: "relative",
};

const closeButtonStyle = {
  position: "absolute",
  top: "10px",
  right: "15px",
  background: "transparent",
  border: "none",
  fontSize: "24px",
  cursor: "pointer",
  lineHeight: "1",
};

export default ReservationTable;