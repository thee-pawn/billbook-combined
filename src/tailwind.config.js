// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust this to match your project structure
    "./public/index.html",
  ],
  theme: {
    extend: {
          screens: {
            'sm': '640px', // Default
            'md': '768px', // Default
            'lg': '1024px', // Default
            'xl': '1280px', // Default
            '2xl': '1536px', // Default
            '3xl': '1920px', // Custom breakpoint for larger screens
      },
    },
  },
  plugins: [],
}
