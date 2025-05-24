import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import ChartTooltip from "./ChartTooltip";
import { ChartData, ChartVisibleSeries } from "../types";

interface LineChartViewProps {
  data: ChartData[];
  visibleSeries: ChartVisibleSeries;
  toggleSeries: (dataKey: string) => void;
}

/**
 * Componente de gráfico de linhas com brilho neon
 */
const LineChartView = ({ data, visibleSeries, toggleSeries }: LineChartViewProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
      >
        <defs>
          <linearGradient id="lineGradientAccess" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00FFAA" stopOpacity={1} />
            <stop offset="100%" stopColor="#00FF99" stopOpacity={0.3} />
          </linearGradient>
          <linearGradient id="lineGradientAttempts" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF6666" stopOpacity={1} />
            <stop offset="100%" stopColor="#FF4444" stopOpacity={0.3} />
          </linearGradient>
          <filter id="glowLine" height="300%" width="300%" x="-75%" y="-75%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
        <XAxis 
          dataKey="name" 
          stroke="#666" 
          fontSize={11}
          tick={{ fill: '#999' }}
        />
        <YAxis 
          stroke="#666" 
          fontSize={12}
          tick={{ fill: '#DDD' }}
          allowDecimals={false}
          tickCount={5}
        />
        <Tooltip content={<ChartTooltip />} wrapperStyle={{ outline: 'none' }} />
        <Legend 
          wrapperStyle={{ 
            paddingTop: 15, 
            fontSize: 12, 
            color: '#888'
          }}
          onClick={(data) => toggleSeries(data.dataKey as string)}
          formatter={(value, entry, index) => {
            const isVisible = visibleSeries[entry.dataKey as keyof typeof visibleSeries];
            return <span style={{ color: isVisible ? undefined : '#666', opacity: isVisible ? 1 : 0.5 }}>{value}</span>;
          }}
        />
        <Line 
          type="monotone" 
          dataKey="acessos" 
          name="Acessos Validados" 
          stroke="#00FF99" 
          strokeWidth={3}
          filter="url(#glowLine)"
          dot={{ r: 5, fill: "#00FF99", strokeWidth: 0 }}
          activeDot={{ r: 7, strokeWidth: 2, stroke: "#00FFAA" }}
          animationDuration={1000}
        />
        <Line 
          type="monotone" 
          dataKey="tentativas" 
          name="Tentativas Bloqueadas" 
          stroke="#FF4444" 
          strokeWidth={3}
          filter="url(#glowLine)"
          dot={{ 
            r: 6, 
            fill: "#FF4444",
            strokeWidth: 2,
            stroke: "#FF2222"
          }}
          activeDot={{ r: 8, strokeWidth: 2, stroke: "#FF0000", fill: "#FF6666" }}
          animationDuration={1200}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartView; 