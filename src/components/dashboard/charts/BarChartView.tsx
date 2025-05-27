import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import ChartTooltip from "./ChartTooltip";
import { ChartData, ChartVisibleSeries } from "../../../types/dashboard";

interface BarChartViewProps {
  data: ChartData[];
  visibleSeries: ChartVisibleSeries;
  toggleSeries: (dataKey: string) => void;
}

/**
 * Componente de gráfico de barras com efeito neon
 */
const BarChartView = ({ data, visibleSeries, toggleSeries }: BarChartViewProps) => {
  // Encontrar o valor máximo para definir o domínio do eixo Y
  const maxAcessos = Math.max(...data.map(item => item.acessos || 0));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
      >
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00FFAA" stopOpacity={1} />
            <stop offset="100%" stopColor="#00FF99" stopOpacity={0.7} />
          </linearGradient>
          <filter id="glow" height="300%" width="300%" x="-75%" y="-75%">
            <feGaussianBlur stdDeviation="5" result="coloredBlur" />
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
          domain={[0, maxAcessos * 1.2]}
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
            // Aplicar estilo de opacidade reduzida à legenda se a série estiver oculta
            const isVisible = visibleSeries[entry.dataKey as keyof typeof visibleSeries];
            return <span style={{ color: isVisible ? undefined : '#666', opacity: isVisible ? 1 : 0.5 }}>{value}</span>;
          }}
        />
        <Bar 
          dataKey="acessos" 
          name="Acessos Validados" 
          fill="url(#barGradient)" 
          filter="url(#glow)"
          radius={[4, 4, 0, 0]}
          barSize={30} 
          animationDuration={1000}
          animationBegin={100}
          animationEasing="ease-out"
        />
        {/* Linha conectando as colunas */}
        <Line 
          type="monotone" 
          dataKey="acessos" 
          name="Conexão de Acessos" 
          stroke="#00FFAA" 
          strokeWidth={2}
          dot={false}
          activeDot={false}
          legendType="none"
          strokeOpacity={0.6}
          filter="url(#glow)"
          animationDuration={1200}
        />
        <Line 
          type="monotone" 
          dataKey="tentativas" 
          name="Tentativas Bloqueadas" 
          stroke="#FF4444" 
          strokeWidth={2}
          dot={{ r: 5, fill: "#FF4444", stroke: "#FF0000", strokeWidth: 1 }}
          activeDot={{ r: 6, strokeWidth: 2, stroke: "#FF0000", fill: "#FF6666" }}
          animationDuration={1200}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default BarChartView; 