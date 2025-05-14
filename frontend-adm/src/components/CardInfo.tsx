import React from 'react';

interface CardInfoProps {
  label: string;
  value: string | number;
}

const CardInfo: React.FC<CardInfoProps> = ({ label, value }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-xl font-semibold text-white">{value}</p>
    </div>
  );
};

export default CardInfo;
