import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi, beforeEach } from 'vitest';

// «افزودن فرد» on the People page (audit #11): the form must POST the new
// person — including the optional birthday + next_follow_up dates — to
// /api/persons and then refresh the list.
const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('../../lib/api', () => ({ default: { get, post } }));

import PeopleProfiles from '../PeopleProfiles';

beforeEach(() => {
  vi.clearAllMocks();
  get.mockImplementation((url) => {
    if (url === '/people-profiles/summary') return Promise.resolve({ data: [] });
    if (url === '/persons') return Promise.resolve({ data: [] });
    return Promise.resolve({ data: [] });
  });
});

describe('PeopleProfiles add-person form (audit #11)', () => {
  test('posts name + birthday + next_follow_up to /persons and refreshes', async () => {
    post.mockResolvedValue({ data: { id: 9, name: 'Ali' } });
    render(
      <MemoryRouter>
        <PeopleProfiles />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('add-person')).toBeInTheDocument();

    fireEvent.change(screen.getByTestId('person-name-input'), { target: { value: 'Ali' } });
    fireEvent.change(screen.getByTestId('person-birthday-input'), { target: { value: '1990-05-01' } });
    fireEvent.change(screen.getByTestId('person-followup-input'), { target: { value: '2026-08-01' } });
    fireEvent.submit(screen.getByTestId('person-name-input').closest('form'));

    await waitFor(() =>
      expect(post).toHaveBeenCalledWith('/persons', {
        name: 'Ali',
        email: null,
        phone: null,
        birthday: '1990-05-01',
        next_follow_up: '2026-08-01',
      }),
    );
    // the list refreshes after a successful create (mount + refresh)
    await waitFor(() =>
      expect(get.mock.calls.filter(([u]) => u === '/people-profiles/summary').length).toBe(2),
    );
  });

  test('does not post without a name', async () => {
    render(
      <MemoryRouter>
        <PeopleProfiles />
      </MemoryRouter>,
    );
    fireEvent.submit(screen.getByTestId('person-name-input').closest('form'));
    await waitFor(() => expect(post).not.toHaveBeenCalled());
  });

  // 2026-07-25: the summary row now carries birthday + the permanent ledger,
  // so the page reads ONE endpoint (it used to fetch /persons too and merge).
  test('shows the 🎂 badge and the ledger from the summary row alone', async () => {
    get.mockImplementation((url) => {
      if (url === '/people-profiles/summary') {
        return Promise.resolve({
          data: [{
            id: 42, name: 'Ali', ai_score: 70, relationship_type: 'close',
            relationship: 'close', relationship_fa: 'نزدیک', birthday: '1990-05-01',
            ledger: { good: 2, bad: 1, total: 3, balance: 1, flagged: [] },
          }],
        });
      }
      return Promise.resolve({ data: [] });
    });
    render(
      <MemoryRouter>
        <PeopleProfiles />
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.getByTestId('person-birthday-badge-42')).toBeInTheDocument());
    expect(screen.getByTestId('person-ledger-42')).toHaveTextContent('👍2');
    expect(screen.getByTestId('person-ledger-42')).toHaveTextContent('👎1');
    expect(screen.getByTestId('person-rel-42')).toHaveTextContent('نزدیک');
    expect(get.mock.calls.filter(([u]) => u === '/persons').length).toBe(0);
  });
});
