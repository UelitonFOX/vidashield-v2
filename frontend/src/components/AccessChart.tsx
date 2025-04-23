import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart
} from 'recharts';
import { FiCalendar } from 'react-icons/fi';
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

  return (
    <div className="access-chart-container">
      <div className="chart-header">
        <h2 className="section-title">Acessos - Últimos {period} dias</h2>
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

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            data={chartData}
            margin={{
              top: 20,
              right: 20,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2b3c" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#9CA3AF' }} 
              axisLine={{ stroke: '#1e2b3c' }}
              tickLine={{ stroke: '#1e2b3c' }}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fill: '#9CA3AF' }} 
              axisLine={{ stroke: '#1e2b3c' }}
              tickLine={{ stroke: '#1e2b3c' }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              tick={{ fill: '#9CA3AF' }} 
              axisLine={{ stroke: '#1e2b3c' }}
              tickLine={{ stroke: '#1e2b3c' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ 
                paddingTop: '10px',
                color: '#ffffff'
              }}
              formatter={(value) => <span style={{ color: '#9CA3AF' }}>{value}</span>}
            />
            <Bar 
              yAxisId="left"
              dataKey="acessos" 
              name="Acessos diários" 
              fill="#339999" 
              radius={[4, 4, 0, 0]}
              barSize={period === '30' ? 12 : period === '15' ? 20 : 30}
              label={{ 
                position: 'top',
                fill: '#9CA3AF',
                fontSize: 12
              }} 
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
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AccessChart; 