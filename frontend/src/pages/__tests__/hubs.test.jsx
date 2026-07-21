import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

// Mock the child pages so the hub tests isolate the tab logic (the real pages
// pull in contexts/fetches; their own suites cover them).
vi.mock('../BudgetPage', () => ({ default: () => <div data-testid="budget-page" /> }));
vi.mock('../AssetsPage', () => ({ default: () => <div data-testid="assets-page" /> }));
vi.mock('../SmartAssistant', () => ({ default: () => <div data-testid="smart-assistant-page" /> }));
vi.mock('../Recommendations', () => ({ default: () => <div data-testid="recommendations-page" /> }));
vi.mock('../PersonalityProfilePage', () => ({ default: () => <div data-testid="personality-profile-page" /> }));
vi.mock('../CareerPlanningPage', () => ({ default: () => <div data-testid="career-planning-page" /> }));
vi.mock('../Import', () => ({ default: () => <div data-testid="import-page" /> }));
vi.mock('../DriveFiles', () => ({ default: () => <div data-testid="drive-files-page" /> }));
vi.mock('../MergeManagement', () => ({ default: () => <div data-testid="merge-page" /> }));
vi.mock('../Projects', () => ({ default: () => <div data-testid="projects-page" /> }));
vi.mock('../ExternalProjects', () => ({ default: () => <div data-testid="external-projects-page" /> }));
vi.mock('../../components/DevProjectsOverview', () => ({ default: () => <div data-testid="dev-projects-overview" /> }));
vi.mock('../../components/ActivityLogPanel', () => ({ default: () => <div data-testid="activity-log-panel" /> }));

import FinanceHub from '../FinanceHub';
import AssistantHub from '../AssistantHub';
import DataHub from '../DataHub';
import ProjectsHub from '../ProjectsHub';

describe('Grouped hubs', () => {
  test('FinanceHub: budget default, switches to assets', () => {
    render(<FinanceHub />);
    expect(screen.getByTestId('finance-hub')).toBeInTheDocument();
    expect(screen.getByTestId('budget-page')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('finance-tab-assets'));
    expect(screen.getByTestId('assets-page')).toBeInTheDocument();
  });

  test('AssistantHub: 4 tabs, assistant default, switches to career', () => {
    render(<AssistantHub />);
    expect(screen.getByTestId('assistant-hub')).toBeInTheDocument();
    expect(screen.getByTestId('smart-assistant-page')).toBeInTheDocument();
    ['assistant', 'recommendations', 'personality', 'career'].forEach((id) =>
      expect(screen.getByTestId(`assistant-tab-${id}`)).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId('assistant-tab-career'));
    expect(screen.getByTestId('career-planning-page')).toBeInTheDocument();
  });

  test('DataHub: import default, switches to files and merge', () => {
    render(<DataHub />);
    expect(screen.getByTestId('data-hub')).toBeInTheDocument();
    expect(screen.getByTestId('import-page')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('data-tab-files'));
    expect(screen.getByTestId('drive-files-page')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('data-tab-merge'));
    expect(screen.getByTestId('merge-page')).toBeInTheDocument();
  });

  test('ProjectsHub: my-projects default, switches to dev; external tab is quarantined', () => {
    render(<ProjectsHub />);
    expect(screen.getByTestId('projects-hub')).toBeInTheDocument();
    expect(screen.getByTestId('projects-page')).toBeInTheDocument();
    // «پروژه‌های خارجی» tab was quarantined in the 2026-07-21 nav audit — it is
    // no longer offered (the page + route survive, just unlinked).
    expect(screen.queryByTestId('projects-tab-external')).toBeNull();
    // The dev-projects tab is still reachable.
    fireEvent.click(screen.getByTestId('projects-tab-dev'));
    expect(screen.getByTestId('dev-projects-overview')).toBeInTheDocument();
  });
});
