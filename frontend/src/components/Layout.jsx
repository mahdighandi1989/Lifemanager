import React from 'react';

import Footer from './Footer';
import Header from './Header';
import LocationTracker from './LocationTracker';
import Sidebar from './Sidebar';

/**
 * Layout — the global page chrome.
 *
 *   ┌── Header ─────────────────────────────┐
 *   │ Sidebar │   main content (children)   │
 *   └─────────┴─────────────────────────────┘
 *   Footer
 *
 * Sidebar is hidden on mobile (md: breakpoint) — Header carries the nav
 * there. Test selectors ([data-testid='header'|'sidebar'|'footer']) live on
 * the respective components.
 */
function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Invisible — pings /api/context/location every 5 min (task 2165524b AC6) */}
      <LocationTracker />
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
      <Footer />
    </div>
  );
}

export default Layout;
