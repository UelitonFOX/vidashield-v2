import React from 'react';

interface SectionTitleProps {
  title: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => {
  return (
    <h2 className="text-2xl font-bold mb-4 text-white">
      {title}
    </h2>
  );
};

export default SectionTitle;
