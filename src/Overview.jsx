// Overview.jsx
import { useEffect, useState } from "react";

const API_URL = "https://eb8ya8rtoc.execute-api.us-east-1.amazonaws.com/main/reservation";

function Overview() {
  const [yearlyTotals, setYearlyTotals] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.success && Array.isArray(data.reservations)) {
          const totals = {};

          data.reservations.forEach((res) => {
            // záloha
            if (res.advanceDate && res.advance) {
              const [year, month] = res.advanceDate.split("-"); // YYYY, MM
              const key = `${year}-${month}`;
              totals[year] = totals[year] || {};
              totals[year][key] = (totals[year][key] || 0) + parseFloat(res.advance);
            }
            // doplatok
            if (res.remainingDate && res.remaining) {
              const [year, month] = res.remainingDate.split("-");
              const key = `${year}-${month}`;
              totals[year] = totals[year] || {};
              totals[year][key] = (totals[year][key] || 0) + parseFloat(res.remaining);
            }
          });

          setYearlyTotals(totals);
        }
      } catch (err) {
        console.error("❌ Error fetching reservations for overview:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  if (loading) return <p>Načítavam prehľad...</p>;

  const yearsSorted = Object.keys(yearlyTotals).sort((a, b) => b.localeCompare(a)); // zostupne podľa roku

  return (
    <div style={{ marginTop: "30px" }}>
      <h3>Prehľad tržieb podľa rokov</h3>

      {yearsSorted.map((year) => {
        const months = yearlyTotals[year];
        const monthsSorted = Object.keys(months).sort();

        const yearlySum = monthsSorted.reduce((sum, monthKey) => sum + months[monthKey], 0);

        return (
          <div key={year} style={{ marginBottom: "40px" }}>
            <h4>{year}</h4>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f0f0f0" }}>
                  <th style={cellStyle}>Mesiac</th>
                  <th style={cellStyle}>Tržby</th>
                </tr>
              </thead>
              <tbody>
                {monthsSorted.map((monthKey) => {
                  const date = new Date(`${monthKey}-01`);
                  const monthName = date.toLocaleString("sk-SK", { month: "long" });
                  return (
                    <tr key={monthKey}>
                      <td style={cellStyle}>{monthName}</td>
                      <td style={cellStyle}>
                        {new Intl.NumberFormat("sk-SK", {
                          style: "currency",
                          currency: "EUR",
                        }).format(months[monthKey])}
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
                    }).format(yearlySum)}
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