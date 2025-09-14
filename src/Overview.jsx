// Overview.jsx
import { useEffect, useState } from "react";

const RESERVATIONS_API_URL = "https://eb8ya8rtoc.execute-api.us-east-1.amazonaws.com/main/reservation";
const EXPENSES_API_URL = "https://eb8ya8rtoc.execute-api.us-east-1.amazonaws.com/main/expenses";

function Overview() {
  const [yearlyTotals, setYearlyTotals] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
            if (exp.date && exp.amount) {
              const [year, month] = exp.date.split("-");
              const key = `${year}-${month}`;
              expensesByYearMonth[year] = expensesByYearMonth[year] || {};
              expensesByYearMonth[year][key] = (expensesByYearMonth[year][key] || 0) + parseFloat(exp.amount);
            }
          });
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
    fetchData();
  }, []);

  if (loading) return <p>Načítavam prehľad</p>;

  const yearsSorted = Object.keys(yearlyTotals).sort((a, b) => b.localeCompare(a)); // zostupne podľa roku

  return (
    <div style={{ marginTop: "30px" }}>
      <h3>Prehľad tržieb a nákladov podľa rokov</h3>

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
          </div>
        );
      })}
    </div>
  );
}

const cellStyle = {
  padding: "10px",
  border: "1px solid #ccc",
  textAlign: "left",
};

export default Overview;