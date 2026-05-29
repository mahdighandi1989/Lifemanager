import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

import Settings from '../Settings';

beforeEach(() => {
  global.fetch = vi.fn((url, opts) => {
    const isGet = !opts || !opts.method;
    if (url === '/api/ai/providers' && isGet) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 1, name: 'OpenAI' }]) });
    }
    if (url === '/api/ai/configs' && isGet) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: 10, name: 'gpt-4o', provider: 'OpenAI' }]),
      });
    }
    if (url === '/api/ai/global-prompt' && isGet) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ prompt_text: 'INITIAL PROMPT' }) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ prompt_text: 'NEW PROMPT' }) });
  });
});

describe('Settings page (task 1a08ded2)', () => {
  test('renders the three sections + loaded data', async () => {
    render(<Settings />);
    expect(screen.getByTestId('settings-page')).toBeInTheDocument();
    expect(screen.getByTestId('providers-section')).toBeInTheDocument();
    expect(screen.getByTestId('models-section')).toBeInTheDocument();
    expect(screen.getByTestId('analysis-prompt-section')).toBeInTheDocument();
    await waitFor(() =>
      expect(within(screen.getByTestId('providers-list')).getByText('OpenAI')).toBeInTheDocument(),
    );
    expect(within(screen.getByTestId('models-list')).getByText(/gpt-4o/)).toBeInTheDocument();
  });

  test('loads the global analysis prompt into the textarea', async () => {
    render(<Settings />);
    await waitFor(() =>
      expect(screen.getByTestId('analysis-prompt-textarea').value).toBe('INITIAL PROMPT'),
    );
  });

  test('Save PUTs the prompt to /api/ai/global-prompt', async () => {
    render(<Settings />);
    await waitFor(() =>
      expect(screen.getByTestId('analysis-prompt-textarea').value).toBe('INITIAL PROMPT'),
    );
    fireEvent.change(screen.getByTestId('analysis-prompt-textarea'), {
      target: { value: 'NEW PROMPT' },
    });
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
    await waitFor(() =>
      expect(screen.getByTestId('analysis-prompt-textarea').value).toBe('INITIAL PROMPT'),
    );
    fireEvent.change(screen.getByTestId('analysis-prompt-textarea'), { target: { value: 'EDITED' } });
    expect(screen.getByTestId('analysis-prompt-textarea').value).toBe('EDITED');
    fireEvent.click(screen.getByTestId('cancel-prompt-btn'));
    expect(screen.getByTestId('analysis-prompt-textarea').value).toBe('INITIAL PROMPT');
  });

  test('model form provider select is populated from providers (AC 55)', async () => {
    render(<Settings />);
    await waitFor(() =>
      expect(within(screen.getByTestId('providers-list')).getByText('OpenAI')).toBeInTheDocument(),
    );
    const select = screen.getByTestId('model-provider-select');
    expect(within(select).getByText('OpenAI')).toBeInTheDocument();
  });

  test('submitting the model form POSTs to /api/ai/configs', async () => {
    render(<Settings />);
    fireEvent.change(screen.getByTestId('model-name-input'), { target: { value: 'claude-3' } });
    fireEvent.click(screen.getByTestId('add-model-btn'));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ai/configs',
        expect.objectContaining({ method: 'POST' }),
      ),
    );
  });

  test('renders AI Context Settings with the three controls (task e606cca6 AC3)', () => {
    render(<Settings />);
    expect(screen.getByTestId('ai-context-settings')).toBeInTheDocument();
    expect(screen.getByTestId('context-type-select')).toBeInTheDocument();
    expect(screen.getByTestId('dynamic-response-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('token-limit-slider')).toBeInTheDocument();
  });

  test('model POST carries the chosen context settings (AC1/AC3)', async () => {
    render(<Settings />);
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
});
