import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.tsx";
import { Dashboard } from "./pages/Dashboard.tsx";
import { LayoutPack } from "./templates/LayoutPack.tsx";
import "./index.css";
import { StyledPack } from "./templates/StyledPack.tsx";
import VisualizacaoTest from "./pages/VisualizacaoTest.tsx";
import { Ajuda } from "./pages/Ajuda.tsx";
import { ModalProvider } from "./contexts/ModalContext.tsx";
import Estatisticas from "./pages/Estatisticas.tsx";
import Usuarios from "./pages/Usuarios.tsx";
import LogsAcesso from "./pages/LogsAcesso.tsx";
import Alertas from "./pages/Alertas.tsx";
import Configuracoes from "./pages/Configuracoes.tsx";
import Relatorios from "./pages/Relatorios.tsx";
import Exportacoes from "./pages/Exportacoes.tsx";
import Documentacao from "./pages/Documentacao.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ModalProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/estatisticas" element={<Estatisticas />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/logs" element={<LogsAcesso />} />
          <Route path="/alertas" element={<Alertas />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/exportacoes" element={<Exportacoes />} />
          <Route path="/documentacao" element={<Documentacao />} />
          <Route path="/layoutpack" element={<LayoutPack />} />
          <Route path="/styledpack" element={<StyledPack />} />
          <Route path="/teste-visualizacao" element={<VisualizacaoTest />} />
          <Route path="/ajuda" element={<Ajuda />} />
        </Routes>
      </ModalProvider>
    </BrowserRouter>
  </React.StrictMode>
);
