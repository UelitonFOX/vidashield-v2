import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-900 p-4">
      <div className="text-center max-w-xl">
        <div className="flex items-center justify-center mb-6">
          <Shield className="h-12 w-12 text-green-400 mr-2" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-500 text-transparent bg-clip-text">
            VidaShield
          </h1>
        </div>
        
        <div className="flex items-center justify-center mb-8">
          <AlertTriangle className="h-24 w-24 text-orange-500" />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">Página não encontrada</h2>
        <p className="text-zinc-400 mb-8">
          A página que você está procurando não existe ou foi movida.
          Verifique o endereço ou retorne para a página inicial.
        </p>
        
        <Link 
          to="/dashboard" 
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-zinc-900"
        >
          <Home className="w-5 h-5 mr-2" />
          Voltar para o Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 