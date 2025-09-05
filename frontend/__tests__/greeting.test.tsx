import { render, screen } from '@testing-library/react';
import Greeting from '../components/Greeting';

describe('Greeting component', () => {
  it('renders with default name', () => {
    render(<Greeting />);
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });

  it('renders with provided name', () => {
    render(<Greeting name="Al Noor" />);
    expect(screen.getByText('Hello, Al Noor!')).toBeInTheDocument();
  });
});

