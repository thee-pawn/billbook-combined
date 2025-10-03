// tailwind.config.js (located inside src/)
// Root cause note: Because this config file lived inside src/, the old content paths like "./src/**/*" pointed to src/src/** which doesn't exist.
// That prevented Tailwind from seeing your component class names (hidden, md:flex, etc.), so those utilities were purged/not generated.
// Fixed by changing globs to look in the current directory (./**/*) and stepping up for public/index.html & root index.html.
module.exports = {
  content: [
    "./**/*.{js,jsx,ts,tsx}",     // all source files within src
    "../public/index.html",       // public HTML one level up
    "../index.html"               // root index.html (if used)
  ],
  theme: {
    extend: {
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [], // plugins are loaded via @plugin directives in tailwind.css (v4 style)
};
