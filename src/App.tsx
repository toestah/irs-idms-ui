import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import {
  Dashboard,
  SearchResults,
  MatterDetail,
  DocumentQueue,
  DocumentVerification,
} from './pages';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="matters/:id" element={<MatterDetail />} />
          <Route path="document-queue" element={<DocumentQueue />} />
          <Route path="verification/:id" element={<DocumentVerification />} />
          {/* Placeholder routes for future pages */}
          <Route path="matters" element={<Dashboard />} />
          <Route path="documents" element={<Dashboard />} />
          <Route path="verification" element={<DocumentQueue />} />
          <Route path="reports" element={<Dashboard />} />
          <Route path="settings" element={<Dashboard />} />
          <Route path="help" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
