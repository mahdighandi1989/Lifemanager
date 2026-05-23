import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';

describe('Dashboard Component', () => {
  test('renders dashboard title', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  test('renders summary cards', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Total Projects/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/Completed Tasks/i)).toBeInTheDocument();
  });

  test('renders recent activity section', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Recent Activity/i)).toBeInTheDocument();
  });

  test('renders quick actions', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Create New Project/i)).toBeInTheDocument();
    expect(screen.getByText(/Add New Task/i)).toBeInTheDocument();
  });
});
