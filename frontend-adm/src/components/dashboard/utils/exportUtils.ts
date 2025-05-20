import { StatsData, Alerta } from "../types";

/**
 * Função para gerar conteúdo fictício para download (apenas para demonstração)
 */
export const generateDummyContent = (
  reportId: string, 
  format: string, 
  statsData: StatsData, 
  alertas: Alerta[]
): string => {
  let content = '';
  
  if (format === 'json') {
    // Conteúdo JSON
    const data = {
      nome_relatorio: reportId,
      data_geracao: new Date().toISOString(),
      dados: {
        total_usuarios: statsData.total_usuarios,
        logins_hoje: statsData.logins_hoje,
        alertas_criticos: statsData.alertas_criticos,
        acessos_semana: statsData.acessos_semana,
        alertas_recentes: alertas.map(a => ({
          id: a.id,
          tipo: a.tipo,
          mensagem: a.mensagem,
          data: a.data
        }))
      }
    };
    content = JSON.stringify(data, null, 2);
  } 
  else if (format === 'csv') {
    // Conteúdo CSV
    content = 'data,tipo,valor\n';
    content += `${new Date().toLocaleDateString()},total_usuarios,${statsData.total_usuarios}\n`;
    content += `${new Date().toLocaleDateString()},logins_hoje,${statsData.logins_hoje}\n`;
    content += `${new Date().toLocaleDateString()},alertas_criticos,${statsData.alertas_criticos}\n`;
    
    // Adicionar acessos semanais
    statsData.acessos_semana.forEach((valor, index) => {
      content += `${new Date(Date.now() - (6-index) * 86400000).toLocaleDateString()},acessos_dia,${valor}\n`;
    });
    
    // Adicionar alertas
    alertas.forEach(alerta => {
      content += `${alerta.data},alerta,${alerta.mensagem}\n`;
    });
  }
  else {
    // Para PDF, podemos apenas criar um texto simples que indicaria o conteúdo
    // Em um caso real, você usaria uma biblioteca como jsPDF
    content = `RELATÓRIO: ${reportId.toUpperCase()}
Data: ${new Date().toLocaleString()}

ESTATÍSTICAS GERAIS:
- Total de Usuários: ${statsData.total_usuarios}
- Logins Hoje: ${statsData.logins_hoje}
- Alertas Críticos: ${statsData.alertas_criticos}

ACESSOS SEMANA:
${statsData.acessos_semana.map((valor, index) => {
  const data = new Date(Date.now() - (6-index) * 86400000).toLocaleDateString();
  return `- ${data}: ${valor} acessos`;
}).join('\n')}

ALERTAS RECENTES:
${alertas.map(alerta => `- ${alerta.data}: ${alerta.tipo.toUpperCase()} - ${alerta.mensagem}`).join('\n')}
    `;
  }
  
  return content;
};

/**
 * Formata o tipo de alerta para um formato mais amigável ao usuário
 */
export const formatAlertType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'critical': 'Crítico',
    'warning': 'Alerta',
    'info': 'Informativo'
  };
  
  return typeMap[type] || type;
};

/**
 * Formata os dados para exportação em diferentes formatos
 */
export const formatDataForExport = (
  reportId: string,
  statsData: StatsData,
  alertas: Alerta[],
  format: 'json' | 'csv' | 'pdf'
) => {
  switch (format) {
    case 'json':
      return {
        report_id: reportId,
        timestamp: new Date().toISOString(),
        data: {
          stats: statsData,
          alerts: alertas.map(a => ({
            id: a.id,
            type: a.tipo,
            message: a.mensagem,
            date: a.data,
            status: a.status
          }))
        }
      };
    case 'csv':
      // Estrutura de dados formatada para conversão em CSV
      return [
        { date: new Date().toLocaleDateString(), metric: 'total_usuarios', value: statsData.total_usuarios },
        { date: new Date().toLocaleDateString(), metric: 'logins_hoje', value: statsData.logins_hoje },
        { date: new Date().toLocaleDateString(), metric: 'alertas_criticos', value: statsData.alertas_criticos },
        ...statsData.acessos_semana.map((valor, index) => ({
          date: new Date(Date.now() - (6-index) * 86400000).toLocaleDateString(),
          metric: 'acessos_dia',
          value: valor
        })),
        ...alertas.map(alerta => ({
          date: alerta.data,
          metric: 'alerta',
          value: alerta.mensagem,
          type: alerta.tipo,
          status: alerta.status
        }))
      ];
    case 'pdf':
      // Neste caso, retornamos um objeto com os dados estruturados para o PDF
      return {
        title: `Relatório: ${reportId}`,
        date: new Date().toLocaleString(),
        stats: {
          totalUsers: statsData.total_usuarios,
          todayLogins: statsData.logins_hoje,
          criticalAlerts: statsData.alertas_criticos
        },
        weeklyAccess: statsData.acessos_semana.map((valor, index) => ({
          date: new Date(Date.now() - (6-index) * 86400000).toLocaleDateString(),
          value: valor
        })),
        alerts: alertas.map(alerta => ({
          id: alerta.id,
          type: formatAlertType(alerta.tipo),
          message: alerta.mensagem,
          date: alerta.data,
          status: alerta.status
        }))
      };
    default:
      throw new Error(`Formato não suportado: ${format}`);
  }
}; 