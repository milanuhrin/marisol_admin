import PropTypes from 'prop-types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Legend,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components for line chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
  Tooltip
);

/**
 * Charts component
 * @param {Object} props
 * @param {number|string} props.year
 * @param {Array<{ key: string, label: string }>} props.months
 * @param {Object} props.totals - keyed by monthKey, value: { revenues, expenses }
 */
const Charts = ({ year, months, totals }) => {
  // Safe fallback for months and totals
  const safeMonths = Array.isArray(months) ? months : [];
  const safeTotals = totals && typeof totals === 'object' ? totals : {};
  // Prepare labels and datasets
  const labels = safeMonths.map((m) => m.label);
  const revenues = safeMonths.map((m) =>
    safeTotals[m.key] && typeof safeTotals[m.key].revenues === 'number'
      ? safeTotals[m.key].revenues
      : 0
  );
  const expenses = safeMonths.map((m) =>
    safeTotals[m.key] && typeof safeTotals[m.key].expenses === 'number'
      ? safeTotals[m.key].expenses
      : 0
  );
  const profit = revenues.map((rev, idx) => rev - expenses[idx]);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Tržby',
        data: revenues,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: false,
        tension: 0.3,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: 'rgba(54, 162, 235, 1)',
        pointStyle: 'circle',
      },
      {
        label: 'Náklady',
        data: expenses,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: false,
        tension: 0.3,
        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
        pointBorderColor: 'rgba(255, 99, 132, 1)',
        pointStyle: 'rect',
      },
      {
        label: 'Zisk',
        data: profit,
        borderColor: 'rgba(75, 192, 75, 1)',
        backgroundColor: 'rgba(75, 192, 75, 0.2)',
        fill: false,
        tension: 0.3,
        pointBackgroundColor: 'rgba(75, 192, 75, 1)',
        pointBorderColor: 'rgba(75, 192, 75, 1)',
        pointStyle: 'triangle',
      },
    ],
  };

  // Compute cumulative data
  const cumulativeRevenues = [];
  const cumulativeExpenses = [];
  const cumulativeProfit = [];
  revenues.reduce((acc, val) => {
    const cumRev = acc + val;
    cumulativeRevenues.push(cumRev);
    return cumRev;
  }, 0);
  expenses.reduce((acc, val) => {
    const cumExp = acc + val;
    cumulativeExpenses.push(cumExp);
    return cumExp;
  }, 0);
  profit.reduce((acc, val) => {
    const cumProf = acc + val;
    cumulativeProfit.push(cumProf);
    return cumProf;
  }, 0);

  const chartDataCumulative = {
    labels,
    datasets: [
      {
        label: 'Tržby',
        data: cumulativeRevenues,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: false,
        tension: 0.3,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: 'rgba(54, 162, 235, 1)',
        pointStyle: 'circle',
      },
      {
        label: 'Náklady',
        data: cumulativeExpenses,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: false,
        tension: 0.3,
        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
        pointBorderColor: 'rgba(255, 99, 132, 1)',
        pointStyle: 'rect',
      },
      {
        label: 'Zisk',
        data: cumulativeProfit,
        borderColor: 'rgba(75, 192, 75, 1)',
        backgroundColor: 'rgba(75, 192, 75, 0.2)',
        fill: false,
        tension: 0.3,
        pointBackgroundColor: 'rgba(75, 192, 75, 1)',
        pointBorderColor: 'rgba(75, 192, 75, 1)',
        pointStyle: 'triangle',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Month',
        },
      },
    },
  };

  const chartOptionsCumulative = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
    },
  };

  return (
    <div>
      <h3>Tržby, Náklady & Zisk - {year}</h3>
      <Line data={chartData} options={chartOptions} />
      <h3 style={{ marginTop: "20px" }}>Kumulatívne Tržby, Náklady & Zisk - {year}</h3>
      <Line data={chartDataCumulative} options={chartOptionsCumulative} />
    </div>
  );
};

Charts.propTypes = {
  year: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  months: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string,
    })
  ),
  totals: PropTypes.object,
};

Charts.defaultProps = {
  year: '',
  months: [],
  totals: {},
};

export default Charts;