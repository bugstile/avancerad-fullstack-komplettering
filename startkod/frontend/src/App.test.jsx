import { render, screen } from '@testing-library/react';
import App from './App';

// Mock fetch so the component doesn't make real HTTP calls
global.fetch = () =>
  Promise.resolve({
    json: () => Promise.resolve({ message: 'API körs' }),
  });

test('renderar rubriken Komplettering – Fullstack', () => {
  render(<App />);
  expect(screen.getByText('Komplettering – Fullstack')).toBeInTheDocument();
});

test('visar laddningstext initialt', () => {
  render(<App />);
  expect(screen.getByText('API svarar: Laddar...')).toBeInTheDocument();
});
