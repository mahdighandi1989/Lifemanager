import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, expect, test, vi, beforeEach } from 'vitest';

const get = vi.fn();
const post = vi.fn();
vi.mock('../../lib/api', () => ({
  default: { get: (...a) => get(...a), post: (...a) => post(...a) },
}));

import PersonProfilePage from '../../pages/PersonProfilePage';
import PeopleProfiles from '../../pages/PeopleProfiles';

beforeEach(() => vi.clearAllMocks());

describe('PersonProfilePage (task 3cc09436 AC4/AC6)', () => {
  test('renders the profile and saves a note', async () => {
    get.mockResolvedValue({
      data: { id: 1, person_id: 1, ai_score: 70, user_notes: '', behavior_log: [], relationship_type: 'close' },
    });
    post.mockResolvedValue({
      data: { id: 1, person_id: 1, ai_score: 70, user_notes: 'خوب', behavior_log: [], relationship_type: 'close' },
    });

    render(
      <MemoryRouter initialEntries={['/people/1/profile']}>
        <Routes>
          <Route path="/people/:id/profile" element={<PersonProfilePage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByTestId('profile-relationship')).toHaveTextContent('close'));
    expect(screen.getByTestId('profile-ai-score')).toHaveTextContent('70');

    fireEvent.change(screen.getByTestId('note-input'), { target: { value: 'خوب' } });
    fireEvent.click(screen.getByTestId('save-note-btn'));
    await waitFor(() =>
      expect(post).toHaveBeenCalledWith('/people/1/profile/note', { user_notes: 'خوب' }),
    );
  });

  test('analyze button posts to the analyze endpoint', async () => {
    get.mockResolvedValue({
      data: { id: 1, person_id: 1, ai_score: 0, user_notes: '', behavior_log: [], relationship_type: 'neutral' },
    });
    post.mockResolvedValue({
      data: { id: 1, person_id: 1, ai_score: 90, user_notes: '', behavior_log: [{ note: 'تحلیل' }], relationship_type: 'close' },
    });
    render(
      <MemoryRouter initialEntries={['/people/1/profile']}>
        <Routes>
          <Route path="/people/:id/profile" element={<PersonProfilePage />} />
        </Routes>
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.getByTestId('analyze-person-btn')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('analyze-person-btn'));
    await waitFor(() => expect(post).toHaveBeenCalledWith('/people/1/profile/analyze'));
  });
});

describe('PeopleProfiles profile link (task 3cc09436 AC5)', () => {
  test('each person links to their profile page', async () => {
    get.mockResolvedValue({ data: [{ id: 42, name: 'Ali', relationship_type: 'close' }] });
    render(
      <MemoryRouter>
        <PeopleProfiles />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('person-profile-link-42')).toHaveAttribute('href', '/people/42/profile'),
    );
  });
});
