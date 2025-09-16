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
    const expectLink = (name: string | RegExp, href?: string) => {
      const links = screen.getAllByRole('link', { name });
      expect(links.length).toBeGreaterThan(0);
      if (href) {
        expect(links.some((link) => link.getAttribute('href') === href)).toBe(true);
      }
    };
    expectLink('Products', '/products');
    expectLink('Contact', '/contact');
    expectLink('Checkout', '/checkout');
    expectLink(/Cart/);
    expectLink('Admin', '/admin/login');
  });
});
