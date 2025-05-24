/**
 * Componente para exibir mensagens de erro na página de alertas
 */
const AlertaMensagemErro = ({ mensagem }: { mensagem: string }) => {
  return (
    <div className="bg-red-950/50 border border-red-700 rounded-lg p-4 mb-6 text-red-300">
      {mensagem}
    </div>
  );
};

export default AlertaMensagemErro; 