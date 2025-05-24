import {
  ServerCrash as IpAlert,
  RotateCw as PasswordChange,
  TrendingUp as AccessTrend,
  MapPin as Location,
  Clock
} from "lucide-react";
import { Insight } from "./types";

interface SecurityInsightsProps {
  insights: Insight[];
}

const SecurityInsights = ({ insights }: SecurityInsightsProps) => {
  return (
    <div className="card-dark p-3 sm:p-4 shadow-glow-soft relative overflow-hidden h-full flex flex-col">
      <h2 className="text-lg sm:text-xl font-semibold text-green-300 mb-3 sm:mb-4">Insights de Segurança</h2>
      
      {/* Efeitos de fundo */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-green-400/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-16 -left-10 w-48 h-48 bg-blue-400/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 flex-1">
        {insights.map((insight, index) => (
          <div 
            key={index} 
            className={`p-3 sm:p-4 bg-zinc-800/80 backdrop-blur-sm rounded-lg border-l-4 shadow-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,153,0.2)] hover:translate-x-0.5 hover:-translate-y-0.5 flex ${
              insight.type === "security" && (index % 2 === 0) ? 'border-red-400 hover:border-red-300' : 
              insight.type === "security" && (index % 2 === 1) ? 'border-blue-400 hover:border-blue-300' : 
              insight.type === "trend" ? 'border-green-400 hover:border-green-300' : 
              'border-yellow-400 hover:border-yellow-300'
            }`}
            style={{animation: `fadeIn 0.5s ease-out ${index * 0.2}s both`}}
          >
            <div className="flex items-start gap-3 w-full">
              <div className={`p-2 rounded-full flex-shrink-0 ${
                insight.type === "security" && (index % 2 === 0) ? 'bg-red-900/30 text-red-400' : 
                insight.type === "security" && (index % 2 === 1) ? 'bg-blue-900/30 text-blue-400' : 
                insight.type === "trend" ? 'bg-green-900/30 text-green-400' : 
                'bg-yellow-900/30 text-yellow-400'
              } animate-pulse`}>
                {insight.type === "security" && (index % 2 === 0) && <IpAlert className="w-5 h-5" />}
                {insight.type === "security" && (index % 2 === 1) && <PasswordChange className="w-5 h-5" />}
                {insight.type === "trend" && <AccessTrend className="w-5 h-5" />}
                {insight.type === "location" && <Location className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-zinc-200 font-medium">{insight.text}</p>
                <div className="flex items-center mt-2 text-[10px] text-zinc-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                  <span className="mx-2">•</span>
                  {index % 2 === 0 ? (
                    <><div className="w-3 h-3 mr-1 bg-green-400 rounded-full" /> Prioridade alta</>
                  ) : (
                    <><div className="w-3 h-3 mr-1 bg-blue-400 rounded-full" /> Informativo</>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityInsights; 