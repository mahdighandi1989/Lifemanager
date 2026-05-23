import React from 'react';
import Header from './Header';
import Footer from './Footer';

/**
 * Layout component — provides the main page structure for the application.
 *
 * This component wraps page content with a consistent header, main content area,
 * and footer. It uses Tailwind CSS classes for a full-height flex layout with
 * a light gray background.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The page content to render inside the main area.
 * @returns {JSX.Element} The full page layout wrapper.
 */
function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
