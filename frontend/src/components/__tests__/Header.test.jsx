import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';

describe('Header Component', () => {
  test('renders the header with navigation links', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/LifeManager/i)).toBeInTheDocument();
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Projects/i)).toBeInTheDocument();
    expect(screen.getByText(/Tasks/i)).toBeInTheDocument();
  });

  test('navigation links have correct href attributes', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Dashboard/i).closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText(/Projects/i).closest('a')).toHaveAttribute('href', '/projects');
    expect(screen.getByText(/Tasks/i).closest('a')).toHaveAttribute('href', '/tasks');
  });

  test('renders logo or brand name', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    const logo = screen.getByText(/LifeManager/i);
    expect(logo).toBeInTheDocument();
    expect(logo.tagName).toBe('A');
    expect(logo).toHaveAttribute('href', '/');
  });
});
