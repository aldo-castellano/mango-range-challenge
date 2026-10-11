import type { RangeConfig, RangeMode } from '@/types/range-config';

const endpoints: Record<RangeMode, string> = {
  continuous: '/api/range',
  discrete: '/api/range-options',
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function parseRangeConfig(mode: RangeMode, data: unknown): RangeConfig {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error('Invalid range configuration.');
  }

  if (mode === 'continuous') {
    if (
      !('min' in data) ||
      !('max' in data) ||
      !isFiniteNumber(data.min) ||
      !isFiniteNumber(data.max) ||
      data.min >= data.max
    ) {
      throw new Error('Invalid numeric range configuration.');
    }

    return { mode, min: data.min, max: data.max };
  }

  if (!('rangeValues' in data) || !Array.isArray(data.rangeValues)) {
    throw new Error('Invalid fixed range configuration.');
  }

  const values: unknown[] = data.rangeValues;

  if (
    values.length < 2 ||
    !values.every(isFiniteNumber) ||
    !values.every((value, index) => index === 0 || value > values[index - 1])
  ) {
    throw new Error('Invalid fixed range configuration.');
  }

  return { mode, values };
}

export async function getRangeConfig(
  mode: RangeMode,
  signal?: AbortSignal,
): Promise<RangeConfig> {
  const response = await fetch(endpoints[mode], { signal });

  if (!response.ok) {
    throw new Error(`Unable to load range configuration (HTTP ${response.status}).`);
  }

  const data: unknown = await response.json();

  return parseRangeConfig(mode, data);
}
