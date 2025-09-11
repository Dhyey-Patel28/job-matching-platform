'use client';

import React, { useCallback, useEffect, useState } from 'react';
import SwipeCard, { SwipeDirection } from './Swipecard';
import clsx from 'clsx';

export type SwipeDeckProps<T> = {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  onSwipe?: (item: T, dir: SwipeDirection, index: number) => void;
  onExhausted?: () => void;
  allowKeyboard?: boolean;
  swipeThreshold?: number;
  className?: string;
};

export default function SwipeDeck<T>({
  items,
  renderItem,
  onSwipe,
  onExhausted,
  allowKeyboard = true,
  swipeThreshold,
  className,
}: SwipeDeckProps<T>) {
  const [index, setIndex] = useState(0);
  const current = items[index];

  useEffect(() => {
    if (index >= items.length) onExhausted?.();
  }, [index, items.length, onExhausted]);

  const handleSwipe = useCallback(
    (dir: SwipeDirection) => {
      const item = current;
      if (!item) return;
      onSwipe?.(item, dir, index);
      setIndex((i) => i + 1);
    },
    [current, index, onSwipe]
  );

  useEffect(() => {
    if (!allowKeyboard) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSwipe('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSwipe('right');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [allowKeyboard, handleSwipe]);

  const next1 = items[index + 1];
  const next2 = items[index + 2];

  return (
    <div className={clsx('relative mx-auto aspect-[3/4] max-w-sm', className)}>
      {next2 && (
        <div className="absolute inset-0 translate-y-6 scale-[0.96] rounded-2xl bg-gray-100" aria-hidden />
      )}
      {next1 && (
        <div className="absolute inset-0 translate-y-3 scale-[0.98] rounded-2xl bg-gray-100" aria-hidden />
      )}

      {current ? (
        <SwipeCard onSwipe={handleSwipe} swipeThreshold={swipeThreshold}>
          {renderItem(current)}
          <div className="mt-4 flex gap-3">
            <button
              className="rounded-full border border-rose-300 px-4 py-2 text-rose-600 hover:bg-rose-50"
              onClick={() => handleSwipe('left')}
              aria-label="Pass"
            >
              Pass
            </button>
            <button
              className="rounded-full border border-green-300 px-4 py-2 text-green-700 hover:bg-green-50"
              onClick={() => handleSwipe('right')}
              aria-label="Like"
            >
              Like
            </button>
          </div>
        </SwipeCard>
      ) : (
        <div className="flex h-full items-center justify-center rounded-2xl border border-dashed">
          <p className="text-gray-500">No more cards</p>
        </div>
      )}
    </div>
  );
}
