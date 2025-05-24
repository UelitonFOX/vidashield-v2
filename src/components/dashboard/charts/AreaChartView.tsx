import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import ChartTooltip from "./ChartTooltip";
import { ChartData, ChartVisibleSeries } from "../types";

interface AreaChartViewProps {
  data: ChartData[];
  visibleSeries: ChartVisibleSeries;
  toggleSeries: (dataKey: string) => void;
}

/**
 * Componente de gráfico de área com efeito neon
 */
const AreaChartView = ({ data, visibleSeries, toggleSeries }: AreaChartViewProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
      >
        <defs>
          <linearGradient id="areaGradientAccess" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00FFAA" stopOpacity={0.8} />
            <stop offset="75%" stopColor="#00FF99" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#00FF99" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="areaGradientAttempts" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF6666" stopOpacity={0.8} />
            <stop offset="75%" stopColor="#FF4444" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#FF4444" stopOpacity={0} />
          </linearGradient>
          <filter id="glowArea" height="300%" width="300%" x="-75%" y="-75%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
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
        <Area 
          type="monotone" 
          dataKey="acessos" 
          name="Acessos Validados" 
          stroke="#00FF99" 
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#areaGradientAccess)" 
          filter="url(#glowArea)"
          activeDot={{ r: 6, strokeWidth: 2, stroke: "#00FFAA" }}
          animationDuration={1000}
        />
        <Area 
          type="monotone" 
          dataKey="tentativas" 
          name="Tentativas Bloqueadas" 
          stroke="#FF4444" 
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#areaGradientAttempts)"
          filter="url(#glowArea)"
          activeDot={{ r: 6, strokeWidth: 2, stroke: "#FF0000" }}
          animationDuration={1200}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChartView; 