'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type SwipeDirection = 'left' | 'right';

type SwipeDeckProps<T> = {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  onSwipe?: (dir: SwipeDirection, item: T) => void;
  getId?: (item: T, index: number) => string;
  emptyState?: React.ReactNode;
};

export default function SwipeDeck<T>({
  items,
  renderItem,
  onSwipe,
  getId = (_item, i) => String(i),
  emptyState = <p className="text-sm text-gray-500">No more cards 🎉</p>,
}: SwipeDeckProps<T>) {
  const [index, setIndex] = useState(0);
  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [animating, setAnimating] = useState<'left' | 'right' | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const threshold = 120; // px

  // Top 3 visible
  const visible = useMemo(() => items.slice(index, index + 3), [items, index]);

  // Style for top card while dragging
  const topCardStyle = useMemo(() => {
    const rotate = Math.max(-20, Math.min(20, dx / 10));
    return { transform: `translate(${dx}px, ${dy}px) rotate(${rotate}deg)` } as React.CSSProperties;
  }, [dx, dy]);

  const commitSwipe = useCallback(
    (dir: SwipeDirection) => {
      if (index >= items.length) return;
      const item = items[index];
      setAnimating(dir);

      const el = document.getElementById('swipe-top-card');
      const offX = (dir === 'right' ? 1 : -1) * (window.innerWidth + 200);
      const rotate = dir === 'right' ? 25 : -25;

      if (el) {
        el.style.transition = 'transform 300ms ease-out';
        el.style.transform = `translate(${offX}px, ${dy}px) rotate(${rotate}deg)`;
      }

      window.setTimeout(() => {
        setAnimating(null);
        setDx(0);
        setDy(0);
        setIndex((i) => i + 1);
        onSwipe?.(dir, item);

        setToast(dir === 'right' ? 'Saved 👍 (Right swipe)' : 'Dismissed 👎 (Left swipe)');
        window.setTimeout(() => setToast(null), 1300);
      }, 280);
    },
    [dy, index, items, onSwipe]
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (animating) return;
    // capture on the element with the handler (not the child)
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || animating) return;
    setDx((prev) => prev + e.movementX);
    setDy((prev) => prev + e.movementY);
  };

  const snapBack = () => {
    const el = document.getElementById('swipe-top-card');
    if (el) {
      el.style.transition = 'transform 200ms ease-out';
      el.style.transform = 'translate(0px, 0px) rotate(0deg)';
      window.setTimeout(() => {
        if (el) el.style.transition = '';
        setDx(0);
        setDy(0);
      }, 180);
    } else {
      setDx(0);
      setDy(0);
    }
  };

  const onPointerUp = () => {
    if (!dragging || animating) return;
    setDragging(false);
    if (Math.abs(dx) > threshold) {
      commitSwipe(dx > 0 ? 'right' : 'left');
    } else {
      snapBack();
    }
  };

  // Keyboard: ArrowLeft/ArrowRight or A/D
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (animating) return;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') commitSwipe('left');
      if (k === 'arrowright' || k === 'd') commitSwipe('right');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [commitSwipe, animating]);

  if (index >= items.length) {
    return (
      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border p-6 bg-white text-center">{emptyState}</div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md select-none touch-none">
      {/* Toast */}
      <div
        className={`pointer-events-none fixed left-1/2 top-6 z-[9999] -translate-x-1/2 transform transition-opacity ${
          toast ? 'opacity-100' : 'opacity-0'
        }`}
        aria-live="polite"
      >
        <div className="rounded-full bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">{toast ?? ' '}</div>
      </div>

      {visible.map((item, i) => {
        const isTop = i === 0;
        const scale = isTop ? 1 : i === 1 ? 0.98 : 0.96;
        const y = isTop ? 0 : i === 1 ? 10 : 20;

        const baseStyle: React.CSSProperties = isTop
          ? { ...topCardStyle }
          : { transform: `translateY(${y}px) scale(${scale})` };

        // Make sure the top card is really on top and only it receives pointer events
        const style: React.CSSProperties = {
          ...baseStyle,
          zIndex: 100 - i,
          cursor: isTop ? (dragging ? 'grabbing' : 'grab') : 'default',
          pointerEvents: isTop ? 'auto' : 'none',
        };

        return (
          <div
            key={getId(item, index + i)}
            id={isTop ? 'swipe-top-card' : undefined}
            className="absolute inset-0 will-change-transform"
            style={style}
            onPointerDown={isTop ? onPointerDown : undefined}
            onPointerMove={isTop ? onPointerMove : undefined}
            onPointerUp={isTop ? onPointerUp : undefined}
            onPointerCancel={isTop ? onPointerUp : undefined}
            role={isTop ? 'group' : undefined}
            aria-roledescription={isTop ? 'Tinder-like swipable card' : undefined}
          >
            {/* Card content */}
            {renderItem(item)}

            {/* Overlays */}
            {isTop && (
              <>
                <div
                  className={`pointer-events-none absolute left-4 top-4 rounded-md border-2 px-3 py-1 text-sm font-semibold tracking-widest transition-opacity ${
                    dx > 15 ? 'border-green-500 text-green-500 opacity-100' : 'opacity-0'
                  }`}
                >
                  LIKE
                </div>
                <div
                  className={`pointer-events-none absolute right-4 top-4 rounded-md border-2 px-3 py-1 text-sm font-semibold tracking-widest transition-opacity ${
                    dx < -15 ? 'border-red-500 text-red-500 opacity-100' : 'opacity-0'
                  }`}
                >
                  NOPE
                </div>
              </>
            )}
          </div>
        );
      })}

      {/* Controls under the stack */}
      <div className="mt-[420px] flex items-center justify-center gap-4">
        <button
          className="rounded-full border bg-white px-5 py-3 text-sm shadow-sm hover:shadow-md"
          onClick={() => commitSwipe('left')}
          aria-label="Nope (Left)"
        >
          👎 Nope
        </button>
        <button
          className="rounded-full border bg-white px-5 py-3 text-sm shadow-sm hover:shadow-md"
          onClick={() => commitSwipe('right')}
          aria-label="Like (Right)"
        >
          👍 Like
        </button>
      </div>

      <p className="mt-3 text-center text-xs text-gray-500">Tip: drag to swipe, or use ← / → (A / D) keys.</p>
    </div>
  );
}
