import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import HomePage from './pages/HomePage';
import ProtectedRoute from './routes/protectedRoute';

import AdminDashboard from './pages/admin/AdminDashboard';
import SupportDashboard from './pages/support/SupportDashboard';
import DeveloperDashboard from './pages/developer/DeveloperDashboard';
import GeneralDashboard from './pages/general/GeneralDashboard';
import DeveloperTicketView from './pages/developer/DeveloperTicketView';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<HomePage />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['ADMIN', 'DEPARTMENT_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/department-admin"
            element={
              <ProtectedRoute roles={['DEPARTMENT_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/support"
            element={
              <ProtectedRoute roles={['SUPPORT']}>
                <SupportDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/developer"
            element={
              <ProtectedRoute roles={['DEVELOPER']}>
                <DeveloperDashboard />
              </ProtectedRoute>
            }
          />

          <Route
              path="/developer/ticket/:ticketId"
              element={
                <ProtectedRoute roles={['DEVELOPER']}>
                  <DeveloperTicketView />
                </ProtectedRoute>
              }
            />

          <Route
            path="/general"
            element={
              <ProtectedRoute roles={['GENERAL', 'CLIENT']}>
                <GeneralDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client"
            element={
              <ProtectedRoute roles={['CLIENT']}>
                <GeneralDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
