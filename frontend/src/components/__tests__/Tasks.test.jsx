import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Tasks from '../Tasks';

describe('Tasks Component', () => {
  test('renders tasks page title', () => {
    render(
      <BrowserRouter>
        <Tasks />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Tasks/i)).toBeInTheDocument();
  });

  test('renders task list or empty state', () => {
    render(
      <BrowserRouter>
        <Tasks />
      </BrowserRouter>
    );
    
    // Either shows tasks or empty state message
    const taskList = screen.queryByRole('list');
    const emptyState = screen.queryByText(/No tasks found/i);
    expect(taskList || emptyState).toBeInTheDocument();
  });

  test('renders create task button', () => {
    render(
      <BrowserRouter>
        <Tasks />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Create Task/i)).toBeInTheDocument();
  });

  test('renders filter options', () => {
    render(
      <BrowserRouter>
        <Tasks />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/All/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending/i)).toBeInTheDocument();
    expect(screen.getByText(/Completed/i)).toBeInTheDocument();
  });
});
