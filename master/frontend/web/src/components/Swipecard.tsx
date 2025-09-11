'use client';

import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import React from 'react';

export type SwipeDirection = 'left' | 'right';

export type SwipeCardProps = {
  children: React.ReactNode;
  onSwipe?: (dir: SwipeDirection) => void;
  className?: string;
  swipeThreshold?: number;
};

export default function SwipeCard({
  children,
  onSwipe,
  className,
  swipeThreshold = 120,
}: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-12, 0, 12]);
  const likeOpacity = useTransform(x, [20, 140], [0, 1]);
  const nopeOpacity = useTransform(x, [-140, -20], [1, 0]);

  const handleDragEnd = () => {
    const v = x.get();
    if (v > swipeThreshold) onSwipe?.('right');
    else if (v < -swipeThreshold) onSwipe?.('left');
  };

  return (
    <AnimatePresence>
      <motion.div
        role="group"
        aria-label="Swipeable card"
        className={clsx(
          'relative select-none rounded-2xl bg-white shadow-xl p-5 w-full h-full',
          className
        )}
        style={{ x, rotate }}
        drag="x"
        dragElastic={0.2}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-4 top-4 rounded-md border-2 border-green-500 px-3 py-1 text-sm font-bold text-green-600"
          style={{ opacity: likeOpacity }}
        >
          LIKE
        </motion.div>
        <motion.div
          aria-hidden
          className="pointer-events-none absolute right-4 top-4 rounded-md border-2 border-rose-500 px-3 py-1 text-sm font-bold text-rose-600"
          style={{ opacity: nopeOpacity }}
        >
          NOPE
        </motion.div>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
