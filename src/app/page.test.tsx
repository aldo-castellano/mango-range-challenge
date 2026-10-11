import { render, screen, within } from '@testing-library/react';
import { expect, test } from 'vitest';
import HomePage from './page';

test('presents the challenge heading inside the main content', () => {
  render(<HomePage />);

  expect(
    within(screen.getByRole('main')).getByRole('heading', {
      level: 1,
      name: 'Range Challenge',
    }),
  ).toBeVisible();
  expect(screen.getByRole('link', { name: 'Exercise 1: Numeric range' })).toHaveAttribute('href', '/exercise1');
  expect(screen.getByRole('link', { name: 'Exercise 2: Fixed prices' })).toHaveAttribute('href', '/exercise2');
});
