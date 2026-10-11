import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import NumericRangePage from './exercise1/page';
import FixedPricesPage from './exercise2/page';

afterEach(() => vi.unstubAllGlobals());

const exercises = [
  {
    name: 'Numeric range',
    Page: NumericRangePage,
    endpoint: '/api/range',
    response: { min: 10, max: 50 },
    group: 'Numeric price range',
    min: '10',
    max: '50',
    next: '11',
  },
  {
    name: 'Fixed prices',
    Page: FixedPricesPage,
    endpoint: '/api/range-options',
    response: { rangeValues: [2.5, 7.5, 20] },
    group: 'Fixed price range',
    min: '2.5',
    max: '20',
    next: '7.5',
  },
];

test.each(exercises)('$name loads its endpoint and renders an interactive range', async (exercise) => {
  const fetchMock = vi.fn().mockResolvedValue(Response.json(exercise.response));
  vi.stubGlobal('fetch', fetchMock);
  render(<exercise.Page />);

  expect(screen.getByRole('heading', { level: 1, name: exercise.name })).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent('Loading prices...');
  expect(await screen.findByRole('group', { name: exercise.group })).toBeVisible();
  expect(fetchMock).toHaveBeenCalledWith(exercise.endpoint, { signal: expect.any(AbortSignal) });
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  const lower = screen.getByRole('slider', { name: 'Minimum price' });
  expect(lower).toHaveAttribute('aria-valuenow', exercise.min);
  expect(screen.getByRole('slider', { name: 'Maximum price' })).toHaveAttribute('aria-valuenow', exercise.max);
  fireEvent.keyDown(lower, { key: 'ArrowRight' });
  expect(lower).toHaveAttribute('aria-valuenow', exercise.next);
  expect(screen.getByRole('link', { name: 'All exercises' })).toHaveAttribute('href', '/');

  if (exercise.endpoint === '/api/range') {
    expect(screen.getByRole('textbox', { name: 'Minimum price in euros' })).toHaveValue('11.00');
  } else {
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  }
});

test.each(exercises)('$name shows an HTTP error and reloads on retry', async (exercise) => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(new Response(null, { status: 503 }))
    .mockResolvedValueOnce(Response.json(exercise.response));
  vi.stubGlobal('fetch', fetchMock);
  render(<exercise.Page />);

  expect(await screen.findByRole('alert')).toHaveTextContent('Prices could not be loaded.');
  expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(screen.getByRole('status')).toHaveTextContent('Loading prices...');
  expect(await screen.findByRole('group', { name: exercise.group })).toBeVisible();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
