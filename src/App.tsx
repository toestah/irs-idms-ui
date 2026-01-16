import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import {
  Dashboard,
  SearchResults,
  MatterDetail,
  DocumentQueue,
  DocumentVerification,
  Matters,
  Documents,
  Reports,
  Settings,
  Help,
  Account,
  Notifications,
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
          <Route path="account" element={<Account />} />
          <Route path="notifications" element={<Notifications />} />
          
          {/* Placeholder routes for future pages */}
          <Route path="matters" element={<Matters />} />
          <Route path="documents" element={<Documents />} />
          <Route path="verification" element={<DocumentQueue />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<Help />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
