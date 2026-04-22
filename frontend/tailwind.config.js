/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1", // Indigo 500
        secondary: "#ec4899", // Pink 500
        background: "#f8fafc", // Slate 50
        surface: "#ffffff",
        text: "#1e293b", // Slate 800
        textLight: "#64748b", // Slate 500
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'card': '0 10px 40px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
