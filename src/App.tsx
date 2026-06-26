import { Navigate, Route, Routes } from 'react-router-dom';
import { StudioHome } from './studio/StudioHome';
import { CreatePanel } from './studio/CreatePanel';
import { PanelEditor } from './studio/PanelEditor';
import { StatsPage } from './studio/StatsPage';
import { PanelPage } from './panel/PanelPage';
import { ControlConsole } from './control/ControlConsole';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/studio" replace />} />
      <Route path="/studio" element={<StudioHome />} />
      <Route path="/studio/new" element={<CreatePanel />} />
      <Route path="/studio/:id/edit" element={<PanelEditor />} />
      <Route path="/studio/:id/stats" element={<StatsPage />} />
      <Route path="/control/:id" element={<ControlConsole />} />
      {/* Fan surface — /p is the short alias used in QR/share links */}
      <Route path="/p/:id" element={<PanelPage />} />
      <Route path="/panel/:id" element={<PanelPage />} />
      <Route path="*" element={<Navigate to="/studio" replace />} />
    </Routes>
  );
}
