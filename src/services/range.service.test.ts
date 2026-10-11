// @vitest-environment node
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import type { RangeMode } from '@/types/range-config';
import { getRangeConfig } from './range.service';

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => vi.unstubAllGlobals());

test('loads numeric limits and forwards the cancellation signal', async () => {
  const controller = new AbortController();
  fetchMock.mockResolvedValue(Response.json({ min: 1, max: 100 }));

  await expect(getRangeConfig('continuous', controller.signal)).resolves.toEqual({
    mode: 'continuous',
    min: 1,
    max: 100,
  });
  expect(fetchMock).toHaveBeenCalledWith('/api/range', {
    signal: controller.signal,
  });
});

test('loads fixed prices without changing their values or order', async () => {
  const values = [1.99, 5.99, 10.99, 30.99, 50.99, 70.99];
  fetchMock.mockResolvedValue(Response.json({ rangeValues: values }));

  await expect(getRangeConfig('discrete')).resolves.toEqual({
    mode: 'discrete',
    values,
  });
  expect(fetchMock).toHaveBeenCalledWith('/api/range-options', {
    signal: undefined,
  });
});

test.each<{ name: string; mode: RangeMode; data: unknown }>([
  { name: 'reversed limits', mode: 'continuous', data: { min: 100, max: 1 } },
  { name: 'non-numeric limits', mode: 'continuous', data: { min: '1', max: 100 } },
  { name: 'duplicate prices', mode: 'discrete', data: { rangeValues: [1.99, 1.99] } },
  { name: 'an empty price list', mode: 'discrete', data: { rangeValues: [] } },
])('rejects $name', async ({ mode, data }) => {
  fetchMock.mockResolvedValue(Response.json(data));

  await expect(getRangeConfig(mode)).rejects.toThrow(/Invalid .*range configuration/);
});

test('rejects an unsuccessful HTTP response', async () => {
  fetchMock.mockResolvedValue(new Response(null, { status: 503 }));

  await expect(getRangeConfig('continuous')).rejects.toThrow('HTTP 503');
});
