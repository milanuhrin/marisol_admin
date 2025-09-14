import PropTypes from 'prop-types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Legend,
  Tooltip,
  Title,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
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
        type: 'bar',
        label: 'Revenues',
        data: revenues,
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'bar',
        label: 'Expenses',
        data: expenses,
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'line',
        label: 'Profit',
        data: profit,
        borderColor: 'rgba(75, 192, 75, 1)',
        backgroundColor: 'rgba(75, 192, 75, 0.2)',
        fill: false,
        yAxisID: 'y',
        tension: 0.2,
        pointBackgroundColor: 'rgba(75, 192, 75, 1)',
        pointBorderColor: 'rgba(75, 192, 75, 1)',
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
        text: `Revenues, Expenses & Profit - ${year}`,
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
      <Bar data={chartData} options={chartOptions} />
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