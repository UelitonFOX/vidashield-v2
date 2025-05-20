import { useState } from "react";
import { Download } from "lucide-react";

interface ExportReportModalProps {
  onExport: (reportId: string, format: string) => void;
}

const ExportReportModalContent = ({ onExport }: ExportReportModalProps) => {
  const [selectedReport, setSelectedReport] = useState('dashboard_data');
  const [selectedFormat, setSelectedFormat] = useState('csv');
  
  const reportOptions = [
    { id: 'dashboard_data', name: 'Dados do Dashboard' },
    { id: 'all_alerts', name: 'Todos os Alertas' },
    { id: 'alerts_summary', name: 'Resumo de Alertas' },
    { id: 'all_users', name: 'Lista de Usuários' }
  ];
  
  const formatOptions = [
    { id: 'csv', name: 'CSV', icon: 'CSV', color: 'text-green-400' },
    { id: 'json', name: 'JSON', icon: 'JSON', color: 'text-yellow-400' },
    { id: 'pdf', name: 'PDF', icon: 'PDF', color: 'text-red-400' }
  ];
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium text-green-300 mb-4">Exportar Relatório</h3>
      
      <div className="mb-4">
        <label className="block text-zinc-300 mb-2">Tipo de Relatório</label>
        <select
          value={selectedReport}
          onChange={(e) => setSelectedReport(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 text-zinc-300 px-3 py-2 rounded focus:outline-none focus:border-green-500"
          aria-label="Selecione o tipo de relatório"
        >
          {reportOptions.map(option => (
            <option key={option.id} value={option.id}>{option.name}</option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-zinc-300 mb-2">Formato</label>
        <div className="grid grid-cols-3 gap-2">
          {formatOptions.map(format => (
            <button
              key={format.id}
              className={`p-3 flex flex-col items-center justify-center rounded border ${
                selectedFormat === format.id 
                  ? 'border-green-500 bg-zinc-800 shadow-[0_0_10px_rgba(0,255,153,0.15)]' 
                  : 'border-zinc-700 bg-zinc-900 hover:bg-zinc-800'
              }`}
              onClick={() => setSelectedFormat(format.id)}
            >
              <span className={`text-lg font-bold ${format.color}`}>{format.icon}</span>
              <span className="text-sm text-zinc-400 mt-1">{format.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-6">
        <button
          className="btn-primary w-full py-2"
          onClick={() => onExport(selectedReport, selectedFormat)}
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar Relatório
        </button>
      </div>
    </div>
  );
};

export default ExportReportModalContent; 