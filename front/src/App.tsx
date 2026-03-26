import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { ToastProvider } from '@/hooks/useToast';
import { DarkModeProvider } from '@/hooks/useDarkMode';
import ErrorBoundary from '@/components/ErrorBoundary';
import ToastContainer from '@/components/Ui/ToastContainer';
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
import AdminDashboard from '@/pages/admin/AdminDashboard';
import UsersList from '@/pages/admin/UsersList';
import UserDetail from '@/pages/admin/UserDetail';
import UserEdit from '@/pages/admin/UserEdit';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <DarkModeProvider>
        <AuthProvider>
          <ToastProvider>
            <ErrorBoundary>
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
