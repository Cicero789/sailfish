/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'editor-bg': '#FAFAFA',
        'editor-text': '#1F2937',
        'editor-border': '#E5E7EB',
        'sidebar-bg': '#F3F4F6',
        'accent': '#3B82F6',
        'accent-light': '#DBEAFE',
      }
    },
  },
  plugins: [],
}
