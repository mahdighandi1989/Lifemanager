import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Use /api so the fetches reach the JSON endpoints, not the SPA route.
const API_BASE = '/api';

function StatCard({ title, value, icon, color, linkTo }) {
  return (
    <Link to={linkTo} className="block">
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
          <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
            {icon}
          </div>
        </div>
      </div>
    </Link>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({ tasks: 0, projects: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [tasksRes, projectsRes] = await Promise.all([
          fetch(`${API_BASE}/tasks`),
          fetch(`${API_BASE}/projects`),
        ]);
        if (tasksRes.ok && projectsRes.ok) {
          const tasks = await tasksRes.json();
          const projects = await projectsRes.json();
          const taskList = Array.isArray(tasks) ? tasks : [];
          const projectList = Array.isArray(projects) ? projects : [];
          // Backend's TaskStatus enum uses "done" as the finished
          // marker (see app/models/task.py). Older rows may still
          // carry the legacy "completed" string — treat both as
          // finished here so the dashboard counter doesn't silently
          // misreport progress.
          const completed = taskList.filter(
            t => t.status === 'done' || t.status === 'completed',
          ).length;
          setStats({ tasks: taskList.length, projects: projectList.length, completed });
          setApiStatus('connected');
        } else {
          setApiStatus('error');
        }
      } catch {
        setApiStatus('offline');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">خوش آمدید — مروری بر وضعیت پروژه‌ها و وظایف شما</p>
        </div>

        {/* API Status Banner */}
        {apiStatus === 'offline' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center space-x-3">
            <svg className="w-5 h-5 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-yellow-700">اتصال به پایگاه داده برقرار نیست — برخی قابلیت‌ها محدود هستند.</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="کل وظایف"
            value={loading ? '...' : stats.tasks}
            linkTo="/tasks"
            color="bg-blue-100"
            icon={
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <StatCard
            title="پروژه‌های فعال"
            value={loading ? '...' : stats.projects}
            linkTo="/projects"
            color="bg-purple-100"
            icon={
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            }
          />
          <StatCard
            title="وظایف تکمیل‌شده"
            value={loading ? '...' : stats.completed}
            linkTo="/tasks"
            color="bg-green-100"
            icon={
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">دسترسی سریع</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/tasks"
              className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">مدیریت وظایف</p>
                <p className="text-sm text-gray-500">ایجاد و پیگیری وظایف روزانه</p>
              </div>
            </Link>
            <Link
              to="/projects"
              className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">مدیریت پروژه‌ها</p>
                <p className="text-sm text-gray-500">سازماندهی و پیشرفت پروژه‌ها</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;