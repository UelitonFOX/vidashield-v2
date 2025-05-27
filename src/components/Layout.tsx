import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Sempre inicia colapsada
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false); // Estado para controlar hover

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleSidebarMouseEnter = () => {
    if (sidebarCollapsed && !isMobile) {
      setSidebarHovered(true);
    }
  };

  const handleSidebarMouseLeave = () => {
    setSidebarHovered(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Sidebar */}
      <div
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      >
        <Sidebar 
          collapsed={sidebarCollapsed && !sidebarHovered}
          isMobile={isMobile}
          onClose={() => setSidebarCollapsed(true)}
        />
      </div>
      
      {/* Main Content - com margem para compensar a sidebar */}
      <div 
        className={`
          min-h-screen transition-all duration-200 ease-in-out
          ${isMobile ? (sidebarCollapsed ? 'ml-16' : 'ml-0') : (sidebarCollapsed && !sidebarHovered ? 'ml-16' : 'ml-64')}
        `}
      >
        {/* Header */}
        <Header 
          toggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />
        
        {/* Page Content - compensando o header fixo */}
        <main className="p-6 pt-20">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 