import React from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { TaskProvider } from './context/TaskContext';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import ListDetail from './pages/ListDetail';
import Lists from './pages/Lists';
import Login from './pages/Login';
import Notifications from './pages/Notifications';
import Projects from './pages/Projects';
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
              {/* Public routes — Login temporarily disabled */}
              <Route path="/login" element={<LoginDisabled />} />
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
                      <Projects />
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
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Notifications />
                    </Layout>
                  </ProtectedRoute>
                }
              />
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
