import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

import AISettings from '../AISettings';

// The page was upgraded to the ALLIN1-style "complete AI settings" form: one
// /api/ai/overview call returns providers (catalog), models (with capabilities),
// task routes, tasks, and capabilities. Provider cards expose enable + key +
// sync; task routing pins a model per task.
const OVERVIEW = {
  providers: [
    {
      key: 'anthropic',
      display_name: 'Anthropic (Claude · API key)',
      enabled: true,
      auth_scheme: 'api_key',
      has_api_key: true,
      api_key_masked: '••••3ebc',
      base_url: 'https://api.anthropic.com',
      env_key: 'ANTHROPIC_API_KEY',
      recommended: true,
      configured: true,
      notes: null,
    },
  ],
  models: [
    {
      id: 7,
      model_key: 'claude-opus-4-8',
      provider_key: 'anthropic',
      display_name: 'Claude Opus 4.8',
      enabled: true,
      capabilities: ['reasoning', 'documents'],
      is_custom: false,
      source: 'catalog',
    },
  ],
  routes: [{ task: 'chat', model_id: null, enabled: true }],
  tasks: [{ id: 'chat', label: 'گفت‌وگو / دستیار', description: '...', preferred: 'reasoning' }],
  capabilities: [
    { id: 'reasoning', label: 'استدلال / Reasoning' },
    { id: 'documents', label: 'اسناد / PDF' },
  ],
  status: { configured_providers: ['anthropic'], usable_model_count: 1, any_available: true },
};

beforeEach(() => {
  global.fetch = vi.fn((url, opts) => {
    if (url === '/api/ai/overview') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(OVERVIEW) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
});

describe('AISettings page (ALLIN1 catalog form)', () => {
  test('renders provider cards, models, and task routing from /overview', async () => {
    render(<AISettings />);
    expect(screen.getByTestId('ai-settings-page')).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByTestId('provider-card-anthropic')).toBeInTheDocument(),
    );
    // model row + a capability chip
    expect(screen.getByTestId('model-row-7')).toBeInTheDocument();
    // task routing select for the chat task
    expect(screen.getByTestId('route-select-chat')).toBeInTheDocument();
    // status banner reflects availability
    expect(screen.getByTestId('ai-status')).toBeInTheDocument();
  });

  test('saving a key PUTs to /api/ai/providers/{key}', async () => {
    render(<AISettings />);
    await waitFor(() => screen.getByTestId('provider-key-input-anthropic'));
    fireEvent.change(screen.getByTestId('provider-key-input-anthropic'), {
      target: { value: 'sk-ant-new' },
    });
    fireEvent.click(screen.getByTestId('provider-save-key-anthropic'));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ai/providers/anthropic',
        expect.objectContaining({ method: 'PUT' }),
      ),
    );
  });

  test('changing a task route PUTs to /api/ai/routes/{task}', async () => {
    render(<AISettings />);
    await waitFor(() => screen.getByTestId('route-select-chat'));
    fireEvent.change(screen.getByTestId('route-select-chat'), { target: { value: '7' } });

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ai/routes/chat',
        expect.objectContaining({ method: 'PUT' }),
      ),
    );
  });
});
