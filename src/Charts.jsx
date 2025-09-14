import PropTypes from 'prop-types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Legend,
  Tooltip,
  Title,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components for line chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  Title
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

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Tržby, Náklady & Zisk - ${year}`,
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

  return (
    <div>
      <Line data={chartData} options={chartOptions} />
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