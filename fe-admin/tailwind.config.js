/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {},
  plugins: [],
  // Tắt preflight để tránh conflict với Ant Design
  corePlugins: {
    preflight: false,
  },
};
