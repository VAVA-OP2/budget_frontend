import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function LineChart({ savingsData, goalAmount }) {
  // Muodosta kaavion labelit aikaleimoista (timestamps)
  const labels = savingsData.map(entry => entry.date.toLocaleDateString());

  // Muodosta kumulatiivinen säästösumma
  let cumulativeSavings = 0;
  const savingsAmounts = savingsData.map(entry => {
    cumulativeSavings += entry.amount; // Kumulatiivinen summa kasvaa
    return cumulativeSavings;
  });

  // Kaavion data ja asetukset
  const data = {
    labels: labels, // Käytetään aikaleimoja labelina
    datasets: [
      {
        label: 'Cumulative Savings',
        data: savingsAmounts, // Käytetään kumulatiivisia säästöjä
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        pointRadius: 5, // Määritä pisteiden koko
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
      },
      {
        label: 'Savings Goal',
        data: new Array(savingsData.length).fill(goalAmount), // Staattinen viiva säästötavoitteelle
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: false,
        borderDash: [], // Pisteviiva tavoitteelle esim jos laitaa 5 , 5
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'white', 
        },
      },
      title: {
        display: true,
        text: 'Savings Progress',
        color: 'white', 
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount',
          color: 'white', 
        },
        ticks: {
          color: 'white', 
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
          color: 'white', 
        },
        ticks: {
          color: 'white', 
        },
      },
    },
  };
  

  return <Line data={data} options={options} />;
}
