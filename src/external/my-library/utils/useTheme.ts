import { useState, useEffect } from 'react';

// Define a type for safety
type Theme = 'light' | 'dark';

export const useTheme = () => {
    // Initialize state with a lazy initialization function
    const [theme, setTheme] = useState<Theme>(() => {
        // 1. Check Local Storage
        const savedTheme = localStorage.getItem('theme');

        // Validate that the saved theme is actually 'light' or 'dark'
        if (savedTheme === 'light' || savedTheme === 'dark') {
            return savedTheme;
        }

        // 2. Check System Preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        // 3. Default to light
        return 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        // Update the DOM
        root.setAttribute('data-theme', theme);
        // Save to Local Storage
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    return { theme, toggleTheme };
};