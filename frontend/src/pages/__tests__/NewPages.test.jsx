import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi, beforeEach } from 'vitest';

// PeopleProfiles now links each person to /people/:id/profile (task 3cc09436
// AC5), so it must render inside a Router. Wrap renders accordingly.
const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

// Mock the shared axios client so the pages render without a backend.
vi.mock('../../lib/api', () => ({
  default: {
    get: vi.fn((url) => {
      if (url === '/finance/accounts') {
        return Promise.resolve({ data: [{ id: 1, name: 'بانک ملت', kind: 'bank', balance: 1000, currency: 'IRR' }] });
      }
      if (url === '/external-projects') {
        return Promise.resolve({ data: [{ id: 1, name: 'Jira A', provider: 'jira', base_url: 'https://x' }] });
      }
      if (url === '/persons') {
        return Promise.resolve({ data: [{ id: 1, name: 'Ali', relationship_type: 'close' }] });
      }
      return Promise.resolve({ data: [] });
    }),
  },
}));

import BudgetPage from '../BudgetPage';
import ExternalProjects from '../ExternalProjects';
import PeopleProfiles from '../PeopleProfiles';

describe('Frontend pages wired into the nav (tasks 4ae4b3ca / d2146781 / 3cc09436)', () => {
  beforeEach(() => vi.clearAllMocks());

  test('BudgetPage renders accounts + total', async () => {
    render(<BudgetPage />);
    expect(screen.getByTestId('budget-page')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('بانک ملت')).toBeInTheDocument());
    expect(screen.getByTestId('budget-total')).toBeInTheDocument();
  });

  test('ExternalProjects renders the project list', async () => {
    render(<ExternalProjects />);
    expect(screen.getByTestId('external-projects-page')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Jira A')).toBeInTheDocument());
  });

  test('PeopleProfiles renders the people list', async () => {
    renderWithRouter(<PeopleProfiles />);
    expect(screen.getByTestId('people-profiles-page')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Ali')).toBeInTheDocument());
  });
});
