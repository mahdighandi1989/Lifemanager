import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';

const get = vi.fn();
const post = vi.fn();
vi.mock('../../lib/api', () => ({
  default: { get: (...a) => get(...a), post: (...a) => post(...a) },
}));

import RecommendationPanel from '../RecommendationPanel';
import CareerPathPanel from '../CareerPathPanel';
import PersonalityProfilePage from '../../pages/PersonalityProfilePage';
import CareerPlanningPage from '../../pages/CareerPlanningPage';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RecommendationPanel personalized items (task 14e65214 AC17)', () => {
  test('renders personalized-recommendation-item from the AI endpoint', async () => {
    get.mockImplementation((url) => {
      if (url === '/ai/personalized_recommendations') {
        return Promise.resolve({
          data: [{ id: 1, content: 'بر اساس علاقهٔ شما به موسیقی', type: 'art', score: 0.8 }],
        });
      }
      return Promise.resolve({ data: [] });
    });
    render(<RecommendationPanel />);
    await waitFor(() =>
      expect(screen.getByTestId('personalized-recommendation-item')).toBeInTheDocument(),
    );
  });
});

describe('PersonalityProfilePage (task 14e65214 AC34)', () => {
  test('renders trait bars and (re)analyzes on click', async () => {
    get.mockResolvedValue({
      data: { user_id: 0, openness: 0.7, conscientiousness: 0.6, extraversion: 0.5,
              agreeableness: 0.5, neuroticism: 0.3, summary: 'خلاصه', traits: [] },
    });
    post.mockResolvedValue({
      data: { user_id: 0, openness: 0.8, conscientiousness: 0.6, extraversion: 0.5,
              agreeableness: 0.5, neuroticism: 0.3, summary: 'خلاصه نو', traits: [] },
    });
    render(<PersonalityProfilePage />);
    await waitFor(() => expect(screen.getByTestId('trait-openness')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('analyze-personality-btn'));
    await waitFor(() =>
      expect(post).toHaveBeenCalledWith('/ai/personality/analyze', {}),
    );
  });
});

describe('CareerPathPanel (task 14e65214 AC44/45)', () => {
  test('renders generated paths', async () => {
    post.mockResolvedValue({
      data: {
        paths: [{ title: 'مهندسی داده در «python»', rationale: 'بر اساس علاقهٔ شما', fit_score: 0.8, first_steps: ['یک پروژه بساز'], success_potential: 'بالا' }],
        based_on: { dominant_trait: 'openness' },
      },
    });
    render(<CareerPathPanel />);
    fireEvent.click(screen.getByTestId('generate-career-paths-btn'));
    await waitFor(() => expect(screen.getByTestId('career-path-0')).toBeInTheDocument());
    expect(screen.getByTestId('career-path-0')).toHaveTextContent('python');
  });

  test('shows the feature-disabled message on 403', async () => {
    post.mockRejectedValue({ response: { status: 403 } });
    render(<CareerPathPanel />);
    fireEvent.click(screen.getByTestId('generate-career-paths-btn'));
    await waitFor(() => expect(screen.getByTestId('career-error')).toBeInTheDocument());
  });
});

describe('CareerPlanningPage (task 14e65214 AC44)', () => {
  test('renders the page shell with the panel', () => {
    render(<CareerPlanningPage />);
    expect(screen.getByTestId('career-planning-page')).toBeInTheDocument();
    expect(screen.getByTestId('career-path-panel')).toBeInTheDocument();
  });
});
