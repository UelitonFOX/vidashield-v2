import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { Modal } from '../components/Modal';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalContextType {
  openModal: (title: string, content: ReactNode, size?: ModalSize) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalSize, setModalSize] = useState<ModalSize>('md');

  const openModal = (title: string, content: ReactNode, size: ModalSize = 'md') => {
    setModalTitle(title);
    setModalContent(content);
    setModalSize(size);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    // Limpar o conteúdo apenas após a animação de fechamento
    setTimeout(() => {
      setModalContent(null);
    }, 300);
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          title={modalTitle}
          size={modalSize}
        >
          {modalContent}
        </Modal>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}; 