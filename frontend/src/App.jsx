import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardProject from './pages/DashboardProject';
import MyTasks from './pages/MyTasks';
import Projects from './pages/Projects';
import Home from './pages/Home';
import Notifications from './pages/Notifications';

function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center tf-auth-bg">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl tf-gradient animate-pulse" />
        <div className="text-sm text-slate-500 font-medium">Loading TaskFlow…</div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <FullPageLoader />;
  if (user) return <Navigate to="/home" replace />;
  return children;
}

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/dashboard" element={<Navigate to="/home" replace />} />

      <Route path="/home"          element={<Protected><Home /></Protected>} />
      <Route path="/projects"      element={<Protected><Projects /></Protected>} />
      <Route path="/project/:id"   element={<Protected><DashboardProject /></Protected>} />
      <Route path="/my-tasks"      element={<Protected><MyTasks /></Protected>} />
      <Route path="/notifications" element={<Protected><Notifications /></Protected>} />

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
