import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CHART_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', 
  '#8b5cf6', '#ef4444', '#14b8a6', '#f97316', '#3b82f6'
];

export function ExpenseCategoryChart({ categoryBreakdown = [] }) {
  if (!categoryBreakdown || !categoryBreakdown.length) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
        No expense category data available for this currency.
      </div>
    );
  }

  const data = {
    labels: categoryBreakdown.map(c => c.category_name || c.name || 'Uncategorized'),
    datasets: [
      {
        data: categoryBreakdown.map(c => Number(c.total_amount || c.value || 0)),
        backgroundColor: CHART_COLORS.slice(0, categoryBreakdown.length),
        borderColor: '#0f172a',
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#cbd5e1',
          font: { family: 'Inter', size: 12 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: ${Number(context.raw).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
        }
      }
    }
  };

  return (
    <div style={{ height: '280px', width: '100%' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}

export function IncomeVsExpenseChart({ summary = { total_income: 0, total_expense: 0 } }) {
  const inc = Number(summary?.total_income || summary?.income || 0);
  const exp = Number(summary?.total_expense || summary?.expense || 0);

  const data = {
    labels: ['Total Income', 'Total Expense'],
    datasets: [
      {
        label: 'Amount',
        data: [inc, exp],
        backgroundColor: ['#10b981', '#ef4444'],
        borderRadius: 8
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: ${Number(context.raw).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#cbd5e1' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      },
      y: {
        ticks: { color: '#cbd5e1' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      }
    }
  };

  return (
    <div style={{ height: '280px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}
