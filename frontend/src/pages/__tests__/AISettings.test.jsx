import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

import AISettings from '../AISettings';

beforeEach(() => {
  global.fetch = vi.fn((url) => {
    if (url === '/api/ai/providers') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: 1, name: 'OpenAI', is_enabled: true }]),
      });
    }
    if (url === '/api/ai/configs') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: 1, name: 'gpt-4o', provider: 'OpenAI' }]),
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
});

describe('AISettings page (task 1a08ded2, AC4)', () => {
  test('renders the providers + models management surface', async () => {
    render(<AISettings />);
    expect(screen.getByTestId('ai-settings-page')).toBeInTheDocument();
    expect(screen.getByTestId('provider-form')).toBeInTheDocument();
    expect(screen.getByTestId('model-form')).toBeInTheDocument();

    // Loaded data is rendered into the right lists.
    await waitFor(() =>
      expect(within(screen.getByTestId('providers-list')).getByText('OpenAI')).toBeInTheDocument(),
    );
    expect(within(screen.getByTestId('models-list')).getByText('gpt-4o')).toBeInTheDocument();
  });

  test('submitting the provider form POSTs to /api/ai/providers', async () => {
    render(<AISettings />);
    fireEvent.change(screen.getByTestId('provider-name-input'), {
      target: { value: 'Anthropic' },
    });
    fireEvent.click(screen.getByTestId('add-provider-btn'));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ai/providers',
        expect.objectContaining({ method: 'POST' }),
      ),
    );
  });

  test('submitting the model form POSTs to /api/ai/configs', async () => {
    render(<AISettings />);
    fireEvent.change(screen.getByTestId('model-name-input'), { target: { value: 'gpt-4o' } });
    fireEvent.change(screen.getByTestId('model-provider-input'), { target: { value: 'OpenAI' } });
    fireEvent.click(screen.getByTestId('add-model-btn'));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ai/configs',
        expect.objectContaining({ method: 'POST' }),
      ),
    );
  });
});
