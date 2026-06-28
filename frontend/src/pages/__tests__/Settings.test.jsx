import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

import Settings from '../Settings';

// Settings is a two-tab shell: هوش مصنوعی (the AI catalog + analysis prompt) and
// اعلان‌ها (notifications). The old "advanced (legacy)" tab was retired.
beforeEach(() => {
  global.fetch = vi.fn((url) => {
    if (url === '/api/ai/overview') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ providers: [], models: [], routes: [], tasks: [], capabilities: [], status: { configured_providers: [], usable_model_count: 0, any_available: false } }),
      });
    }
    if (url === '/api/ai/global-prompt') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ prompt_text: '' }) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
  });
});

describe('Settings page — tabbed shell', () => {
  test('renders only the AI + Notifications tabs and defaults to AI', () => {
    render(<Settings />);
    expect(screen.getByTestId('settings-page')).toBeInTheDocument();
    expect(screen.getByTestId('settings-tab-ai')).toBeInTheDocument();
    expect(screen.getByTestId('settings-tab-notifications')).toBeInTheDocument();
    // the retired legacy/advanced tab must be gone
    expect(screen.queryByTestId('settings-tab-advanced')).toBeNull();
    // default tab is AI → the catalog page is mounted
    expect(screen.getByTestId('ai-settings-page')).toBeInTheDocument();
  });

  test('AI tab hosts the relocated analysis prompt', () => {
    render(<Settings />);
    expect(screen.getByTestId('analysis-prompt-section')).toBeInTheDocument();
    expect(screen.getByTestId('analysis-prompt-textarea')).toBeInTheDocument();
  });

  test('Notifications tab mounts the notifications surface', () => {
    render(<Settings />);
    fireEvent.click(screen.getByTestId('settings-tab-notifications'));
    expect(screen.getByTestId('notification-settings')).toBeInTheDocument();
  });
});
