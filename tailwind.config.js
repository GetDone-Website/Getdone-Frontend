/** @type {import('tailwindcss').Config} */

// Warna dibaca dari CSS variable (format "R G B") di src/styles/globals.css,
// sehingga seluruh utilitas (bg-surface, text-primary, dst.) otomatis ikut berganti saat <html class="dark">.
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

const colorNames = [
  "background", "surface", "surface-clean", "surface-muted", "surface-dim", "surface-variant",
  "surface-container-lowest", "surface-container-low", "surface-container", "surface-container-high", "surface-container-highest",
  "on-surface", "on-surface-variant", "inverse-surface", "text-muted", "border-subtle",
  "primary", "primary-container", "primary-fixed", "primary-fixed-dim", "on-primary", "on-primary-fixed", "on-primary-fixed-variant",
  "secondary", "secondary-container", "secondary-fixed", "on-secondary", "on-secondary-fixed",
  "tertiary", "tertiary-container", "tertiary-fixed", "tertiary-fixed-dim", "on-tertiary", "on-tertiary-fixed",
  "error-container", "on-error-container", "state-done", "state-progress", "state-urgent", "cta-hover",
];

const font = ['"Plus Jakarta Sans"', "sans-serif"];
const type = (size, line, weight, tracking) => [size, { lineHeight: line, fontWeight: weight, ...(tracking ? { letterSpacing: tracking } : {}) }];

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: Object.fromEntries(colorNames.map((n) => [n, token(n)])),
      spacing: {
        "space-xs": "0.25rem", "space-sm": "0.5rem", "space-md": "1rem", "space-lg": "1.5rem", "space-xl": "2rem",
        gutter: "1.5rem", margin: "2rem",
      },
      fontFamily: Object.fromEntries(
        ["body-lg", "body-md", "body-sm", "display-lg", "display-timer", "headline-lg", "headline-md", "headline-sm", "label-lg", "label-md", "label-sm"].map((n) => [n, font]),
      ),
      fontSize: {
        "body-lg": type("1.125rem", "1.75rem", "400"),
        "body-md": type("0.9375rem", "1.5rem", "400"),
        "body-sm": type("0.8125rem", "1.25rem", "400"),
        "display-lg": type("3rem", "3.5rem", "700", "-0.03em"),
        "display-timer": type("4.5rem", "4.5rem", "800", "-0.04em"),
        "headline-lg": type("2rem", "2.5rem", "700", "-0.02em"),
        "headline-md": type("1.5rem", "2rem", "600", "-0.01em"),
        "headline-sm": type("1.125rem", "1.5rem", "600"),
        "label-lg": type("0.875rem", "1.25rem", "600", "0.01em"),
        "label-md": type("0.75rem", "1rem", "600", "0.02em"),
        "label-sm": type("0.6875rem", "0.875rem", "500", "0.03em"),
      },
    },
  },
  plugins: [],
};
