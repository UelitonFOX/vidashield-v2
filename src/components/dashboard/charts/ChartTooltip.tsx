import React from 'react';

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    dataKey: string;
    name: string;
    value: number;
  }>;
  label?: string;
}

/**
 * Tooltip customizado para os gráficos com efeito neon
 */
const ChartTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900/95 backdrop-blur-sm border border-green-400/30 rounded-lg p-3 shadow-lg shadow-green-400/20">
        <p className="text-green-300 font-medium text-sm mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm">
            <span 
              className="inline-block w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: entry.color }}
            ></span>
            <span className="text-zinc-300">{entry.name}:</span>
            <span className="text-white font-medium ml-1">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }

  return null;
};

export default ChartTooltip; 