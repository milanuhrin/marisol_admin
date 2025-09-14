// Overview.jsx
import { useEffect, useState } from "react";
import Charts from "./Charts";

const RESERVATIONS_API_URL = "https://eb8ya8rtoc.execute-api.us-east-1.amazonaws.com/main/reservation";
const EXPENSES_API_URL = "https://eb8ya8rtoc.execute-api.us-east-1.amazonaws.com/main/expenses";

function Overview() {
  const [yearlyTotals, setYearlyTotals] = useState({});
  const [loading, setLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    year: "2025",
    month: "1",
    category: "property mng",
    amount: "",
  });
  const [submittingExpense, setSubmittingExpense] = useState(false);
  const [expenseError, setExpenseError] = useState(null);
  const [expensesList, setExpensesList] = useState([]);
  // Edit expense modal state
  const [editExpenseModal, setEditExpenseModal] = useState(false);
  const [editExpenseForm, setEditExpenseForm] = useState({
    year: "",
    month: "",
    category: "",
    amount: "",
  });
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState(null);

  // Slovak month names, 1-based
  const monthsSK = [
    "január", "február", "marec", "apríl", "máj", "jún",
    "júl", "august", "september", "október", "november", "december"
  ];
  const categories = [
    "property mng", "inventory", "elektrina", "voda", "community fee",
    "poistenie", "internet", "kamera", "web", "banka", "uctovnictvo", "dane", "Interier/opravy"
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch reservations and expenses in parallel
      const [resRes, resExp] = await Promise.all([
        fetch(RESERVATIONS_API_URL),
        fetch(EXPENSES_API_URL),
      ]);
      const dataRes = await resRes.json();
      const dataExp = await resExp.json();

      // Build revenuesByYearMonth
      const revenuesByYearMonth = {};
      if (dataRes.success && Array.isArray(dataRes.reservations)) {
        dataRes.reservations.forEach((res) => {
          // záloha
          if (res.advanceDate && res.advance) {
            const [year, month] = res.advanceDate.split("-");
            const key = `${year}-${month}`;
            revenuesByYearMonth[year] = revenuesByYearMonth[year] || {};
            revenuesByYearMonth[year][key] = (revenuesByYearMonth[year][key] || 0) + parseFloat(res.advance);
          }
          // doplatok
          if (res.remainingDate && res.remaining) {
            const [year, month] = res.remainingDate.split("-");
            const key = `${year}-${month}`;
            revenuesByYearMonth[year] = revenuesByYearMonth[year] || {};
            revenuesByYearMonth[year][key] = (revenuesByYearMonth[year][key] || 0) + parseFloat(res.remaining);
          }
        });
      }

      // Build expensesByYearMonth
      const expensesByYearMonth = {};
      if (dataExp.success && Array.isArray(dataExp.expenses)) {
        dataExp.expenses.forEach((exp) => {
          if (exp.year && exp.month && exp.amount) {
            const year = String(exp.year);
            const month = String(exp.month).padStart(2, "0");
            const key = `${year}-${month}`;
            expensesByYearMonth[year] = expensesByYearMonth[year] || {};
            expensesByYearMonth[year][key] = (expensesByYearMonth[year][key] || 0) + parseFloat(exp.amount);
          }
        });
        setExpensesList(dataExp.expenses);
      } else {
        setExpensesList([]);
      }

      // Combine into yearlyTotals
      const allYears = new Set([...Object.keys(revenuesByYearMonth), ...Object.keys(expensesByYearMonth)]);
      const combinedTotals = {};
      allYears.forEach((year) => {
        const monthsSet = new Set([
          ...(revenuesByYearMonth[year] ? Object.keys(revenuesByYearMonth[year]) : []),
          ...(expensesByYearMonth[year] ? Object.keys(expensesByYearMonth[year]) : []),
        ]);
        combinedTotals[year] = {};
        monthsSet.forEach((monthKey) => {
          const revenues = revenuesByYearMonth[year]?.[monthKey] || 0;
          const expenses = expensesByYearMonth[year]?.[monthKey] || 0;
          combinedTotals[year][monthKey] = { revenues, expenses };
        });
      });

      setYearlyTotals(combinedTotals);
    } catch (err) {
      console.error("❌ Error fetching data for overview:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleExpenseChange = (e) => {
    const { name, value } = e.target;
    setExpenseForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    };
    try {
      const resp = await fetch(EXPENSES_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!data.success) {
        setExpenseError("Nepodarilo sa pridať náklad.");
      } else {
        setShowExpenseModal(false);
        setExpenseForm({
          year: "2025",
          month: "1",
          category: "property mng",
          amount: "",
        });
        await fetchData();
      }
    } catch {
      setExpenseError("Chyba pri ukladaní.");
    } finally {
      setSubmittingExpense(false);
    }
  };

  // Open edit modal and populate form
  const openEditModal = (expense) => {
    setEditExpenseModal(true);
    setEditExpenseForm({
      year: String(expense.year),
      month: String(expense.month),
      category: expense.category,
      amount: String(expense.amount),
    });
    setEditingExpenseId(expense.expenseId);
    setEditError(null);
    setSubmittingEdit(false);
  };

  // Controlled input for edit modal
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditExpenseForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit edited expense
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmittingEdit(true);
    setEditError(null);
    const payload = {
      year: parseInt(editExpenseForm.year, 10),
      month: parseInt(editExpenseForm.month, 10),
      category: editExpenseForm.category,
      amount: parseFloat(editExpenseForm.amount),
    };
    try {
      const resp = await fetch(`${EXPENSES_API_URL}/${editingExpenseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!data.success) {
        setEditError("Nepodarilo sa uložiť úpravu nákladu.");
      } else {
        setEditExpenseModal(false);
        setEditExpenseForm({
          year: "",
          month: "",
          category: "",
          amount: "",
        });
        setEditingExpenseId(null);
        await fetchData();
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
      const resp = await fetch(`${EXPENSES_API_URL}/${expenseId}`, {
        method: "DELETE",
      });
      const data = await resp.json();
      if (data.success) {
        // Remove from local state
        setExpensesList((prev) => prev.filter((exp) => exp.expenseId !== expenseId));
        // Refetch totals to update display
        await fetchData();
      } else {
        alert("Nepodarilo sa zmazať náklad.");
      }
    } catch {
      alert("Chyba pri mazaní nákladu.");
    }
  };

  if (loading) return <p>Načítavam prehľad</p>;

  const yearsSorted = Object.keys(yearlyTotals).sort((a, b) => b.localeCompare(a)); // zostupne podľa roku

  return (
    <div style={{ marginTop: "30px" }}>
      <h3>Prehľad tržieb a nákladov podľa rokov</h3>

      {showExpenseModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.3)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            background: "white",
            padding: "30px",
            borderRadius: "8px",
            minWidth: "320px",
            boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
            position: "relative"
          }}>
            <button
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "transparent",
                border: "none",
                fontSize: "22px",
                cursor: "pointer"
              }}
              onClick={() => setShowExpenseModal(false)}
              aria-label="Zavrieť"
            >×</button>
            <h4>Nový náklad</h4>
            <form onSubmit={handleExpenseSubmit}>
              <div style={{ marginBottom: "14px" }}>
                <label>
                  Rok:&nbsp;
                  <select
                    name="year"
                    value={expenseForm.year}
                    onChange={handleExpenseChange}
                    style={{ padding: "6px", borderRadius: "3px" }}
                  >
                    {Array.from({ length: 6 }, (_, i) => 2025 + i).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label>
                  Mesiac:&nbsp;
                  <select
                    name="month"
                    value={expenseForm.month}
                    onChange={handleExpenseChange}
                    style={{ padding: "6px", borderRadius: "3px" }}
                  >
                    {monthsSK.map((m, i) => (
                      <option key={i + 1} value={String(i + 1)}>{m}</option>
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
                    style={{ padding: "6px", borderRadius: "3px" }}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
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
                    style={{ padding: "6px", borderRadius: "3px", width: "100px" }}
                  />
                </label>
              </div>
              {expenseError && (
                <div style={{ color: "red", marginBottom: "8px" }}>{expenseError}</div>
              )}
              <button
                type="submit"
                disabled={submittingExpense}
                style={{
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  fontWeight: "bold",
                  cursor: submittingExpense ? "not-allowed" : "pointer"
                }}
              >
                {submittingExpense ? "Ukladám..." : "Pridať"}
              </button>
            </form>
          </div>
        </div>
      )}

      {yearsSorted.map((year) => {
        const months = yearlyTotals[year];
        const monthsSorted = Object.keys(months).sort();

        let yearlyRevenues = 0;
        let yearlyExpenses = 0;
        let yearlyProfit = 0;

        // Pre-calculate totals
        monthsSorted.forEach((monthKey) => {
          yearlyRevenues += months[monthKey].revenues;
          yearlyExpenses += months[monthKey].expenses;
          yearlyProfit += months[monthKey].revenues - months[monthKey].expenses;
        });

        // Filter expenses for this year
        const expensesForYear = expensesList.filter(exp => String(exp.year) === year);

        <Charts year={year} months={monthsSorted.map(mk => ({
          key: mk,
          label: new Date(`${mk}-01`).toLocaleString("sk-SK", { month: "long" })
        }))} totals={months} />

        return (
          <div key={year} style={{ marginBottom: "40px" }}>
            <h4>{year}</h4>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f0f0f0" }}>
                  <th style={cellStyle}>Mesiac</th>
                  <th style={cellStyle}>Tržby</th>
                  <th style={cellStyle}>Náklady</th>
                  <th style={cellStyle}>Zisk</th>
                </tr>
              </thead>
              <tbody>
                {monthsSorted.map((monthKey) => {
                  const date = new Date(`${monthKey}-01`);
                  const monthName = date.toLocaleString("sk-SK", { month: "long" });
                  const { revenues, expenses } = months[monthKey];
                  const profit = revenues - expenses;
                  return (
                    <tr key={monthKey}>
                      <td style={cellStyle}>{monthName}</td>
                      <td style={cellStyle}>
                        {new Intl.NumberFormat("sk-SK", {
                          style: "currency",
                          currency: "EUR",
                        }).format(revenues)}
                      </td>
                      <td style={cellStyle}>
                        {new Intl.NumberFormat("sk-SK", {
                          style: "currency",
                          currency: "EUR",
                        }).format(expenses)}
                      </td>
                      <td style={cellStyle}>
                        {new Intl.NumberFormat("sk-SK", {
                          style: "currency",
                          currency: "EUR",
                        }).format(profit)}
                      </td>
                    </tr>
                  );
                })}
                <tr style={{ fontWeight: "bold", background: "#e0e0e0" }}>
                  <td style={cellStyle}>Celkom za rok</td>
                  <td style={cellStyle}>
                    {new Intl.NumberFormat("sk-SK", {
                      style: "currency",
                      currency: "EUR",
                    }).format(yearlyRevenues)}
                  </td>
                  <td style={cellStyle}>
                    {new Intl.NumberFormat("sk-SK", {
                      style: "currency",
                      currency: "EUR",
                    }).format(yearlyExpenses)}
                  </td>
                  <td style={cellStyle}>
                    {new Intl.NumberFormat("sk-SK", {
                      style: "currency",
                      currency: "EUR",
                    }).format(yearlyProfit)}
                  </td>
                </tr>
              </tbody>
            </table>

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
                fontWeight: "bold"
              }}
              onClick={() => setShowExpenseModal(true)}
            >
              Pridať nový náklad
            </button>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
              <thead>
                <tr style={{ background: "#f0f0f0" }}>
                  <th style={cellStyle}>Mesiac</th>
                  <th style={cellStyle}>Kategória</th>
                  <th style={cellStyle}>Suma</th>
                  <th style={cellStyle}>Akcie</th>
                </tr>
              </thead>
              <tbody>
                {expensesForYear.length === 0 && (
                  <tr>
                    <td style={cellStyle} colSpan={4} align="center">Žiadne náklady</td>
                  </tr>
                )}
                {expensesForYear
                  .sort((a, b) => parseInt(a.month, 10) - parseInt(b.month, 10))
                  .map((exp) => {
                    const monthName = exp.month ? monthsSK[parseInt(exp.month, 10) - 1] || "" : "";
                    return (
                      <tr key={exp.expenseId}>
                        <td style={cellStyle}>{monthName}</td>
                        <td style={cellStyle}>{exp.category}</td>
                        <td style={cellStyle}>
                          {new Intl.NumberFormat("sk-SK", {
                            style: "currency",
                            currency: "EUR",
                          }).format(parseFloat(exp.amount))}
                        </td>
                        <td style={cellStyle}>
                          <button
                            style={{
                              marginRight: "8px",
                              padding: "4px 8px",
                              borderRadius: "3px",
                              border: "1px solid #007bff",
                              background: "#007bff",
                              color: "white",
                              cursor: "pointer",
                              fontSize: "0.9em"
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
                              fontSize: "0.9em"
                            }}
                            onClick={() => deleteExpense(exp.expenseId)}
                          >
                            Zmazať
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        );
      })}
      {/* Edit Expense Modal */}
      {editExpenseModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.3)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            background: "white",
            padding: "30px",
            borderRadius: "8px",
            minWidth: "320px",
            boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
            position: "relative"
          }}>
            <button
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "transparent",
                border: "none",
                fontSize: "22px",
                cursor: "pointer"
              }}
              onClick={() => setEditExpenseModal(false)}
              aria-label="Zavrieť"
            >×</button>
            <h4>Upraviť náklad</h4>
            <form onSubmit={handleEditSubmit}>
              <div style={{ marginBottom: "14px" }}>
                <label>
                  Rok:&nbsp;
                  <select
                    name="year"
                    value={editExpenseForm.year}
                    onChange={handleEditChange}
                    style={{ padding: "6px", borderRadius: "3px" }}
                  >
                    {Array.from({ length: 6 }, (_, i) => 2025 + i).map((y) => (
                      <option key={y} value={y}>{y}</option>
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
                    style={{ padding: "6px", borderRadius: "3px" }}
                  >
                    {monthsSK.map((m, i) => (
                      <option key={i + 1} value={String(i + 1)}>{m}</option>
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
                    style={{ padding: "6px", borderRadius: "3px" }}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
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
                    style={{ padding: "6px", borderRadius: "3px", width: "100px" }}
                  />
                </label>
              </div>
              {editError && (
                <div style={{ color: "red", marginBottom: "8px" }}>{editError}</div>
              )}
              <button
                type="submit"
                disabled={submittingEdit}
                style={{
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  fontWeight: "bold",
                  cursor: submittingEdit ? "not-allowed" : "pointer"
                }}
              >
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
};

export default Overview;