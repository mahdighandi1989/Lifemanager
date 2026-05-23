import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Projects from '../Projects';

describe('Projects Component', () => {
  test('renders projects page title', () => {
    render(
      <BrowserRouter>
        <Projects />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Projects/i)).toBeInTheDocument();
  });

  test('renders project list or empty state', () => {
    render(
      <BrowserRouter>
        <Projects />
      </BrowserRouter>
    );
    
    // Either shows projects or empty state message
    const projectList = screen.queryByRole('list');
    const emptyState = screen.queryByText(/No projects found/i);
    expect(projectList || emptyState).toBeInTheDocument();
  });

  test('renders create project button', () => {
    render(
      <BrowserRouter>
        <Projects />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Create Project/i)).toBeInTheDocument();
  });

  test('renders search/filter input', () => {
    render(
      <BrowserRouter>
        <Projects />
      </BrowserRouter>
    );
    
    expect(screen.getByPlaceholderText(/Search projects/i)).toBeInTheDocument();
  });
});
