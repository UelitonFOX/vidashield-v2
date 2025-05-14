import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PieController,
  BarController,
  Colors,
  LineElement,
  LineController,
  PointElement
} from 'chart.js';

// Registrando os componentes do Chart.js necessários
ChartJS.register(
  CategoryScale, // Escala de categoria para eixos de dados categorizados
  LinearScale,   // Escala linear para eixos numéricos
  BarElement,    // Elemento para gráficos de barras
  ArcElement,    // Elemento para gráficos de pizza/rosca
  Title,         // Título do gráfico
  Tooltip,       // Tooltips ao passar o mouse
  Legend,        // Legendas do gráfico
  PieController, // Controlador para gráficos de pizza
  BarController, // Controlador para gráficos de barras
  LineElement,   // Elemento para gráficos de linha
  LineController, // Controlador para gráficos de linha
  PointElement,   // Elemento de ponto para gráficos de linha
  Colors         // Cores automáticas
);

export default ChartJS; 