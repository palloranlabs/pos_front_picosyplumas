/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    navy: '#002e9c',
                    blue: '#0073bc',
                    green: '#3ec800',
                    yellow: '#ffab22',
                    red: '#e63946',
                    purple: '#ab117d',
                }
            },
            fontFamily: {
                sans: ['Nunito', 'sans-serif'], // UI Headings
                body: ['Inter', 'sans-serif'],   // Data & Grids
                mono: ['Courier Prime', 'monospace'], // STRICTLY for Thermal Tickets
            }
        },
    },
    plugins: [],
}
