import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { ToastProvider } from '@/hooks/useToast';
import { DarkModeProvider } from '@/hooks/useDarkMode';
import QueryProvider from '@/providers/QueryProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import ToastContainer from '@/components/Ui/ToastContainer';
import ImpersonationBanner from '@/components/Layout/ImpersonationBanner';
import OfflineBanner from '@/components/Ui/OfflineBanner';
import LoadingSpinner from '@/components/Ui/LoadingSpinner';
import Layout from '@/components/Layout/Layout';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import AdminRoute from '@/components/Auth/AdminRoute';

// Lazy loading des pages (chargement a la demande)
const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const Profile = lazy(() => import('@/pages/Profile'));
const OAuthCallback = lazy(() => import('@/pages/OAuthCallback'));
const TwoFactorSetup = lazy(() => import('@/pages/TwoFactorSetup'));
const TwoFactorVerify = lazy(() => import('@/pages/TwoFactorVerify'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const UsersList = lazy(() => import('@/pages/admin/UsersList'));
const UserDetail = lazy(() => import('@/pages/admin/UserDetail'));
const UserEdit = lazy(() => import('@/pages/admin/UserEdit'));
const AuditLog = lazy(() => import('@/pages/admin/AuditLog'));
const PermissionGroups = lazy(() => import('@/pages/admin/PermissionGroups'));
const QueueDashboard = lazy(() => import('@/pages/admin/QueueDashboard'));
const FeatureFlags = lazy(() => import('@/pages/admin/FeatureFlags'));
const GdprExport = lazy(() => import('@/pages/GdprExport'));
const Notifications = lazy(() => import('@/pages/Notifications'));
const NotFound = lazy(() => import('@/pages/NotFound'));

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <QueryProvider>
        <DarkModeProvider>
          <AuthProvider>
            <ToastProvider>
              <ErrorBoundary>
                <ImpersonationBanner />
                <ToastContainer />
                <OfflineBanner />
                <Suspense fallback={<LoadingSpinner />}>
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
                </Suspense>
              </ErrorBoundary>
            </ToastProvider>
          </AuthProvider>
        </DarkModeProvider>
      </QueryProvider>
    </BrowserRouter>
  );
}
