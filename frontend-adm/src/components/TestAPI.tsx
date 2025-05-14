const TestAPI = () => {
    const handlePing = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/ping`);
        const data = await res.text();
        alert(`🟢 Resposta do servidor: ${data}`);
      } catch (err) {
        alert(`🔴 Erro ao conectar: ${err}`);
      }
    };
  
    return (
      <button
        onClick={handlePing}
        className="mt-4 btn-neon"
      >
        Testar API 🔄
      </button>
    );
  };
  
  export default TestAPI;
  