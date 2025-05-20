// Tipos para componentes da documentação

export interface DocSectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export interface FaqItemProps {
  question: string;
  answer: string;
}

export interface NavItemProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: (id: string) => void;
} 