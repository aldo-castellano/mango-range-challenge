import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import type { RangeConfig } from '@/types/range-config';
import Range from './Range';

function pointer(target: HTMLElement, type: string, clientX: number) {
  fireEvent(target, Object.assign(
    new MouseEvent(type, { bubbles: true, button: 0, clientX }),
    { pointerId: 1 },
  ));
}

test.each<{ config: RangeConfig; expected: number }>([
  { config: { mode: 'continuous', min: 1, max: 100 }, expected: 41 },
  { config: { mode: 'discrete', values: [1.99, 5.99, 10.99, 30.99, 50.99, 70.99] }, expected: 10.99 },
])('drags and clamps prices in $config.mode mode', ({ config, expected }) => {
  render(<Range {...config} />);
  const lower = screen.getByRole('slider', { name: 'Minimum price' });
  const upper = screen.getByRole('slider', { name: 'Maximum price' });
  const track = lower.parentElement!;
  const initial = lower.getAttribute('aria-valuenow');
  vi.spyOn(track, 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 0, 200, 44));
  Object.assign(track, {
    setPointerCapture: vi.fn(),
    hasPointerCapture: vi.fn().mockReturnValue(true),
    releasePointerCapture: vi.fn(),
  });

  pointer(lower, 'pointerdown', 100);
  pointer(track, 'pointermove', 180);
  expect(lower).toHaveAttribute('aria-valuenow', String(expected));
  expect(lower).toHaveFocus();
  pointer(track, 'pointermove', 100);
  expect(lower).toHaveAttribute('aria-valuenow', initial);
  pointer(track, 'pointermove', 500);
  expect(lower).toHaveAttribute('aria-valuenow', upper.getAttribute('aria-valuenow'));
  pointer(track, 'pointerup', 500);
  expect(track.releasePointerCapture).toHaveBeenCalledWith(1);
  pointer(track, 'pointermove', 100);
  expect(lower).toHaveAttribute('aria-valuenow', upper.getAttribute('aria-valuenow'));
});

test('updates numeric prices and accessible limits with the arrow keys', () => {
  render(<Range mode="continuous" min={1} max={100} />);
  const lower = screen.getByRole('slider', { name: 'Minimum price' });
  const upper = screen.getByRole('slider', { name: 'Maximum price' });

  expect(lower).toHaveAttribute('aria-valuenow', '1');
  expect(upper).toHaveAttribute('aria-valuenow', '100');
  lower.focus();
  expect(fireEvent.keyDown(lower, { key: 'ArrowRight' })).toBe(false);
  fireEvent.keyDown(lower, { key: 'ArrowUp' });
  fireEvent.keyDown(lower, { key: 'ArrowLeft' });
  fireEvent.keyDown(upper, { key: 'ArrowDown' });

  expect(lower).toHaveFocus();
  expect(lower).toHaveAttribute('aria-valuenow', '2');
  expect(lower).toHaveAttribute('aria-valuetext', '€2.00');
  expect(upper).toHaveAttribute('aria-valuenow', '99');
  expect(lower).toHaveAttribute('aria-valuemax', '99');
  expect(upper).toHaveAttribute('aria-valuemin', '2');
  expect(screen.getByText('€2.00')).toBeVisible();
  expect(fireEvent.keyDown(lower, { key: 'Tab' })).toBe(true);
});

test('moves between fixed prices in option order', () => {
  render(<Range mode="discrete" values={[1.99, 5.99, 10.99, 30.99, 50.99, 70.99]} />);
  const lower = screen.getByRole('slider', { name: 'Minimum price' });
  const upper = screen.getByRole('slider', { name: 'Maximum price' });

  fireEvent.keyDown(lower, { key: 'ArrowRight' });
  expect(lower).toHaveAttribute('aria-valuenow', '5.99');
  expect(lower).toHaveStyle({ left: '20%' });
  fireEvent.keyDown(lower, { key: 'ArrowRight' });
  fireEvent.keyDown(upper, { key: 'ArrowLeft' });

  expect(lower).toHaveAttribute('aria-valuenow', '10.99');
  expect(lower).toHaveStyle({ left: '40%' });
  expect(upper).toHaveAttribute('aria-valuenow', '50.99');
  expect(screen.getByText('€10.99')).toBeVisible();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
});

test.each<RangeConfig>([
  { mode: 'continuous', min: 1, max: 100 },
  { mode: 'discrete', values: [1.99, 5.99, 70.99] },
])('respects boundaries and prevents crossing in $mode mode', (config) => {
  render(<Range {...config} />);
  const lower = screen.getByRole('slider', { name: 'Minimum price' });
  const upper = screen.getByRole('slider', { name: 'Maximum price' });
  const min = config.mode === 'continuous' ? config.min : config.values[0];
  const max = config.mode === 'continuous' ? config.max : config.values.at(-1);

  fireEvent.keyDown(lower, { key: 'ArrowLeft' });
  fireEvent.keyDown(upper, { key: 'ArrowRight' });
  expect(lower).toHaveAttribute('aria-valuenow', String(min));
  expect(upper).toHaveAttribute('aria-valuenow', String(max));

  fireEvent.keyDown(lower, { key: 'End' });
  fireEvent.keyDown(upper, { key: 'ArrowLeft' });
  expect(lower).toHaveAttribute('aria-valuenow', String(max));
  expect(upper).toHaveAttribute('aria-valuenow', String(max));

  fireEvent.keyDown(lower, { key: 'Home' });
  fireEvent.keyDown(upper, { key: 'Home' });
  fireEvent.keyDown(lower, { key: 'ArrowRight' });
  expect(lower).toHaveAttribute('aria-valuenow', String(min));
  expect(upper).toHaveAttribute('aria-valuenow', String(min));
  fireEvent.keyDown(upper, { key: 'End' });
  expect(upper).toHaveAttribute('aria-valuenow', String(max));
});
