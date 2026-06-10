import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="w-10 h-10 mx-auto mb-3 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-gray-500 text-sm">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // A Google user who hasn't been approved yet (or was rejected) is
  // authenticated but must not reach the app. Show a waiting screen instead.
  // Local password accounts report status "active" and pass straight through.
  const status = user?.status;
  if (status === 'pending' || status === 'rejected') {
    const rejected = status === 'rejected';
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-5xl mb-4">{rejected ? '🚫' : '⏳'}</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {rejected ? 'دسترسی شما رد شده است' : 'در انتظار تأیید ادمین'}
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            {rejected
              ? 'حساب شما اجازهٔ ورود ندارد. در صورت نیاز با مدیر سیستم تماس بگیرید.'
              : 'حساب شما توسط مدیر در حال بررسی است. پس از تأیید می‌توانید وارد شوید.'}
          </p>
          <button
            onClick={logout}
            className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            خروج
          </button>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;