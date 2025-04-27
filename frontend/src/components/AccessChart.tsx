import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  Line,
  Area
} from 'recharts';
import { FiCalendar, FiTrendingUp, FiBarChart2 } from 'react-icons/fi';
import './AccessChart.css';

// Tipos para o componente
interface AccessChartProps {
  weekData?: number[];
}

interface ChartData {
  name: string;
  acessos: number;
  acumulado: number;
}

const AccessChart: React.FC<AccessChartProps> = ({ weekData = [] }) => {
  const [period, setPeriod] = useState<'7' | '15' | '30'>('7');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');
  const [animationKey, setAnimationKey] = useState<number>(0);

  // Dados mockados para os diferentes períodos
  const mockData = {
    '7': [4, 6, 8, 3, 7, 6, 5],
    '15': [4, 6, 8, 3, 7, 6, 5, 3, 4, 7, 8, 6, 5, 7, 9],
    '30': [4, 6, 8, 3, 7, 6, 5, 3, 4, 7, 8, 6, 5, 7, 9, 6, 7, 8, 5, 4, 7, 6, 9, 8, 7, 8, 6, 5, 6, 7]
  };

  // Usa dados reais se fornecidos, caso contrário usa os mockados
  const selectedData = weekData.length > 0 && period === '7' 
    ? weekData 
    : mockData[period];

  // Resetar animação quando o tipo ou período mudar
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [chartType, period]);

  // Preparar os dados para o gráfico
  const chartData: ChartData[] = [];
  let acumulado = 0;

  selectedData.forEach((valor, index) => {
    acumulado += valor;

    // Calcular o dia baseado no período atual
    let day: string;
    const today = new Date();
    const date = new Date(today);
    date.setDate(today.getDate() - (selectedData.length - 1 - index));
    
    // Formatar a data como DD/MM
    day = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;

    chartData.push({
      name: day,
      acessos: valor,
      acumulado: acumulado
    });
  });

  // Customizar o tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-date">{label}</p>
          <p className="tooltip-acessos">
            <span className="acessos-dot"></span>
            Acessos: <span className="value">{payload[0].value}</span>
          </p>
          <p className="tooltip-acumulado">
            <span className="acumulado-dot"></span>
            Total acumulado: <span className="value">{payload[1].value}</span>
          </p>
        </div>
      );
    }
  
    return null;
  };

  const handleMouseEnter = (data: any, index: number) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  const toggleChartType = () => {
    setChartType(prev => prev === 'bar' ? 'area' : 'bar');
  };

  return (
    <div className="access-chart-container">
      <div className="chart-header">
        <h2 className="section-title">Acessos - Últimos {period} dias</h2>
        <div className="chart-controls">
          <div className="chart-type-toggle">
            <button 
              className={`chart-type-button ${chartType === 'bar' ? 'active' : ''}`} 
              onClick={() => setChartType('bar')}
              title="Visualizar como barras"
            >
              <FiBarChart2 size={16} />
            </button>
            <button 
              className={`chart-type-button ${chartType === 'area' ? 'active' : ''}`} 
              onClick={() => setChartType('area')}
              title="Visualizar como área"
            >
              <FiTrendingUp size={16} />
            </button>
          </div>
          <div className="period-selector">
            <div className="selector-icon">
              <FiCalendar size={16} />
            </div>
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value as '7' | '15' | '30')}
              className="period-select"
              aria-label="Selecionar período"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="15">Últimos 15 dias</option>
              <option value="30">Últimos 30 dias</option>
            </select>
          </div>
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300} key={animationKey}>
          <ComposedChart
            data={chartData}
            margin={{
              top: 20,
              right: 20,
              left: 20,
              bottom: 20,
            }}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id="colorAcessos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#339999" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#339999" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="colorAcumulado" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e88a64" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#e88a64" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#64748b' }} 
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fill: '#64748b' }} 
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              tick={{ fill: '#64748b' }} 
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ 
                paddingTop: '10px',
              }}
            />
            
            {chartType === 'bar' ? (
              <>
                <Bar 
                  yAxisId="left"
                  dataKey="acessos" 
                  name="Acessos diários" 
                  fill="url(#colorAcessos)" 
                  radius={[4, 4, 0, 0]}
                  barSize={period === '30' ? 12 : period === '15' ? 20 : 30}
                  animationDuration={1000}
                  animationEasing="ease-out"
                  onMouseEnter={handleMouseEnter}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="acumulado" 
                  name="Total acumulado" 
                  stroke="#e88a64" 
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#e88a64' }}
                  activeDot={{ r: 5 }}
                  animationDuration={1500}
                />
              </>
            ) : (
              <>
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="acessos"
                  name="Acessos diários"
                  stroke="#339999"
                  fillOpacity={1}
                  fill="url(#colorAcessos)"
                  animationDuration={1000}
                  animationEasing="ease-out"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="acumulado" 
                  name="Total acumulado" 
                  stroke="#e88a64" 
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#e88a64' }}
                  activeDot={{ r: 5 }}
                  animationDuration={1500}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <div className="chart-summary">
        <div className="summary-item">
          <div className="summary-icon">
            <FiBarChart2 size={18} />
          </div>
          <div>
            <div className="summary-label">Total de acessos</div>
            <div className="summary-value">{acumulado}</div>
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-icon">
            <FiTrendingUp size={18} />
          </div>
          <div>
            <div className="summary-label">Média diária</div>
            <div className="summary-value">{Math.round(acumulado / selectedData.length * 10) / 10}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessChart; 