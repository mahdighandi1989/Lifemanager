import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer Component', () => {
  test('renders the footer with copyright text', () => {
    render(<Footer />);
    
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear} LifeManager`, 'i'))).toBeInTheDocument();
  });

  test('renders footer links', () => {
    render(<Footer />);
    
    expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument();
    expect(screen.getByText(/Terms of Service/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact Us/i)).toBeInTheDocument();
  });

  test('footer links have correct href attributes', () => {
    render(<Footer />);
    
    expect(screen.getByText(/Privacy Policy/i).closest('a')).toHaveAttribute('href', '/privacy');
    expect(screen.getByText(/Terms of Service/i).closest('a')).toHaveAttribute('href', '/terms');
    expect(screen.getByText(/Contact Us/i).closest('a')).toHaveAttribute('href', '/contact');
  });
});
