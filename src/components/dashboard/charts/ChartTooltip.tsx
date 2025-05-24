import type { TooltipProps } from "recharts";

/**
 * Componente de tooltip personalizado para os gráficos do dashboard
 */
const ChartTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-800/90 backdrop-blur-sm border border-green-400/30 p-2 text-xs rounded-md shadow-[0_0_10px_rgba(0,255,153,0.2)] transition-all duration-200">
        <p className="font-semibold text-zinc-300 mb-2 border-b border-zinc-700 pb-1 text-center">
          {label}
        </p>
        <p className="text-green-300 mb-1 flex items-center gap-1">
          <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
          <span className="font-medium">{payload[0]?.value}</span>
          <span className="text-zinc-400 ml-1">acessos validados</span>
        </p>
        <p className="text-red-400 flex items-center gap-1">
          <span className="w-2 h-2 bg-red-400 rounded-full inline-block"></span>
          <span className="font-medium">{payload[1]?.value}</span>
          <span className="text-zinc-400 ml-1">tentativas bloqueadas</span>
        </p>
      </div>
    );
  }
  return null;
};

export default ChartTooltip; 