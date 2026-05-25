import React from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

function Footer() {
  const { isAuthenticated } = useAuth();

  return (
    <footer data-testid="footer" className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Lifemanager. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              Terms of Service
            </a>
            {/*
              login/register links live in the footer too so they're discoverable
              from every page (including the homepage) regardless of auth state.
              The data-testid selectors are what the homepage AC asserts on.
            */}
            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  data-testid="footer-login-link"
                  className="text-sm text-blue-600 hover:underline"
                >
                  ورود
                </Link>
                <Link
                  to="/register"
                  data-testid="footer-register-link"
                  className="text-sm text-blue-600 hover:underline"
                >
                  ثبت‌نام
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
