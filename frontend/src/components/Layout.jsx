import React from 'react';
import { useLocation } from 'react-router-dom';

import { ROUTES, matchRoutePattern } from '../lib/routesMeta';
import Footer from './Footer';
import Header from './Header';
import InspectionHighlights from './inspection/InspectionHighlights';
import InspectionProvider from './inspection/InspectionProvider';
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
 *
 * «نظارت و سرکشی» wraps the whole shell, so the capture overlay and the
 * highlights work on EVERY page without any page opting in. ONE attribute on
 * <main> makes every page reportable: `data-report-surface` carries the route
 * PATTERN (`/lists/:listId`, the name the inventory knows it by) and its label
 * comes from routesMeta — so a page added later is reportable with no edit. A
 * page that wants finer addressing marks a block with `data-report-section`.
 */
function Layout({ children }) {
  const location = useLocation();
  const pattern = matchRoutePattern(location.pathname) || location.pathname;
  const label = ROUTES.find((r) => r.path === pattern)?.label || pattern;
  return (
    <InspectionProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Invisible — pings /api/context/location every 5 min (task 2165524b AC6) */}
        <LocationTracker />
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1" data-report-surface={pattern} data-report-surface-label={label}>
            {children}
          </main>
        </div>
        <Footer />
      </div>
      <InspectionHighlights />
    </InspectionProvider>
  );
}

export default Layout;
