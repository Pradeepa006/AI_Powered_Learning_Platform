'use client';

import { Sun, Moon } from 'lucide-react'; // Assuming lucide-react is installed for icons
import { useTheme } from 'next-themes'; // Use next-themes for theme management
import { useState, useEffect } from 'react';

export function ThemeToggler() {
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // useEffect runs only on the client, so we can safely access window/localStorage
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Render a placeholder or null on the server and during initial client render
        // to prevent hydration mismatch. The actual icon will render after hydration.
        return (
            <button
                className="p-2 rounded-full bg-white/5 hover:bg-white/10"
                aria-label="Toggle theme"
            >
                {/* You can put a generic icon or spinner here if desired */}
                <Sun className="h-5 w-5 text-gray-800 dark:text-gray-200" />
            </button> // This placeholder will render on the server
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-gray-800 dark:text-gray-200" /> : <Moon className="h-5 w-5 text-gray-800 dark:text-gray-200" />}
        </button>
    );
}