import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import Home from '../Home';

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );
}

describe('Home page', () => {
  test('exposes the homepage testid for the UI probe', () => {
    renderHome();
    expect(screen.getByTestId('homepage')).toBeInTheDocument();
  });

  test('renders the login and register CTAs with the AC selectors', () => {
    renderHome();
    const login = screen.getByTestId('login-link');
    const register = screen.getByTestId('register-link');
    expect(login).toHaveAttribute('href', '/login');
    expect(register).toHaveAttribute('href', '/register');
  });

  test('renders the product name', () => {
    renderHome();
    expect(screen.getByRole('heading', { name: /lifemanager/i })).toBeInTheDocument();
  });
});
