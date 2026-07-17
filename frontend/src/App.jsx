import React from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { TaskProvider } from './context/TaskContext';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import AISettings from './pages/AISettings';
import Settings from './pages/Settings';
import PeopleProfiles from './pages/PeopleProfiles';
import PersonProfilePage from './pages/PersonProfilePage';
// Grouped hubs (each reuses the original page components as embedded tabs —
// no page content/data logic changed):
import FinanceHub from './pages/FinanceHub';     // برنامه و بودجه + دارایی‌ها
import AssistantHub from './pages/AssistantHub'; // پیشنهادات + تاریخچه + شخصیت + ترسیم آینده
import DataHub from './pages/DataHub';           // ایمپورت + فایل‌های من + ادغام تسک‌ها
import ListDetail from './pages/ListDetail';
import Lists from './pages/Lists';
import Writings from './pages/Writings';
import BrainDashboard from './pages/BrainDashboard';
import ActivityLogPage from './pages/ActivityLogPage';
import Login from './pages/Login';
import AdminUsers from './pages/AdminUsers';
import Notifications from './pages/Notifications';
import ProjectsHub from './pages/ProjectsHub';
import Register from './pages/Register';
import Tasks from './pages/Tasks';

/**
 * ⏸️ Temporary placeholder — Login page is disabled.
 * To re-enable: swap <LoginDisabled /> back to <Login /> in the route below.
 */
function LoginDisabled() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">صفحه ورود موقتاً غیرفعال است</h1>
        <p className="text-gray-500 text-sm mb-6">این صفحه به‌زودی در دسترس خواهد بود.</p>
        <Link to="/" className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    // Provider order matters: Auth on the outside so Project/Task can read
    // the token from useAuth() if they ever need to.
    <AuthProvider>
      <ProjectProvider>
        <TaskProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/welcome" element={<Home />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Tasks />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ProjectsHub />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/brain"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <BrainDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/writings"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Writings />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lists"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Lists />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lists/:listId"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ListDetail />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/activity-log"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ActivityLogPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Notifications />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/notifications"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-settings"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AISettings />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/import"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DataHub />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/ai-models"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/budget"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <FinanceHub />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/finance"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <FinanceHub />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/people-profiles"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <PeopleProfiles />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/people/:id/profile"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <PersonProfilePage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/external-projects"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ProjectsHub />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assistant"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AssistantHub />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recommendations"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AssistantHub />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/personality"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AssistantHub />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/career-planning"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AssistantHub />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/drive-files"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DataHub />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assets"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <FinanceHub />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/merge"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DataHub />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AdminUsers />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              {/* /self-improvement and /self-improvement/profile removed
                  per user request — the eight خودسازی lists are now
                  accessed from /lists like any other todo list. */}
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TaskProvider>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;
