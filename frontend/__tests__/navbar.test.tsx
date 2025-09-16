import { render, screen } from '@testing-library/react';
import Navbar from '../components/Navbar';
import Providers from '../components/Providers';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href = '#', children, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img alt={props.alt} src={props.src} />,
}));

describe('Navbar', () => {
  it('renders main nav links and logo', () => {
    render(
      <Providers>
        <Navbar />
      </Providers>
    );
    expect(screen.getByText('Al Noor')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /al noor/i })).toHaveAttribute('src', '/alnoorlogo.png');

    const primaryLinks = [
      { name: 'Home', href: '/' },
      { name: 'Shop', href: '/products' },
      { name: 'About', href: '/about' },
      { name: 'Halal Process', href: '/halal-process' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Contact', href: '/contact' },
    ];
    primaryLinks.forEach((link) => {
      expect(screen.getByRole('link', { name: link.name })).toHaveAttribute('href', link.href);
    });
    expect(screen.getByRole('link', { name: 'Checkout' })).toHaveAttribute('href', '/checkout');
    expect(screen.getByRole('link', { name: /Cart/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute('href', '/admin/login');
  });
});
