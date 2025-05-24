import { CheckCircle, XCircle } from 'lucide-react';
import { FeedbackMessage as FeedbackMessageType } from './types';

interface FeedbackMessageProps {
  message: FeedbackMessageType | null;
}

/**
 * Componente para exibir mensagens de feedback
 */
const FeedbackMessage: React.FC<FeedbackMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className={`p-4 rounded-lg flex items-center gap-3 ${
      message.type === 'success' 
        ? 'bg-green-900/30 border border-green-700 text-green-300' 
        : 'bg-red-900/30 border border-red-700 text-red-300'
    }`}>
      {message.type === 'success' ? (
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 flex-shrink-0" />
      )}
      <p>{message.text}</p>
    </div>
  );
};

export default FeedbackMessage; 