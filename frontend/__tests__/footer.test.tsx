import { render, screen } from '@testing-library/react';
import Footer from '../components/Footer';

describe('Footer', () => {
  it('shows year, phone, and links', () => {
    render(<Footer />);
    expect(screen.getByText(/© \d{4} Al Noor Farm/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Store' })).toHaveAttribute('href', '/products');
    expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute('href', '/admin/login');
    expect(screen.getByRole('link', { name: /Call 716-524-1717/ })).toHaveAttribute('href', 'tel:+17165241717');
  });
});

