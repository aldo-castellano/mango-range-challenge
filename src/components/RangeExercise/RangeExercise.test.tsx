import { act, render } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import RangeExercise from './RangeExercise';

afterEach(() => vi.unstubAllGlobals());

test('cancels the pending request when the exercise is unmounted', async () => {
  let resolveRequest!: (response: Response) => void;
  const fetchMock = vi.fn<typeof fetch>(() => new Promise<Response>((resolve) => {
    resolveRequest = resolve;
  }));
  vi.stubGlobal('fetch', fetchMock);
  const { unmount } = render(<RangeExercise mode="continuous" />);
  const signal = fetchMock.mock.calls[0][1]?.signal;

  expect(signal?.aborted).toBe(false);
  unmount();
  expect(signal?.aborted).toBe(true);
  await act(async () => {
    resolveRequest(Response.json({ min: 1, max: 100 }));
  });
});
