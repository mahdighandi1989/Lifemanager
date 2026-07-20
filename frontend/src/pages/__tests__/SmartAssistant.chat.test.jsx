import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';

// The cross-domain chat on the Smart Assistant page (audit #4): it must POST
// the message + running history to /api/ai/chat and render the reply (with
// the model name in muted text), and show ok:false replies warning-tinted.
const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('../../lib/api', () => ({ default: { post } }));

import SmartAssistant from '../SmartAssistant';

beforeEach(() => vi.clearAllMocks());

describe('SmartAssistant chat (audit #4)', () => {
  test('posts the message to /ai/chat and renders the reply + model name', async () => {
    post.mockResolvedValue({
      data: { ok: true, text: 'موجودی USD شما ۲۰۰ است.', model: 'gpt-x', success: true },
    });
    render(<SmartAssistant />);
    expect(screen.getByTestId('assistant-chat')).toBeInTheDocument();

    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'وضعیت مالی‌ام چطوره؟' } });
    fireEvent.submit(screen.getByTestId('chat-input').closest('form'));

    await waitFor(() =>
      expect(post).toHaveBeenCalledWith('/ai/chat', {
        message: 'وضعیت مالی‌ام چطوره؟',
        history: [],
      }),
    );
    // user turn + assistant reply are both in the message list
    await waitFor(() =>
      expect(screen.getByTestId('chat-messages')).toHaveTextContent('موجودی USD شما ۲۰۰ است.'),
    );
    expect(screen.getByTestId('chat-messages')).toHaveTextContent('وضعیت مالی‌ام چطوره؟');
    expect(screen.getByTestId('chat-model-1')).toHaveTextContent('gpt-x');
    // the input clears after sending
    expect(screen.getByTestId('chat-input').value).toBe('');
  });

  test('second message carries the prior turns as history', async () => {
    post.mockResolvedValue({ data: { ok: true, text: 'پاسخ', model: null, success: true } });
    render(<SmartAssistant />);

    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'سلام' } });
    fireEvent.submit(screen.getByTestId('chat-input').closest('form'));
    await waitFor(() => expect(post).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByTestId('chat-messages')).toHaveTextContent('پاسخ'));

    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'ادامه بده' } });
    fireEvent.submit(screen.getByTestId('chat-input').closest('form'));
    await waitFor(() =>
      expect(post).toHaveBeenLastCalledWith('/ai/chat', {
        message: 'ادامه بده',
        history: [
          { role: 'user', content: 'سلام' },
          { role: 'assistant', content: 'پاسخ' },
        ],
      }),
    );
  });

  test('ok:false reply renders the returned text with a warning tint', async () => {
    post.mockResolvedValue({
      data: { ok: false, text: 'مدلی فعال نیست — از تنظیمات یکی را فعال کن.', success: false },
    });
    render(<SmartAssistant />);
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'سؤال' } });
    fireEvent.submit(screen.getByTestId('chat-input').closest('form'));

    await waitFor(() =>
      expect(screen.getByTestId('chat-msg-assistant-1')).toHaveTextContent('مدلی فعال نیست'),
    );
    expect(screen.getByTestId('chat-msg-assistant-1').className).toMatch(/amber/);
  });

  test('suggestion chips fill and send', async () => {
    post.mockResolvedValue({ data: { ok: true, text: 'چیزی عقب نیفتاده.', success: true } });
    render(<SmartAssistant />);
    fireEvent.click(screen.getByText('این هفته چی عقب افتاده؟'));
    await waitFor(() =>
      expect(post).toHaveBeenCalledWith('/ai/chat', {
        message: 'این هفته چی عقب افتاده؟',
        history: [],
      }),
    );
  });
});
