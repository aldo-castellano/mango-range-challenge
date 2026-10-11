// @vitest-environment node
import { expect, test } from 'vitest';
import { GET } from './route';

test('returns the numeric range limits as JSON', async () => {
  const response = GET();

  expect(response.status).toBe(200);
  expect(response.headers.get('content-type')).toContain('application/json');
  await expect(response.json()).resolves.toEqual({ min: 1, max: 100 });
});
