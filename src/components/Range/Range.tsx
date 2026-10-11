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
  const [editing, setEditing] = useState<{ handle: 0 | 1; value: string } | null>(null);
  const [pointerFocus, setPointerFocus] = useState(false);
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
      const value = clampValue(handle, next, current);

      return handle === 0 ? [value, current[1]] : [current[0], value];
    });
  }

  function clampValue(handle: 0 | 1, value: number, current: [number, number]) {
    const lowerLimit = handle === 0 ? min : current[0];
    const upperLimit = handle === 0 ? current[1] : max;
    return Math.min(upperLimit, Math.max(lowerLimit, value));
  }

  function readPrice(text: string, previous: number) {
    const normalized = text.trim().replace(',', '.');
    const value = Number(normalized);
    return normalized !== '' && Number.isFinite(value) ? Math.round(value * 100) / 100 : previous;
  }

  function renderPrice(handle: 0 | 1) {
    const displayedValue = editing?.handle === handle
      ? editing.value
      : selection[handle].toFixed(2);

    return (
      <label className={styles.priceField}>
        <span>{handle === 0 ? 'Minimum price' : 'Maximum price'}</span>
        <span className={styles.inputWrapper}>
          <span className={styles.currency} aria-hidden="true">€</span>
          <input
            className={styles.priceInput}
            type="text"
            inputMode="decimal"
            aria-label={handle === 0 ? 'Minimum price in euros' : 'Maximum price in euros'}
            value={displayedValue}
            onFocus={(event) => {
              setEditing({ handle, value: selection[handle].toFixed(2) });
              event.currentTarget.select();
            }}
            onChange={(event) => setEditing({ handle, value: event.target.value })}
            onBlur={(event) => {
              updateValue(handle, readPrice(event.currentTarget.value, selection[handle]));
              setEditing(null);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.currentTarget.blur();
              if (event.key === 'Escape') {
                setEditing({ handle, value: selection[handle].toFixed(2) });
              }
            }}
          />
        </span>
      </label>
    );
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || dragRef.current) return;

    const track = event.currentTarget.getBoundingClientRect();
    if (track.width === 0) return;

    // Focusing a handle commits an active input; start the drag from that new price.
    const currentSelection: [number, number] = [...selection];
    if (editing) {
      currentSelection[editing.handle] = clampValue(
        editing.handle,
        readPrice(editing.value, selection[editing.handle]),
        selection,
      );
    }

    const ratio = Math.min(1, Math.max(0, (event.clientX - track.left) / track.width));
    const pointerValue = min + ratio * (max - min);
    const lowerDistance = Math.abs(pointerValue - currentSelection[0]);
    const upperDistance = Math.abs(pointerValue - currentSelection[1]);
    const handle = lowerDistance < upperDistance ||
      (lowerDistance === upperDistance && (pointerValue < currentSelection[0] || currentSelection[0] === max))
      ? 0 : 1;
    const clickedHandle = (event.target as HTMLElement).closest('[role="slider"]');
    const startValue = clickedHandle
      ? currentSelection[handle]
      : Math.min(max, min + Math.round(pointerValue - min));

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    handlesRef.current[handle]?.focus();
    dragRef.current = {
      pointerId: event.pointerId,
      handle,
      startX: event.clientX,
      startValue,
      overlapping: Boolean(clickedHandle) && currentSelection[0] === currentSelection[1],
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
      className={styles.range}
      role="group"
      aria-label={props.mode === 'continuous' ? 'Numeric price range' : 'Fixed price range'}
      data-pointer-focus={pointerFocus}
      onPointerDownCapture={() => setPointerFocus(true)}
      onKeyDownCapture={() => setPointerFocus(false)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPointerFocus(false);
      }}
    >
      <div className={styles.row}>
        <span className={styles.value}>
          {currency.format(priceAt(props.mode === 'continuous' ? min : selection[0]))}
        </span>
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
        <span className={styles.value}>
          {currency.format(priceAt(props.mode === 'continuous' ? max : selection[1]))}
        </span>
      </div>
      {props.mode === 'continuous' && (
        <div className={styles.priceFields}>
          {renderPrice(0)}
          {renderPrice(1)}
        </div>
      )}
    </div>
  );
}
