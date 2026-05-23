import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../Layout';

describe('Layout', () => {
  it('renders Header with Lifemanager logo', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    );
    expect(screen.getByText('Lifemanager')).toBeInTheDocument();
  });

  it('renders Footer with copyright text', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    );
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
