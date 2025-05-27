import { Zap, LineChart, Shield, AlertTriangle, Download, RefreshCw, Users2 } from "lucide-react";

// Componente para conteúdo da ajuda em modal
const AjudaModalContent = () => {
  return (
    <div className="p-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-green-300 mb-2">Como usar o Dashboard</h3>
        <p className="text-zinc-400">Guia rápido para navegar e utilizar os recursos do dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-800/60 p-4 rounded-lg border border-zinc-700">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-6 h-6 text-green-400" />
            <h4 className="text-lg font-medium text-green-300">Visão Geral</h4>
          </div>
          <p className="text-zinc-400 text-sm">
            O dashboard apresenta uma visão geral da segurança do sistema, exibindo estatísticas de usuários,
            tentativas de acesso, alertas e insights de segurança em tempo real.
          </p>
        </div>

        <div className="bg-zinc-800/60 p-4 rounded-lg border border-zinc-700">
          <div className="flex items-center gap-2 mb-3">
            <LineChart className="w-6 h-6 text-green-400" />
            <h4 className="text-lg font-medium text-green-300">Gráficos</h4>
          </div>
          <p className="text-zinc-400 text-sm">
            Os gráficos de acessos podem ser visualizados em diferentes formatos (barras, linhas ou área)
            e períodos (7, 15 ou 30 dias). Clique nos botões acima do gráfico para alternar entre as visualizações.
          </p>
        </div>

        <div className="bg-zinc-800/60 p-4 rounded-lg border border-zinc-700">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            <h4 className="text-lg font-medium text-yellow-500">Alertas</h4>
          </div>
          <p className="text-zinc-400 text-sm">
            A seção de alertas recentes exibe os últimos eventos de segurança classificados por severidade.
            Alertas críticos requerem atenção imediata. Clique em "Ver todos" para acessar o histórico completo.
          </p>
        </div>

        <div className="bg-zinc-800/60 p-4 rounded-lg border border-zinc-700">
          <div className="flex items-center gap-2 mb-3">
            <Users2 className="w-6 h-6 text-red-500" />
            <h4 className="text-lg font-medium text-red-500">Usuários Bloqueados</h4>
          </div>
          <p className="text-zinc-400 text-sm">
            Exibe a lista de IPs e usuários bloqueados no sistema devido a tentativas suspeitas.
            O número ao lado de cada IP indica a quantidade de tentativas registradas.
          </p>
        </div>

        <div className="bg-zinc-800/60 p-4 rounded-lg border border-zinc-700">
          <div className="flex items-center gap-2 mb-3">
            <Download className="w-6 h-6 text-blue-400" />
            <h4 className="text-lg font-medium text-blue-400">Exportação</h4>
          </div>
          <p className="text-zinc-400 text-sm">
            Para exportar dados, clique no botão "Exportar Relatório" no topo da página.
            Você pode escolher o tipo de relatório e o formato de saída (CSV, JSON ou PDF).
          </p>
        </div>

        <div className="bg-zinc-800/60 p-4 rounded-lg border border-zinc-700">
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw className="w-6 h-6 text-green-400" />
            <h4 className="text-lg font-medium text-green-300">Atualização</h4>
          </div>
          <p className="text-zinc-400 text-sm">
            Os dados são atualizados automaticamente quando você acessa o dashboard.
            Para atualizar manualmente, clique no botão "Atualizar" no topo da página.
          </p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h4 className="text-lg font-medium text-green-300">Dica Rápida</h4>
        </div>
        <p className="text-zinc-400 text-sm">
          Para uma experiência mais eficiente, confira regularmente os insights de segurança.
          Eles fornecem recomendações personalizadas baseadas nos padrões de uso e possíveis vulnerabilidades detectadas.
        </p>
      </div>
    </div>
  );
};

export default AjudaModalContent; 