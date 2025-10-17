import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login page by default', () => {
  render(<App />);
  const headingElement = screen.getByRole('heading', { name: /log in/i });
  expect(headingElement).toBeInTheDocument();
});
