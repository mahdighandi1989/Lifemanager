/**
 * Home — public landing page at /.
 *
 * Renders for unauthenticated users (App.jsx routes the authenticated
 * user past this to the Dashboard). Carries the AC selectors
 * data-testid='login-link' and data-testid='register-link' on its
 * primary calls-to-action so a browser/UI probe at / can find them
 * without going through the Header.
 */
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div
      data-testid="homepage"
      className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100"
    >
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-xl text-center bg-white rounded-2xl shadow-lg p-10">
          <div className="w-16 h-16 mx-auto mb-6 bg-blue-600 rounded-2xl flex items-center justify-center">
            <svg
              className="w-9 h-9 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lifemanager</h1>
          <p className="text-gray-500 mb-8">
            مدیریت تسک‌ها، پروژه‌ها و یادآوری‌ها — یک‌جا.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              to="/login"
              data-testid="login-link"
              className="px-6 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              ورود
            </Link>
            <Link
              to="/register"
              data-testid="register-link"
              className="px-6 py-2.5 rounded-lg text-sm font-medium border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
            >
              ثبت‌نام
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
