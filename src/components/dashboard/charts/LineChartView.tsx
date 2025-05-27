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
import { ChartData, ChartVisibleSeries } from "../../../types/dashboard";

interface LineChartViewProps {
  data: ChartData[];
  visibleSeries: ChartVisibleSeries;
  toggleSeries: (dataKey: string) => void;
}

/**
 * Componente de gráfico de linhas com efeito neon
 */
const LineChartView = ({ data, visibleSeries, toggleSeries }: LineChartViewProps) => {
  // Encontrar o valor máximo para definir o domínio do eixo Y
  const maxValue = Math.max(
    ...data.map(item => Math.max(item.acessos || 0, item.tentativas || 0))
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
      >
        <defs>
          <filter id="lineGlow" height="300%" width="300%" x="-75%" y="-75%">
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
          domain={[0, maxValue * 1.2]}
        />
        <Tooltip content={<ChartTooltip />} wrapperStyle={{ outline: 'none' }} />
        <Legend 
          wrapperStyle={{ 
            paddingTop: 15, 
            fontSize: 12, 
            color: '#888'
          }}
          onClick={(data) => toggleSeries(data.dataKey as string)}
          formatter={(value, entry) => {
            const isVisible = visibleSeries[entry.dataKey as keyof typeof visibleSeries];
            return <span style={{ color: isVisible ? undefined : '#666', opacity: isVisible ? 1 : 0.5 }}>{value}</span>;
          }}
        />
        <Line 
          type="monotone" 
          dataKey="acessos" 
          name="Acessos Validados" 
          stroke="#00FFAA" 
          strokeWidth={3}
          dot={{ r: 6, fill: "#00FFAA", stroke: "#00FF99", strokeWidth: 2 }}
          activeDot={{ r: 8, strokeWidth: 2, stroke: "#00FF99", fill: "#00FFAA" }}
          filter="url(#lineGlow)"
          animationDuration={1200}
          animationBegin={100}
        />
        <Line 
          type="monotone" 
          dataKey="tentativas" 
          name="Tentativas Bloqueadas" 
          stroke="#FF4444" 
          strokeWidth={3}
          dot={{ r: 6, fill: "#FF4444", stroke: "#FF0000", strokeWidth: 2 }}
          activeDot={{ r: 8, strokeWidth: 2, stroke: "#FF0000", fill: "#FF6666" }}
          filter="url(#lineGlow)"
          animationDuration={1200}
          animationBegin={200}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartView; 