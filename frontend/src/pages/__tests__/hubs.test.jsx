import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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

// Router-aware render: the hubs now link to sibling pages.
const renderHub = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('Grouped hubs', () => {
  // 2026-07-25: «دارایی‌ها» (media, not money — and its scan reads a folder the
  // deployment doesn't have) is quarantined from the bar; the panel is intact.
  test('FinanceHub: budget default, media assets tab is off the bar', () => {
    renderHub(<FinanceHub />);
    expect(screen.getByTestId('finance-hub')).toBeInTheDocument();
    expect(screen.getByTestId('budget-page')).toBeInTheDocument();
    expect(screen.queryByTestId('finance-tab-assets')).toBeNull();
    ['budget', 'reports', 'others', 'log'].forEach((id) =>
      expect(screen.getByTestId(`finance-tab-${id}`)).toBeInTheDocument(),
    );
  });

  // 2026-07-25: the three extra tabs are quarantined from the bar, but their
  // own routes still open their panels (quarantine, not deletion).
  test('AssistantHub: one tab at rest; /career-planning still opens its panel', () => {
    renderHub(<AssistantHub />);
    expect(screen.getByTestId('assistant-hub')).toBeInTheDocument();
    expect(screen.getByTestId('smart-assistant-page')).toBeInTheDocument();
    expect(screen.getByTestId('assistant-tab-assistant')).toBeInTheDocument();
    ['recommendations', 'personality', 'career'].forEach((id) =>
      expect(screen.queryByTestId(`assistant-tab-${id}`)).toBeNull(),
    );

    window.history.pushState({}, '', '/career-planning');
    renderHub(<AssistantHub />);
    expect(screen.getByTestId('career-planning-page')).toBeInTheDocument();
    window.history.pushState({}, '', '/');
  });

  test('DataHub: import default, switches to files and merge', () => {
    renderHub(<DataHub />);
    expect(screen.getByTestId('data-hub')).toBeInTheDocument();
    expect(screen.getByTestId('import-page')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('data-tab-files'));
    expect(screen.getByTestId('drive-files-page')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('data-tab-merge'));
    expect(screen.getByTestId('merge-page')).toBeInTheDocument();
  });

  test('ProjectsHub: my-projects only; dev content points at «مرکز توسعه»', () => {
    renderHub(<ProjectsHub />);
    expect(screen.getByTestId('projects-hub')).toBeInTheDocument();
    expect(screen.getByTestId('projects-page')).toBeInTheDocument();
    // «پروژه‌های خارجی» tab was quarantined in the 2026-07-21 nav audit — it is
    // no longer offered (the page + route survive, just unlinked).
    expect(screen.queryByTestId('projects-tab-external')).toBeNull();
    // 2026-07-25: the dev tab rendered the SAME overview as /dev-center — one
    // content behind two doors. The bar now links there instead.
    expect(screen.queryByTestId('projects-tab-dev')).toBeNull();
    expect(screen.getByTestId('projects-to-dev-center')).toHaveAttribute('href', '/dev-center');

    // …but an old ?tab=dev link still opens the panel (quarantine, not delete).
    window.history.pushState({}, '', '/projects?tab=dev');
    renderHub(<ProjectsHub />);
    expect(screen.getByTestId('dev-projects-overview')).toBeInTheDocument();
    window.history.pushState({}, '', '/');
  });
});
