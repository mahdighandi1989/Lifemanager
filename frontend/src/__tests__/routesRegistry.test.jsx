/**
 * The routesMeta ↔ routesRegistry contract — the live system diagram's
 * self-updating guarantee for pages rests on this: App.jsx renders its
 * <Route> tree from ROUTES × PAGE_COMPONENTS, so an entry without a
 * component (or a duplicate path) is a broken page, and this test makes
 * that a loud failure instead of a silent 404.
 */
import { describe, expect, test } from 'vitest';

import { ROUTES, matchRoutePattern } from '../lib/routesMeta';
import PAGE_COMPONENTS from '../routesRegistry';

describe('routesMeta × routesRegistry', () => {
  test('every route entry has a registered page component', () => {
    const missing = ROUTES.filter((r) => !PAGE_COMPONENTS[r.page]).map((r) => r.page);
    expect(missing).toEqual([]);
  });

  test('route paths are unique', () => {
    const paths = ROUTES.map((r) => r.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  test('the canonical pages are all routed', () => {
    const paths = new Set(ROUTES.map((r) => r.path));
    ['/', '/tasks', '/lists', '/system-map', '/settings', '/sahat', '/budget'].forEach((p) =>
      expect(paths.has(p)).toBe(true),
    );
  });

  test('matchRoutePattern resolves concrete URLs to their pattern', () => {
    expect(matchRoutePattern('/')).toBe('/');
    expect(matchRoutePattern('/tasks')).toBe('/tasks');
    expect(matchRoutePattern('/lists/5')).toBe('/lists/:listId');
    expect(matchRoutePattern('/people/12/profile')).toBe('/people/:id/profile');
    expect(matchRoutePattern('/sahat/khoda')).toBe('/sahat/:key');
    // exact segment beats parameter: /settings/notifications is its own page
    expect(matchRoutePattern('/settings/notifications')).toBe('/settings/notifications');
    expect(matchRoutePattern('/no-such-page-anywhere')).toBe(null);
  });
});
