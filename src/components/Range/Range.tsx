'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import type { RangeConfig } from '@/types/range-config';
import styles from './Range.module.css';

const currency = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
});

export default function Range(props: RangeConfig) {
  const min = props.mode === 'continuous' ? props.min : 0;
  const max = props.mode === 'continuous' ? props.max : props.values.length - 1;
  const [selection, setSelection] = useState<[number, number]>([min, max]);
  const handlesRef = useRef<[HTMLDivElement | null, HTMLDivElement | null]>([null, null]);
  const dragRef = useRef<{
    pointerId: number;
    handle: 0 | 1;
    startX: number;
    startValue: number;
    overlapping: boolean;
  } | null>(null);

  // Fixed ranges store option indices so each key press selects one allowed price.
  function priceAt(value: number) {
    return props.mode === 'continuous' ? value : props.values[value];
  }

  function positionOf(value: number) {
    return ((value - min) / (max - min)) * 100;
  }

  function updateValue(handle: 0 | 1, next: number) {
    setSelection((current) => {
      const lowerLimit = handle === 0 ? min : current[0];
      const upperLimit = handle === 0 ? current[1] : max;
      const value = Math.min(upperLimit, Math.max(lowerLimit, next));

      return handle === 0 ? [value, current[1]] : [current[0], value];
    });
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || dragRef.current) return;

    const track = event.currentTarget.getBoundingClientRect();
    if (track.width === 0) return;

    const ratio = Math.min(1, Math.max(0, (event.clientX - track.left) / track.width));
    const pointerValue = min + ratio * (max - min);
    const lowerDistance = Math.abs(pointerValue - selection[0]);
    const upperDistance = Math.abs(pointerValue - selection[1]);
    const handle = lowerDistance < upperDistance ||
      (lowerDistance === upperDistance && (pointerValue < selection[0] || selection[0] === max))
      ? 0 : 1;
    const clickedHandle = (event.target as HTMLElement).closest('[role="slider"]');
    const startValue = clickedHandle
      ? selection[handle]
      : Math.min(max, min + Math.round(pointerValue - min));

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    handlesRef.current[handle]?.focus();
    dragRef.current = {
      pointerId: event.pointerId,
      handle,
      startX: event.clientX,
      startValue,
      overlapping: Boolean(clickedHandle) && selection[0] === selection[1],
    };

    if (!clickedHandle) updateValue(handle, startValue);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const width = event.currentTarget.getBoundingClientRect().width;
    const distance = event.clientX - drag.startX;
    if (width === 0) return;

    // When handles coincide, the first movement selects the handle that can move that way.
    if (drag.overlapping) {
      if (distance === 0) return;
      drag.handle = distance < 0 ? 0 : 1;
      drag.overlapping = false;
      handlesRef.current[drag.handle]?.focus();
    }

    const next = min + Math.round(drag.startValue - min + (distance / width) * (max - min));
    updateValue(drag.handle, next);
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;

    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>, handle: 0 | 1) {
    const lowerLimit = handle === 0 ? min : selection[0];
    const upperLimit = handle === 0 ? selection[1] : max;
    let next = selection[handle];

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next += 1;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next -= 1;
        break;
      case 'Home':
        next = lowerLimit;
        break;
      case 'End':
        next = upperLimit;
        break;
      default:
        return;
    }

    event.preventDefault();
    updateValue(handle, next);
  }

  const lowerPosition = positionOf(selection[0]);
  const upperPosition = positionOf(selection[1]);

  return (
    <div
      role="group"
      aria-label={props.mode === 'continuous' ? 'Numeric price range' : 'Fixed price range'}
    >
      <div className={styles.row}>
        <span className={styles.value}>{currency.format(priceAt(selection[0]))}</span>
        <div
          className={styles.track}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
        >
          <span
            className={styles.selectedTrack}
            style={{ left: `${lowerPosition}%`, width: `${upperPosition - lowerPosition}%` }}
          />
          {([0, 1] as const).map((handle) => (
            <div
              key={handle}
              ref={(element) => { handlesRef.current[handle] = element; }}
              role="slider"
              tabIndex={0}
              className={styles.handle}
              style={{ left: `${positionOf(selection[handle])}%` }}
              aria-label={handle === 0 ? 'Minimum price' : 'Maximum price'}
              aria-valuemin={priceAt(handle === 0 ? min : selection[0])}
              aria-valuemax={priceAt(handle === 0 ? selection[1] : max)}
              aria-valuenow={priceAt(selection[handle])}
              aria-valuetext={currency.format(priceAt(selection[handle]))}
              onKeyDown={(event) => handleKeyDown(event, handle)}
            />
          ))}
        </div>
        <span className={styles.value}>{currency.format(priceAt(selection[1]))}</span>
      </div>
    </div>
  );
}
