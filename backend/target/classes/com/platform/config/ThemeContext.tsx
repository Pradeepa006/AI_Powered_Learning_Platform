'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    // Default to 'light' on the server to prevent hydration mismatch
    const [theme, setThemeState] = useState<Theme>('light');

    useEffect(() => {
        // This effect runs only on the client after initial render
        const savedTheme = localStorage.getItem('theme') as Theme;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme) {
            setThemeState(savedTheme);
        } else if (prefersDark) {
            setThemeState('dark');
        } else {
            setThemeState('light');
        }
    }, []); // Run once on mount

    useEffect(() => {
        // This effect applies the theme class to the html element
        // and saves the preference to localStorage whenever theme changes
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]); // Run whenever theme state changes

    const toggleTheme = () => {
        setThemeState((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};