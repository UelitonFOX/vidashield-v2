import React, { useState } from 'react';
import '../utils/chartConfig';
import { Bar, Pie } from 'react-chartjs-2';
import SectionTitle from '../components/SectionTitle';
import CardInfo from '../components/CardInfo';
import ActionButton from '../components/ActionButton';
import { mockLoginData, mockAlertData, mockSessionData } from '../data/mockReportsData';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
// @ts-ignore
import 'jspdf-autotable';

const Reports: React.FC = () => {
  const [period, setPeriod] = useState(7);
  const [dataType, setDataType] = useState('login');

  const handleExportCSV = () => {
    const csvContent = `data:text/csv;charset=utf-8,${['Tipo,Valor', ...mockLoginData.map(d => `Login Bloqueado,${d.blocked}`)].join('\n')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'relatorio.csv');
    document.body.appendChild(link);
    link.click();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Relatório de Métricas', 20, 10);
    // @ts-ignore
    doc.autoTable({
      head: [['Tipo', 'Valor']],
      body: mockLoginData.map(d => ['Login Bloqueado', d.blocked]),
    });
    doc.save('relatorio.pdf');
  };

  const loginData = {
    labels: mockLoginData.map(data => data.day),
    datasets: [
      {
        label: 'Bloqueados',
        data: mockLoginData.map(data => data.blocked),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Bem-sucedidos',
        data: mockLoginData.map(data => data.successful),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };

  const alertData = {
    labels: mockAlertData.map(data => data.type),
    datasets: [
      {
        data: mockAlertData.map(data => data.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
        ],
      },
    ],
  };

  const sessionData = {
    labels: mockSessionData.map(data => data.user),
    datasets: [
      {
        data: mockSessionData.map(data => data.sessions),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <SectionTitle title="Relatórios e Métricas" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <CardInfo label="Total de Usuários Ativos" value={120} />
        <CardInfo label="Total de Alertas Resolvidos" value={45} />
        <CardInfo label="Último Login" value="2023-10-15 14:30" />
      </div>
      <div className="mb-6">
        <ActionButton label="Exportar CSV" onClick={handleExportCSV} />
        <ActionButton label="Exportar PDF" onClick={handleExportPDF} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <p className="text-white">Gráfico 1: Tentativas de login bloqueadas vs logins bem-sucedidos</p>
          <Bar data={loginData} />
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <p className="text-white">Gráfico 2: Alertas por tipo</p>
          <Pie data={alertData} />
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <p className="text-white">Gráfico 3: Sessões por usuário</p>
          <Bar data={sessionData} />
        </div>
      </div>
    </div>
  );
};

export default Reports;
