"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import React from "react";

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Opciones tipadas correctamente
const options: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
    },
    tooltip: {
      mode: "index",
      intersect: false,
      displayColors: false,
    },
  },
  scales: {
    x: {
      grid: {
        color: "#e0e0e0",
      },
      ticks: {
        color: "#333",
        font: {
          weight: "bold", // ✅ corregido (antes usabas string inválido como "600")
        },
      },
    },
    y: {
      grid: {
        color: "#e0e0e0",
      },
      ticks: {
        color: "#333",
      },
    },
  },
};

// Datos de ejemplo
const data = {
  labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo"],
  datasets: [
    {
      label: "Ventas",
      data: [12, 19, 3, 5, 2],
      borderColor: "rgba(75,192,192,1)",
      backgroundColor: "rgba(75,192,192,0.2)",
    },
  ],
};

export default function Page() {
  return (
    <div style={{ height: "400px", width: "100%" }}>
      <Line options={options} data={data} />
    </div>
  );
}


    