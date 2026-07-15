'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ThemeToggler() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // Render a placeholder or null on the server and during initial client render
  // to prevent hydration mismatch. The actual icon will render after hydration.
  if (!mounted) {
    return (
      <button className="p-2 rounded-full bg-white/5 hover:bg-white/10" aria-label="Toggle theme">
        {/* You can render a generic icon or null here */}
        <Sun className="h-5 w-5 text-gray-800 dark:text-gray-200" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-full bg-white/5 hover:bg-white/10"
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark' ? <Sun className="h-5 w-5 text-gray-800 dark:text-gray-200" /> : <Moon className="h-5 w-5 text-gray-800 dark:text-gray-200" />}
    </button>
  );
}
