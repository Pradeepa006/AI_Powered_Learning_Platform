/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}', // Scan app directory for pages and layouts
        './pages/**/*.{js,ts,jsx,tsx,mdx}', // Scan pages directory (if you still have one)
        './components/**/*.{js,ts,jsx,tsx,mdx}', // Scan components directory
        './src/**/*.{js,ts,jsx,tsx,mdx}', // General scan for anything in src
    ],
    theme: {
        extend: {},
    },
    plugins: [],
};