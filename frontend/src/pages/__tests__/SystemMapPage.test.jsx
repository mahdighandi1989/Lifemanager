import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// vi.mock is hoisted, so build the mock fns via vi.hoisted to avoid the
// "cannot access before initialization" trap (same idiom as MorePages.test).
const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));

vi.mock('../../lib/api', () => ({ default: { get, post } }));

import SystemMapPage from '../SystemMapPage';

const GUIDE_PAYLOAD = {
  ok: true,
  counts: {
    tasks: 42,
    projects: 3,
    lists: 33,
    todo_items: 812,
    writings: 7,
    people: 19,
    accounts: 4,
    transactions: -1, // unavailable → chip must be hidden
    emails_synced: 120,
    events_synced: 55,
    inbox_pending: 2,
  },
  sections: [
    {
      key: 'capture',
      title: 'ثبت و ورود',
      items: [
        { name: 'کپچر تلگرام', url: null, auto: true, desc: 'هر پیام تلگرام → تسک' },
        { name: 'ایمپورت داده', url: '/import', auto: false, desc: 'ورود فایل/اکسل' },
      ],
    },
    {
      key: 'life',
      title: 'زندگی و دارایی',
      items: [
        { name: 'پروندهٔ زندگی', url: '/life-file', auto: true, desc: 'مدارک و اشتراک‌ها' },
      ],
    },
  ],
};

const GRAPH_PAYLOAD = {
  ok: true,
  nodes: [
    {
      id: 'page:Tasks',
      kind: 'page',
      label: 'کارها',
      sub: '/tasks',
      detail: { paths: ['/tasks'], group: 'daily', file: 'frontend/src/pages/Tasks.jsx' },
    },
    {
      id: 'router:app/routes/tasks.py',
      kind: 'router',
      label: 'کارها',
      sub: 'tasks',
      detail: { file: 'app/routes/tasks.py', endpoints: [{ methods: ['GET'], path: '/api/tasks' }] },
    },
    {
      id: 'service:app/services/planner_service.py',
      kind: 'service',
      label: 'planner_service',
      sub: 'planner_service',
      detail: { file: 'app/services/planner_service.py' },
    },
  ],
  edges: [
    { source: 'page:Tasks', target: 'router:app/routes/tasks.py', kind: 'calls' },
    {
      source: 'router:app/routes/tasks.py',
      target: 'service:app/services/planner_service.py',
      kind: 'imports',
    },
  ],
  stats: { nodes: 3, edges: 2, by_kind: { page: 1, router: 1, service: 1 } },
  layout: {},
  manual_wires: [],
  learned_wires: [],
  engines: [],
};

const ACTIVITY_PAYLOAD = {
  ok: true,
  window_seconds: 60,
  server_ts: 0,
  routers: { 'app/routes/tasks.py': { count: 2, last_ago: 1.0, last_path: '/api/tasks', errors: 0 } },
  pairs: [{ page: '/tasks', router_file: 'app/routes/tasks.py', count: 2, last_ago: 1.0 }],
  engines: [],
};

function mockByUrl() {
  get.mockImplementation((url) => {
    if (url === '/system-map') return Promise.resolve({ data: GUIDE_PAYLOAD });
    if (url === '/system-map/graph') return Promise.resolve({ data: GRAPH_PAYLOAD });
    if (url === '/system-map/activity') return Promise.resolve({ data: ACTIVITY_PAYLOAD });
    return Promise.resolve({ data: {} });
  });
  post.mockResolvedValue({ data: { ok: true, manual_wires: [] } });
}

describe('SystemMapPage — live diagram + راهنما', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockByUrl();
  });

  test('default tab is the live diagram, built from /system-map/graph', async () => {
    render(
      <MemoryRouter initialEntries={['/system-map']}>
        <SystemMapPage />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('system-map-page')).toBeInTheDocument();
    expect(screen.getByTestId('system-map-tab-diagram')).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByTestId('system-diagram')).toBeInTheDocument(),
    );
    expect(get).toHaveBeenCalledWith('/system-map/graph');
    // the pulse poll starts immediately
    expect(get).toHaveBeenCalledWith('/system-map/activity', { params: { window: 60 } });

    // every node in the payload renders as a card
    await waitFor(() =>
      expect(screen.getByTestId('diagram-node-page:Tasks')).toBeInTheDocument(),
    );
    expect(screen.getByTestId('diagram-node-router:app/routes/tasks.py')).toBeInTheDocument();
    expect(
      screen.getByTestId('diagram-node-service:app/services/planner_service.py'),
    ).toBeInTheDocument();
    // live-pulse chip present
    expect(screen.getByTestId('system-diagram-live')).toBeInTheDocument();
  });

  test('the old راهنما view is preserved behind its tab (sections, chips)', async () => {
    render(
      <MemoryRouter initialEntries={['/system-map']}>
        <SystemMapPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId('system-map-tab-guide'));

    await waitFor(() => expect(screen.getByText('ثبت و ورود')).toBeInTheDocument());
    expect(get).toHaveBeenCalledWith('/system-map');

    expect(screen.getByText('زندگی و دارایی')).toBeInTheDocument();
    expect(screen.getByText('ایمپورت داده').closest('a')).toHaveAttribute('href', '/import');
    expect(screen.getByText('پروندهٔ زندگی').closest('a')).toHaveAttribute('href', '/life-file');
    expect(screen.getByText('کپچر تلگرام').closest('a')).toBeNull();
    expect(screen.getAllByText('خودکار ⚙️')).toHaveLength(2);
    expect(screen.getByText('ورود فایل/اکسل')).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByTestId('system-map-chip-tasks')).toBeInTheDocument(),
    );
    expect(screen.getByTestId('system-map-chip-tasks')).toHaveTextContent('42');
    expect(screen.getByTestId('system-map-chip-tasks')).toHaveTextContent('تسک‌ها');
    expect(screen.getByTestId('system-map-chip-inbox_pending')).toHaveTextContent('در انتظار');
    // transactions is -1 (unavailable) → no chip
    expect(screen.queryByTestId('system-map-chip-transactions')).toBeNull();
  });

  test('clicking a card opens the detail panel with real endpoint list', async () => {
    render(
      <MemoryRouter initialEntries={['/system-map']}>
        <SystemMapPage />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('diagram-node-router:app/routes/tasks.py')).toBeInTheDocument(),
    );
    const card = screen.getByTestId('diagram-node-router:app/routes/tasks.py');
    fireEvent.pointerDown(card);
    fireEvent.pointerUp(card);
    await waitFor(() =>
      expect(screen.getByTestId('system-diagram-panel')).toBeInTheDocument(),
    );
    expect(screen.getByText(/GET \/api\/tasks/)).toBeInTheDocument();
  });
});
