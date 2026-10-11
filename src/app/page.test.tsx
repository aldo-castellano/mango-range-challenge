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
});
