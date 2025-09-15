// Expenses.jsx
import { useState } from "react";
import PropTypes from "prop-types";

const currentMonth = new Date().getMonth() + 1; // 1-12

const EXPENSES_API_URL = "https://eb8ya8rtoc.execute-api.us-east-1.amazonaws.com/main/expenses";

function Expenses({ year, expensesList, monthsSK, categories, onExpensesChanged }) {
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    year: String(year),
    month: String(currentMonth),
    category: "property mng",
    amount: "",
    note: "",
  });
  const [submittingExpense, setSubmittingExpense] = useState(false);
  const [expenseError, setExpenseError] = useState(null);

  const [editExpenseModal, setEditExpenseModal] = useState(false);
  const [editExpenseForm, setEditExpenseForm] = useState({
    year: "",
    month: "",
    category: "",
    amount: "",
    note: "",
  });
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState(null);

  // Handlery
  const handleExpenseChange = (e) => {
    const { name, value } = e.target;
    setExpenseForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setSubmittingExpense(true);
    setExpenseError(null);
    const payload = {
      year: parseInt(expenseForm.year, 10),
      month: parseInt(expenseForm.month, 10),
      category: expenseForm.category,
      amount: parseFloat(expenseForm.amount),
      note: expenseForm.note,
    };
    try {
      const resp = await fetch(EXPENSES_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (data.success) {
        setShowExpenseModal(false);
        setExpenseForm({
          year: String(year),
          month: "1",
          category: "property mng",
          amount: "",
          note: "",
        });
        onExpensesChanged?.();
      } else {
        setExpenseError("Nepodarilo sa pridať náklad.");
      }
    } catch {
      setExpenseError("Chyba pri ukladaní.");
    } finally {
      setSubmittingExpense(false);
    }
  };

  const openEditModal = (expense) => {
    setEditExpenseModal(true);
    setEditExpenseForm({
      year: String(expense.year),
      month: String(expense.month),
      category: expense.category,
      amount: String(expense.amount),
      note: expense.note || "",
    });
    setEditingExpenseId(expense.expenseId);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditExpenseForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmittingEdit(true);
    setEditError(null);
    const payload = {
      year: parseInt(editExpenseForm.year, 10),
      month: parseInt(editExpenseForm.month, 10),
      category: editExpenseForm.category,
      amount: parseFloat(editExpenseForm.amount),
      note: editExpenseForm.note,
    };
    try {
      const resp = await fetch(`${EXPENSES_API_URL}/${editingExpenseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (data.success) {
        setEditExpenseModal(false);
        setEditExpenseForm({ year: "", month: "", category: "", amount: "", note: "" });
        setEditingExpenseId(null);
        onExpensesChanged?.();
      } else {
        setEditError("Nepodarilo sa uložiť úpravu nákladu.");
      }
    } catch {
      setEditError("Chyba pri ukladaní.");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const deleteExpense = async (expenseId) => {
    if (!window.confirm("Naozaj chcete zmazať tento náklad?")) return;
    try {
      const resp = await fetch(`${EXPENSES_API_URL}/${expenseId}`, { method: "DELETE" });
      const data = await resp.json();
      if (data.success) {
        onExpensesChanged?.();
      } else {
        alert("Nepodarilo sa zmazať náklad.");
      }
    } catch {
      alert("Chyba pri mazaní nákladu.");
    }
  };

  const expensesForYear = (expensesList || []).filter((exp) => String(exp.year) === String(year));

  return (
    <div>
      <h3 style={{ marginTop: "30px" }}>Zoznam nákladov v roku {year}</h3>
      <button
        style={{
          marginBottom: "20px",
          background: "#007bff",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
        onClick={() => setShowExpenseModal(true)}
      >
        Nový výdavok
      </button>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={cellStyle}>Mesiac</th>
            <th style={{ ...cellStyle, whiteSpace: "nowrap" }}>Kategória</th>
            <th style={cellStyle}>Poznámka</th>
            <th style={cellStyle}>Suma</th>
            <th style={cellStyle}>Akcie</th>
          </tr>
        </thead>
        <tbody>
          {expensesForYear.length === 0 && (
            <tr>
              <td style={cellStyle} colSpan={5} align="center">
                Žiadne náklady
              </td>
            </tr>
          )}
          {expensesForYear
            .sort((a, b) => parseInt(a.month, 10) - parseInt(b.month, 10))
            .map((exp) => {
              const monthName = exp.month ? monthsSK[parseInt(exp.month, 10) - 1] || "" : "";
              return (
                <tr key={exp.expenseId}>
                  <td style={cellStyle}>{monthName}</td>
                  <td style={{ ...cellStyle, whiteSpace: "nowrap" }}>{exp.category}</td>
                  <td style={cellStyle}>{exp.note || ""}</td>
                  <td style={cellStyle}>
                    {new Intl.NumberFormat("sk-SK", {
                      style: "currency",
                      currency: "EUR",
                    }).format(parseFloat(exp.amount))}
                  </td>
                  <td style={cellStyle}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        style={{
                          padding: "4px 8px",
                          borderRadius: "3px",
                          border: "1px solid #007bff",
                          background: "#007bff",
                          color: "white",
                          cursor: "pointer",
                          fontSize: "0.9em",
                        }}
                        onClick={() => openEditModal(exp)}
                      >
                        Upraviť
                      </button>
                      <button
                        style={{
                          padding: "4px 8px",
                          borderRadius: "3px",
                          border: "1px solid #dc3545",
                          background: "#dc3545",
                          color: "white",
                          cursor: "pointer",
                          fontSize: "0.9em",
                        }}
                        onClick={() => deleteExpense(exp.expenseId)}
                      >
                        Zmazať
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      {/* Modal pre nový náklad */}
      {showExpenseModal && (
        <div style={modalOverlay} onClick={() => setShowExpenseModal(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={closeBtn} onClick={() => setShowExpenseModal(false)}>
              ×
            </button>
            <h4>Nový náklad</h4>
            <form onSubmit={handleExpenseSubmit}>
              <div style={{ marginBottom: "14px" }}>
                <label>
                  Rok:&nbsp;
                  <select name="year" value={expenseForm.year} onChange={handleExpenseChange}>
                    {Array.from({ length: 6 }, (_, i) => 2025 + i).map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label>
                  Mesiac:&nbsp;
                  <select name="month" value={expenseForm.month} onChange={handleExpenseChange}>
                    {monthsSK.map((m, i) => (
                      <option key={i + 1} value={String(i + 1)}>
                        {m}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label>
                  Kategória:&nbsp;
                  <select
                    name="category"
                    value={expenseForm.category}
                    onChange={handleExpenseChange}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label>
                  Poznámka:&nbsp;
                  <input
                    type="text"
                    name="note"
                    value={expenseForm.note}
                    onChange={handleExpenseChange}
                  />
                </label>
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label>
                  Suma (€):&nbsp;
                  <input
                    type="number"
                    name="amount"
                    value={expenseForm.amount}
                    min="0"
                    step="0.01"
                    onChange={handleExpenseChange}
                    required
                  />
                </label>
              </div>
              {expenseError && <div style={{ color: "red" }}>{expenseError}</div>}
              <button type="submit" disabled={submittingExpense}>
                {submittingExpense ? "Ukladám..." : "Pridať"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal pre editáciu nákladu */}
      {editExpenseModal && (
        <div style={modalOverlay} onClick={() => setEditExpenseModal(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={closeBtn} onClick={() => setEditExpenseModal(false)}>
              ×
            </button>
            <h4>Upraviť náklad</h4>
            <form onSubmit={handleEditSubmit}>
              <div style={{ marginBottom: "14px" }}>
                <label>
                  Rok:&nbsp;
                  <select
                    name="year"
                    value={editExpenseForm.year}
                    onChange={handleEditChange}
                  >
                    {Array.from({ length: 6 }, (_, i) => 2025 + i).map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label>
                  Mesiac:&nbsp;
                  <select
                    name="month"
                    value={editExpenseForm.month}
                    onChange={handleEditChange}
                  >
                    {monthsSK.map((m, i) => (
                      <option key={i + 1} value={String(i + 1)}>
                        {m}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label>
                  Kategória:&nbsp;
                  <select
                    name="category"
                    value={editExpenseForm.category}
                    onChange={handleEditChange}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label>
                  Poznámka:&nbsp;
                  <input
                    type="text"
                    name="note"
                    value={editExpenseForm.note}
                    onChange={handleEditChange}
                  />
                </label>
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label>
                  Suma (€):&nbsp;
                  <input
                    type="number"
                    name="amount"
                    value={editExpenseForm.amount}
                    min="0"
                    step="0.01"
                    onChange={handleEditChange}
                    required
                  />
                </label>
              </div>
              {editError && <div style={{ color: "red" }}>{editError}</div>}
              <button type="submit" disabled={submittingEdit}>
                {submittingEdit ? "Ukladám..." : "Uložiť"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const cellStyle = {
  padding: "10px",
  border: "1px solid #ccc",
  textAlign: "left",
  whiteSpace: "nowrap",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.3)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalContent = {
  background: "white",
  padding: "30px",
  borderRadius: "8px",
  minWidth: "320px",
  boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
  position: "relative",
};

const closeBtn = {
  position: "absolute",
  top: "10px",
  right: "10px",
  background: "transparent",
  border: "none",
  fontSize: "22px",
  cursor: "pointer",
};

export default Expenses;

Expenses.propTypes = {
  year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  expensesList: PropTypes.arrayOf(PropTypes.object).isRequired,
  monthsSK: PropTypes.arrayOf(PropTypes.string).isRequired,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  onExpensesChanged: PropTypes.func,
};