import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

import Settings from '../Settings';

// Settings is now a tabbed shell: هوش مصنوعی (new catalog) / اعلان‌ها / پیشرفته
// (the legacy AI provider/model/context + analysis prompt). The legacy controls
// live under the "advanced" tab, so these tests switch to it first.
beforeEach(() => {
  global.fetch = vi.fn((url, opts) => {
    const isGet = !opts || !opts.method;
    if (url === '/api/ai/overview' && isGet) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ providers: [], models: [], routes: [], tasks: [], capabilities: [], status: { configured_providers: [], usable_model_count: 0, any_available: false } }),
      });
    }
    if (url === '/api/ai/providers' && isGet) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 1, name: 'OpenAI' }]) });
    }
    if (url === '/api/ai/configs' && isGet) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 10, name: 'gpt-4o', provider: 'OpenAI' }]) });
    }
    if (url === '/api/ai/global-prompt' && isGet) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ prompt_text: 'INITIAL PROMPT' }) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ prompt_text: 'NEW PROMPT' }) });
  });
});

const openAdvanced = () => fireEvent.click(screen.getByTestId('settings-tab-advanced'));

describe('Settings page — tabbed shell', () => {
  test('renders the tab bar and defaults to the AI tab', () => {
    render(<Settings />);
    expect(screen.getByTestId('settings-page')).toBeInTheDocument();
    expect(screen.getByTestId('settings-tab-ai')).toBeInTheDocument();
    expect(screen.getByTestId('settings-tab-notifications')).toBeInTheDocument();
    expect(screen.getByTestId('settings-tab-advanced')).toBeInTheDocument();
    // default tab is AI → the new catalog page is mounted
    expect(screen.getByTestId('ai-settings-page')).toBeInTheDocument();
  });

  test('Notifications tab mounts the notifications surface', () => {
    render(<Settings />);
    fireEvent.click(screen.getByTestId('settings-tab-notifications'));
    expect(screen.getByTestId('notification-settings')).toBeInTheDocument();
  });

  test('Advanced tab renders the legacy sections + loaded data', async () => {
    render(<Settings />);
    openAdvanced();
    expect(screen.getByTestId('providers-section')).toBeInTheDocument();
    expect(screen.getByTestId('models-section')).toBeInTheDocument();
    expect(screen.getByTestId('analysis-prompt-section')).toBeInTheDocument();
    await waitFor(() =>
      expect(within(screen.getByTestId('providers-list')).getByText('OpenAI')).toBeInTheDocument(),
    );
    expect(within(screen.getByTestId('models-list')).getByText(/gpt-4o/)).toBeInTheDocument();
  });

  test('Advanced tab loads the global analysis prompt into the textarea', async () => {
    render(<Settings />);
    openAdvanced();
    await waitFor(() =>
      expect(screen.getByTestId('analysis-prompt-textarea').value).toBe('INITIAL PROMPT'),
    );
  });

  test('Save PUTs the prompt to /api/ai/global-prompt', async () => {
    render(<Settings />);
    openAdvanced();
    await waitFor(() =>
      expect(screen.getByTestId('analysis-prompt-textarea').value).toBe('INITIAL PROMPT'),
    );
    fireEvent.change(screen.getByTestId('analysis-prompt-textarea'), { target: { value: 'NEW PROMPT' } });
    fireEvent.click(screen.getByTestId('save-prompt-btn'));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ai/global-prompt',
        expect.objectContaining({ method: 'PUT' }),
      ),
    );
  });

  test('Cancel reverts the textarea to the saved value', async () => {
    render(<Settings />);
    openAdvanced();
    await waitFor(() =>
      expect(screen.getByTestId('analysis-prompt-textarea').value).toBe('INITIAL PROMPT'),
    );
    fireEvent.change(screen.getByTestId('analysis-prompt-textarea'), { target: { value: 'EDITED' } });
    expect(screen.getByTestId('analysis-prompt-textarea').value).toBe('EDITED');
    fireEvent.click(screen.getByTestId('cancel-prompt-btn'));
    expect(screen.getByTestId('analysis-prompt-textarea').value).toBe('INITIAL PROMPT');
  });

  test('model form provider select is populated from providers', async () => {
    render(<Settings />);
    openAdvanced();
    await waitFor(() =>
      expect(within(screen.getByTestId('providers-list')).getByText('OpenAI')).toBeInTheDocument(),
    );
    const select = screen.getByTestId('model-provider-select');
    expect(within(select).getByText('OpenAI')).toBeInTheDocument();
  });

  test('submitting the model form POSTs to /api/ai/configs with context settings', async () => {
    render(<Settings />);
    openAdvanced();
    fireEvent.change(screen.getByTestId('context-type-select'), { target: { value: 'all' } });
    fireEvent.change(screen.getByTestId('model-name-input'), { target: { value: 'm-ctx' } });
    fireEvent.click(screen.getByTestId('add-model-btn'));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ai/configs',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"context_type":"all"'),
        }),
      ),
    );
  });

  test('Advanced tab renders the AI Context Settings controls', () => {
    render(<Settings />);
    openAdvanced();
    expect(screen.getByTestId('ai-context-settings')).toBeInTheDocument();
    expect(screen.getByTestId('context-type-select')).toBeInTheDocument();
    expect(screen.getByTestId('dynamic-response-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('token-limit-slider')).toBeInTheDocument();
  });
});
