'use client';

import { useEffect } from 'react';

export default function GameBodyMode() {
  useEffect(() => {
    document.body.classList.add('game-lock');
    return () => document.body.classList.remove('game-lock');
  }, []);

  return null;
}
