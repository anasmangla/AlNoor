import { render, screen } from '@testing-library/react';
import Footer from '../components/Footer';
import Providers from '../components/Providers';

describe('Footer', () => {

  it('shows contact details and navigation links', () => {
    render(<Footer />);

    expect(screen.getByText(/© \d{4} Al Noor Farm/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Store' })).toHaveAttribute('href', '/products');
    expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute('href', '/admin/login');
    expect(screen.getByRole('link', { name: 'Facebook' })).toHaveAttribute(
      'href',
      'https://www.facebook.com/profile.php?id=100093040494987',
    );
    expect(screen.getByRole('link', { name: 'View on Google Maps' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '716-524-1717' })).toHaveAttribute('href', 'tel:+17165241717');
    expect(screen.getByRole('link', { name: 'info@alnoorfarm716.com' })).toHaveAttribute(
      'href',
      'mailto:info@alnoorfarm716.com',
    );
    expect(screen.getByText('Hours: Mon-Sat 9:00am-6:00pm')).toBeInTheDocument();
    expect(screen.getByTitle('Al Noor Farm Location')).toBeInTheDocument();
  });
});
