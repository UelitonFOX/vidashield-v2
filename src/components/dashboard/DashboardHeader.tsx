import React from 'react';

interface DashboardHeaderProps {
  loading?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = () => {
  return (
    <div className="inline-block pl-1 pt-0 pb-1 mb-0">
      <h1 className="text-xl font-semibold text-zinc-400">Dashboard</h1>
    </div>
  );
};

export default DashboardHeader; 