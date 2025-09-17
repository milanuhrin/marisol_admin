// ReservationTable.jsx

import { useEffect, useState } from "react";
import PropTypes from 'prop-types';

const API_URL = "https://eb8ya8rtoc.execute-api.us-east-1.amazonaws.com/main/reservation";

function ReservationForm({ initialData = {}, onSubmit, onCancel, submitLabel, submitColor }) {
  // Controlled state for all fields except startDate/endDate
  const [guestName, setGuestName] = useState(initialData.guestName || "");
  const [guestContact, setGuestContact] = useState(initialData.guestContact || "");
  const [checkInTime, setCheckInTime] = useState(initialData.checkInTime || "14:00");
  const [checkOutTime, setCheckOutTime] = useState(initialData.checkOutTime || "10:00");
  const [platform, setPlatform] = useState(initialData.platform || "");
  const [info, setInfo] = useState(initialData.info || "");
  const [deposit, setDeposit] = useState(
    initialData.deposit != null ? parseFloat(initialData.deposit) ?? '' : ''
  );
  const [depositDate, setDepositDate] = useState(initialData.depositDate || "");
  const [advance, setAdvance] = useState(
    initialData.advance != null ? parseFloat(initialData.advance) ?? '' : ''
  );
  const [advanceDate, setAdvanceDate] = useState(initialData.advanceDate || "");
  const [remaining, setRemaining] = useState(
    initialData.remaining != null ? parseFloat(initialData.remaining) ?? '' : ''
  );
  const [remainingDate, setRemainingDate] = useState(initialData.remainingDate || "");
  // New state hooks for adults and children
  const [adults, setAdults] = useState(initialData.adults || "1");
  const [children, setChildren] = useState(initialData.children || "0");
  // State for NUKI code
  const [nukiCode, setNukiCode] = useState(initialData.nukiCode || "");
  // State for account
  const [account, setAccount] = useState(initialData.account || "");
  // Total is advance + remaining, deposit is not included
  const total = (parseFloat(advance || 0) + parseFloat(remaining || 0)).toFixed(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass controlled values as 2nd param
    onSubmit(e, {
      guestName,
      guestContact,
      checkInTime,
      checkOutTime,
      platform,
      account,
      info,
      deposit,
      depositDate,
      advance,
      advanceDate,
      remaining,
      remainingDate,
      total,
      adults,
      children,
      nukiCode,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        marginBottom: "20px",
      }}
    >
      {/* Start and end date in one row */}
      <div style={{ display: "flex", gap: "20px" }}>
        <label style={{ flex: 1 }}>
          Dátum príchodu
          <input name="startDate" type="date" defaultValue={initialData.startDate || ""} required />
        </label>
        <label style={{ flex: 1 }}>
          Dátum odchodu
          <input name="endDate" type="date" defaultValue={initialData.endDate || ""} required />
        </label>
      </div>
      {/* Guest name full row */}
      <div style={{ display: "flex", gap: "20px" }}>
        <label style={{ flex: 1 }}>
          Meno hosťa
          <input
            name="guestName"
            value={guestName}
            onChange={e => setGuestName(e.target.value)}
            required
          />
        </label>
      </div>
      {/* Guest contact full row */}
      <div style={{ display: "flex", gap: "20px" }}>
        <label style={{ flex: 1 }}>
          Kontakt
          <input
            name="guestContact"
            value={guestContact}
            onChange={e => setGuestContact(e.target.value)}
          />
        </label>
      </div>
      {/* Check-in and check-out time in one row */}
      <div style={{ display: "flex", gap: "20px" }}>
        <label style={{ flex: 1 }}>
          Check-in
          <input
            name="checkInTime"
            value={checkInTime || "14:00"}
            onChange={e => setCheckInTime(e.target.value)}
          />
        </label>
        <label style={{ flex: 1 }}>
          Check-out
          <input
            name="checkOutTime"
            value={checkOutTime || "10:00"}
            onChange={e => setCheckOutTime(e.target.value)}
          />
        </label>
      </div>
      {/* Platform and account in one row */}
      <div style={{ display: "flex", gap: "20px" }}>
        <label style={{ flex: 1 }}>
          Platforma
          <select
            name="platform"
            value={platform}
            onChange={e => setPlatform(e.target.value)}
          >
            <option value="">Vyberte platformu</option>
            <option value="Facebook">Facebook</option>
            <option value="Airbnb">Airbnb</option>
            <option value="Booking">Booking</option>
            <option value="Znami">Znami</option>
            <option value="Rodina">Rodina</option>
            <option value="WaeFoo">WaeFoo</option>
          </select>
        </label>
        <label style={{ flex: 1 }}>
          Účet
          <select
            name="account"
            value={account}
            onChange={e => setAccount(e.target.value)}
          >
            <option value="">Vyberte účet</option>
            <option value="Santander">Santander</option>
            <option value="Revolut">Revolut</option>
            <option value="Miska VUB">Revolut</option>
            <option value="Milan TB">Revolut</option>
            <option value="Cash">Cash</option>
          </select>
        </label>
      </div>
      {/* Adults and children in one row */}
      <div style={{ display: "flex", gap: "20px" }}>
        <label style={{ flex: 1 }}>
          Počet dospelých
          <select name="adults" value={adults} onChange={e => setAdults(e.target.value)}>
            {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label style={{ flex: 1 }}>
          Počet detí
          <select name="children" value={children} onChange={e => setChildren(e.target.value)}>
            {[0,1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>
      {/* Info full row */}
      <div style={{ display: "flex", gap: "20px" }}>
        <label style={{ flex: 1 }}>
          Poznámka
          <input
            name="info"
            value={info}
            onChange={e => setInfo(e.target.value)}
          />
        </label>
      </div>
      {/* Deposit and depositDate in one row */}
      <div style={{ display: "flex", gap: "20px" }}>
        <label style={{ flex: 1 }}>
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
        <label style={{ flex: 1 }}>
          Uhradenie depozitu
          <input
            name="depositDate"
            type="date"
            value={depositDate || ""}
            onChange={e => setDepositDate(e.target.value)}
          />
        </label>
      </div>
      {/* Advance and advanceDate in one row */}
      <div style={{ display: "flex", gap: "20px" }}>
        <label style={{ flex: 1 }}>
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
        <label style={{ flex: 1 }}>
          Uhradenie zálohy
          <input
            name="advanceDate"
            type="date"
            value={advanceDate || ""}
            onChange={e => setAdvanceDate(e.target.value)}
          />
        </label>
      </div>
      {/* Remaining and remainingDate in one row */}
      <div style={{ display: "flex", gap: "20px" }}>
        <label style={{ flex: 1 }}>
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
        <label style={{ flex: 1 }}>
          Uhradenie doplatku
          <input
            name="remainingDate"
            type="date"
            value={remainingDate || ""}
            onChange={e => setRemainingDate(e.target.value)}
          />
        </label>
      </div>
      {/* Total (full width, read only) */}
      <div style={{ display: "flex", gap: "20px" }}>
        <label style={{ flex: 1 }}>
          Spolu (bez depozitu)
          <input
            name="total"
            type="number"
            step="0.01"
            readOnly
            value={total}
          />
        </label>
      </div>
      {/* NUKI code full row (moved here) */}
      <div style={{ display: "flex", gap: "20px" }}>
        <label style={{ flex: 1 }}>
          NUKI kód
          <input
            name="nukiCode"
            value={nukiCode}
            onChange={e => setNukiCode(e.target.value)}
          />
        </label>
      </div>
      <button type="submit" style={{ padding: "10px", backgroundColor: submitColor, color: "white", border: "none" }}>
        {submitLabel}
      </button>
      <button type="button" onClick={onCancel} style={{ padding: "10px" }}>
        Zrušiť
      </button>
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

function formatDate(dateStr) {
  // Expects "YYYY-MM-DD", returns "DD.MM.YYYY"
  if (!dateStr || typeof dateStr !== "string") return "-";
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  return `${d}.${m}.${y}`;
}

function formatCurrency(value) {
  if (value === undefined || value === null || value === "" || isNaN(value)) return "-";
  return new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" }).format(value);
}

function ReservationTable({ onDataChanged }) {
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
        if (onDataChanged) onDataChanged();
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

  // Compute totals for deposit, advance, remaining, and total
  const totalAdvance = reservations.reduce((sum, r) => sum + (r.advance || 0), 0);
  const totalRemaining = reservations.reduce((sum, r) => sum + (r.remaining || 0), 0);
  const totalSum = reservations.reduce((sum, r) => sum + (r.total || 0), 0);

  return (
    <div style={{ marginTop: "30px", marginBottom: "50px" }}>
      <h3>Zoznam rezervácií</h3>
      <style>{`
        .new-reservation-btn {
          background-color: #007bff;
          color: white;
          padding: 10px 20px;
          border: 1px;
          border-color: #000000;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 20px;
          transition: background-color 0.2s;
        }
        .new-reservation-btn:hover {
          background-color: #0056b3;
        }
      `}</style>
      <button
        onClick={() => setShowForm(!showForm)}
        className="new-reservation-btn"
      >
        {showForm ? "Skryť formulár" : "Nová rezervácia"}
      </button>

      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <ReservationForm
            submitLabel="Uložiť rezerváciu"
            submitColor="#007bff"
            onCancel={() => setShowForm(false)}
            onSubmit={async (e, values) => {
            // values: guestName, guestContact, checkInTime, checkOutTime, platform, info, deposit, depositDate, advance, advanceDate, remaining, remainingDate, total, adults, children, nukiCode
            const form = e.target;
            const reservationId = `RES${form.startDate.value.replaceAll("-", "")}`;
            const newReservation = {
              reservationId,
              startDate: form.startDate.value,
              endDate: form.endDate.value,
              guestName: values.guestName,
              guestContact: values.guestContact,
              checkInTime: values.checkInTime,
              checkOutTime: values.checkOutTime,
              platform: values.platform,
              account: values.account || null,
              info: values.info,
              deposit: values.deposit !== '' && values.deposit != null ? parseFloat(values.deposit) : undefined,
              depositDate: values.depositDate || null,
              advance: values.advance !== '' && values.advance != null ? parseFloat(values.advance) : undefined,
              advanceDate: values.advanceDate || null,
              remaining: values.remaining !== '' && values.remaining != null ? parseFloat(values.remaining) : undefined,
              remainingDate: values.remainingDate || null,
              total: values.total !== '' && values.total != null ? parseFloat(values.total) : undefined,
              adults: values.adults !== undefined ? parseInt(values.adults, 10) : 1,
              children: values.children !== undefined ? parseInt(values.children, 10) : 0,
              nukiCode: values.nukiCode || null,
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
                  if (onDataChanged) onDataChanged();
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
            onSubmit={async (e, values) => {
            // values: guestName, guestContact, checkInTime, checkOutTime, platform, info, deposit, depositDate, advance, advanceDate, remaining, remainingDate, total, adults, children, nukiCode
            const form = e.target;
            const updatedReservation = {
              startDate: form.startDate.value,
              endDate: form.endDate.value,
              guestName: values.guestName,
              guestContact: values.guestContact,
              checkInTime: values.checkInTime,
              checkOutTime: values.checkOutTime,
              platform: values.platform,
              account: values.account || null,
              info: values.info,
              deposit: values.deposit !== '' && values.deposit != null ? parseFloat(values.deposit) : undefined,
              depositDate: values.depositDate || null,
              advance: values.advance !== '' && values.advance != null ? parseFloat(values.advance) : undefined,
              advanceDate: values.advanceDate || null,
              remaining: values.remaining !== '' && values.remaining != null ? parseFloat(values.remaining) : undefined,
              remainingDate: values.remainingDate || null,
              total: values.total !== '' && values.total != null ? parseFloat(values.total) : undefined,
              adults: values.adults !== undefined ? parseInt(values.adults, 10) : 1,
              children: values.children !== undefined ? parseInt(values.children, 10) : 0,
              nukiCode: values.nukiCode || null,
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
                  if (onDataChanged) onDataChanged();
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
            <th style={cellStyle}>Dospelí</th>
            <th style={cellStyle}>Deti</th>
            <th style={cellStyle}>Poznámka</th>
            <th style={cellStyle}>Depozit</th>
            <th style={cellStyle}>Uhradenie depozitu</th>
            <th style={cellStyle}>Záloha ({formatCurrency(totalAdvance)})</th>
            <th style={cellStyle}>Uhradenie zálohy</th>
            <th style={cellStyle}>Doplatok ({formatCurrency(totalRemaining)})</th>
            <th style={cellStyle}>Uhradenie doplatku</th>
            <th style={cellStyle}>Spolu ({formatCurrency(totalSum)})</th>
            <th style={cellStyle}>NUKI kód</th>
            <th style={cellStyle}>Účet</th>
            <th style={cellStyle}>Akcie</th>
          </tr>
        </thead>
        <tbody>
          {reservations
            .slice()
            .sort((a, b) => (b.startDate || "").localeCompare(a.startDate || ""))
            .map((res) => (
            <tr key={res.reservationId}>
              <td style={cellStyle}>{res.reservationId}</td>
              <td style={cellStyle}>{res.startDate ? formatDate(res.startDate) : "-"}</td>
              <td style={cellStyle}>{res.endDate ? formatDate(res.endDate) : "-"}</td>
              <td style={cellStyle}>{res.guestName}</td>
              <td style={cellStyle}>{res.guestContact}</td>
              <td style={cellStyle}>{res.platform}</td>
              <td style={cellStyle}>
                {res.checkInTime} / {res.checkOutTime}
              </td>
              <td style={cellStyle}>{res.adults}</td>
              <td style={cellStyle}>{res.children}</td>
              <td style={cellStyle}>{res.info}</td>
              {/* Financial fields in order: deposit, depositDate, advance, advanceDate, remaining, remainingDate, total */}
              <td style={cellStyle}>{formatCurrency(res.deposit)}</td>
              <td style={cellStyle}>{res.depositDate ? formatDate(res.depositDate) : "-"}</td>
              <td style={cellStyle}>{formatCurrency(res.advance)}</td>
              <td style={cellStyle}>{res.advanceDate ? formatDate(res.advanceDate) : "-"}</td>
              <td style={cellStyle}>{formatCurrency(res.remaining)}</td>
              <td style={cellStyle}>{res.remainingDate ? formatDate(res.remainingDate) : "-"}</td>
              <td style={cellStyle}>{formatCurrency(res.total)}</td>
              <td style={cellStyle}>{res.nukiCode || "-"}</td>
              <td style={cellStyle}>{res.account || "-"}</td>
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

ReservationTable.propTypes = {
  onDataChanged: PropTypes.func,
};

export default ReservationTable;