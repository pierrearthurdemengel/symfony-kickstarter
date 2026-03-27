import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { ToastProvider } from '@/hooks/useToast';
import { DarkModeProvider } from '@/hooks/useDarkMode';
import ErrorBoundary from '@/components/ErrorBoundary';
import ToastContainer from '@/components/Ui/ToastContainer';
import ImpersonationBanner from '@/components/Layout/ImpersonationBanner';
import Layout from '@/components/Layout/Layout';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import AdminRoute from '@/components/Auth/AdminRoute';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Profile from '@/pages/Profile';
import OAuthCallback from '@/pages/OAuthCallback';
import TwoFactorSetup from '@/pages/TwoFactorSetup';
import TwoFactorVerify from '@/pages/TwoFactorVerify';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import UsersList from '@/pages/admin/UsersList';
import UserDetail from '@/pages/admin/UserDetail';
import UserEdit from '@/pages/admin/UserEdit';
import AuditLog from '@/pages/admin/AuditLog';
import PermissionGroups from '@/pages/admin/PermissionGroups';
import QueueDashboard from '@/pages/admin/QueueDashboard';
import FeatureFlags from '@/pages/admin/FeatureFlags';
import GdprExport from '@/pages/GdprExport';
import Notifications from '@/pages/Notifications';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <DarkModeProvider>
        <AuthProvider>
          <ToastProvider>
            <ErrorBoundary>
              <ImpersonationBanner />
              <ToastContainer />
              <Routes>
                <Route
                  path="/"
                  element={
                    <Layout>
                      <Home />
                    </Layout>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <Layout>
                      <Login />
                    </Layout>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <Layout>
                      <Register />
                    </Layout>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <Layout>
                      <ForgotPassword />
                    </Layout>
                  }
                />
                <Route
                  path="/reset-password"
                  element={
                    <Layout>
                      <ResetPassword />
                    </Layout>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <Notifications />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                {/* Routes OAuth */}
                <Route
                  path="/oauth/callback/:provider"
                  element={
                    <Layout>
                      <OAuthCallback />
                    </Layout>
                  }
                />
                {/* Route RGPD */}
                <Route
                  path="/privacy"
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <GdprExport />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                {/* Routes 2FA */}
                <Route
                  path="/2fa/setup"
                  element={
                    <Layout>
                      <ProtectedRoute>
                        <TwoFactorSetup />
                      </ProtectedRoute>
                    </Layout>
                  }
                />
                <Route
                  path="/2fa/verify"
                  element={
                    <Layout>
                      <TwoFactorVerify />
                    </Layout>
                  }
                />
                {/* Routes admin */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <AdminRoute>
                      <UsersList />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/users/:id"
                  element={
                    <AdminRoute>
                      <UserDetail />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/users/:id/edit"
                  element={
                    <AdminRoute>
                      <UserEdit />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/permissions"
                  element={
                    <AdminRoute>
                      <PermissionGroups />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/queue"
                  element={
                    <AdminRoute>
                      <QueueDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/feature-flags"
                  element={
                    <AdminRoute>
                      <FeatureFlags />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/audit-log"
                  element={
                    <AdminRoute>
                      <AuditLog />
                    </AdminRoute>
                  }
                />
                <Route
                  path="*"
                  element={
                    <Layout>
                      <NotFound />
                    </Layout>
                  }
                />
              </Routes>
            </ErrorBoundary>
          </ToastProvider>
        </AuthProvider>
      </DarkModeProvider>
    </BrowserRouter>
  );
}
