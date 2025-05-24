// Utilitários para o módulo de alertas

/**
 * Transforma a severidade da API para o formato exibido na UI
 */
export const mapSeverityToUI = (severity: string): string => {
  const map: Record<string, string> = {
    "critical": "crítico",
    "high": "alto",
    "medium": "médio",
    "low": "baixo"
  };
  return map[severity] || severity;
};

/**
 * Transforma o status da API para o formato exibido na UI
 */
export const mapStatusToUI = (status: string): string => {
  const map: Record<string, string> = {
    "new": "pendente",
    "acknowledged": "reconhecido",
    "resolved": "resolvido"
  };
  return map[status] || status;
};

/**
 * Retorna a classe CSS baseada na severidade
 */
export const getSeverityClass = (severidade: string) => {
  switch(severidade) {
    case "crítico":
    case "critical":
      return "bg-red-800/30 text-red-400 border-red-700";
    case "alto":
    case "high":
      return "bg-orange-800/30 text-orange-400 border-orange-700";
    case "médio":
    case "medium":
      return "bg-yellow-800/30 text-yellow-400 border-yellow-700";
    case "baixo":
    case "low":
      return "bg-blue-800/30 text-blue-400 border-blue-700";
    default:
      return "bg-zinc-800/30 text-zinc-400 border-zinc-700";
  }
};

/**
 * Formata a data para exibição na UI
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}; 