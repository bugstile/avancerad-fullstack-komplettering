import { render, screen, waitFor } from '@testing-library/react';
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

test('visar API-meddelandet när fetch lyckas', async () => {
  render(<App />);
  await waitFor(() =>
    expect(screen.getByText('API svarar: API körs')).toBeInTheDocument()
  );
});

test('visar felmeddelande när fetch misslyckas', async () => {
  global.fetch = () => Promise.reject(new Error('nätverksfel'));
  render(<App />);
  await waitFor(() =>
    expect(screen.getByText('Fel: nätverksfel')).toBeInTheDocument()
  );
});
