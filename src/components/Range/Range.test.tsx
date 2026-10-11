import { act, fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import type { RangeConfig } from '@/types/range-config';
import Range from './Range';

function pointer(target: HTMLElement, type: string, clientX: number) {
  fireEvent(target, Object.assign(
    new MouseEvent(type, { bubbles: true, button: 0, clientX }),
    { pointerId: 1 },
  ));
}

test('edits both prices and keeps the inputs and handles synchronized', () => {
  render(<Range mode="continuous" min={1} max={100} />);
  const lowerInput = screen.getByRole('textbox', { name: 'Minimum price in euros' });
  const upperInput = screen.getByRole('textbox', { name: 'Maximum price in euros' });
  const lower = screen.getByRole('slider', { name: 'Minimum price' });
  const upper = screen.getByRole('slider', { name: 'Maximum price' });

  act(() => lowerInput.focus());
  fireEvent.change(lowerInput, { target: { value: '20,50' } });
  fireEvent.keyDown(lowerInput, { key: 'Enter' });
  expect(lowerInput).not.toHaveFocus();
  expect(lowerInput).toHaveValue('20.50');
  expect(lower).toHaveAttribute('aria-valuenow', '20.5');

  act(() => upperInput.focus());
  fireEvent.change(upperInput, { target: { value: '80' } });
  fireEvent.blur(upperInput);
  expect(upperInput).toHaveValue('80.00');
  expect(upper).toHaveAttribute('aria-valuenow', '80');
  fireEvent.keyDown(lower, { key: 'ArrowRight' });
  expect(lowerInput).toHaveValue('21.50');
  expect(upper).toHaveAttribute('aria-valuemin', '21.5');
  expect(screen.getByText('€1.00')).toBeVisible();
  expect(screen.getByText('€100.00')).toBeVisible();
});

test('clamps edited prices to the allowed interval and the other handle', () => {
  render(<Range mode="continuous" min={1} max={100} />);
  const lowerInput = screen.getByRole('textbox', { name: 'Minimum price in euros' });
  const upperInput = screen.getByRole('textbox', { name: 'Maximum price in euros' });

  for (const [input, value, expected] of [
    [lowerInput, '-10', '1.00'],
    [upperInput, '150', '100.00'],
    [lowerInput, '20', '20.00'],
    [upperInput, '10', '20.00'],
    [lowerInput, '90', '20.00'],
  ] as const) {
    fireEvent.change(input, { target: { value } });
    fireEvent.blur(input);
    expect(input).toHaveValue(expected);
  }
});

test('restores the previous price for empty or invalid input and on Escape', () => {
  render(<Range mode="continuous" min={1} max={100} />);
  const input = screen.getByRole('textbox', { name: 'Minimum price in euros' });

  for (const value of ['', 'invalid']) {
    fireEvent.change(input, { target: { value } });
    fireEvent.blur(input);
    expect(input).toHaveValue('1.00');
  }
  act(() => input.focus());
  fireEvent.change(input, { target: { value: '30' } });
  fireEvent.keyDown(input, { key: 'Escape' });
  expect(input).toHaveValue('1.00');
  fireEvent.blur(input);
  expect(screen.getByRole('slider', { name: 'Minimum price' })).toHaveAttribute('aria-valuenow', '1');
});

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

  if (config.mode === 'continuous') {
    fireEvent.keyDown(lower, { key: 'Home' });
    const input = screen.getByRole('textbox', { name: 'Minimum price in euros' });
    act(() => input.focus());
    fireEvent.change(input, { target: { value: '20' } });
    pointer(lower, 'pointerdown', 100);
    pointer(track, 'pointermove', 120);
    pointer(track, 'pointerup', 120);
    expect(lower).toHaveAttribute('aria-valuenow', '30');
    expect(input).toHaveValue('30.00');
  }
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
  expect(screen.getByRole('textbox', { name: 'Minimum price in euros' })).toHaveValue('2.00');
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
