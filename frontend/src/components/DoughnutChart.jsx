import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Doughnut } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip, Legend)

const DoughnutChart = ({ title, data, labels }) => {
  const colors = [
    "#0ea5e9", // Ocean Teal
    "#6366f1", // Indigo
    "#8b5cf6", // Violet
    "#f43f5e", // Rose
    "#f59e0b", // Amber
  ]

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors,
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverBorderWidth: 4,
        hoverBorderColor: "#ffffff",
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#64748b",
          font: {
            size: 11,
            weight: '500'
          },
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 10,
      },
    },
    cutout: "75%",
  }

  return (
    <div className="h-48">
      <Doughnut data={chartData} options={options} />
    </div>
  )
}

export default DoughnutChart
