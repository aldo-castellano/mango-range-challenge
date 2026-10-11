'use client';

import { useEffect, useState } from 'react';
import Range from '@/components/Range/Range';
import { getRangeConfig } from '@/services/range.service';
import type { RangeConfig, RangeMode } from '@/types/range-config';
import styles from './RangeExercise.module.css';

export default function RangeExercise({ mode }: { mode: RangeMode }) {
  const [config, setConfig] = useState<RangeConfig | null>(null);
  const [hasError, setHasError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getRangeConfig(mode, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setConfig(result);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      });

    return () => controller.abort();
  }, [mode, attempt]);

  if (hasError) {
    return (
      <div>
        <p role="alert">Prices could not be loaded. Please try again.</p>
        <button
          className={styles.retry}
          type="button"
          onClick={() => {
            setHasError(false);
            setAttempt((current) => current + 1);
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!config) return <p role="status">Loading prices...</p>;

  return <Range {...config} />;
}
