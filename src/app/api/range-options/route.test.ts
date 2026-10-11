// @vitest-environment node
import { expect, test } from 'vitest';
import { GET } from './route';

test('returns the allowed prices as JSON', async () => {
  const response = GET();

  expect(response.status).toBe(200);
  expect(response.headers.get('content-type')).toContain('application/json');
  await expect(response.json()).resolves.toEqual({
    rangeValues: [1.99, 5.99, 10.99, 30.99, 50.99, 70.99],
  });
});
