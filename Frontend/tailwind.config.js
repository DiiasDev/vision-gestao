/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  darkMode: "class",
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'background-primary': 'rgb(var(--background-primary) / <alpha-value>)',
        'background-secondary': 'rgb(var(--background-secondary) / <alpha-value>)',
        'card-background': 'rgb(var(--card-background) / <alpha-value>)',
        'border-default': 'rgb(var(--border-default) / <alpha-value>)',
        divider: 'rgb(var(--divider) / <alpha-value>)',
        'text-primary': 'rgb(var(--text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
        'text-tertiary': 'rgb(var(--text-tertiary) / <alpha-value>)',
        'text-disabled': 'rgb(var(--text-disabled) / <alpha-value>)',
        'button-primary': 'rgb(var(--button-primary) / <alpha-value>)',
        'button-primary-pressed':
          'rgb(var(--button-primary-pressed) / <alpha-value>)',
        'button-secondary': 'rgb(var(--button-secondary) / <alpha-value>)',
        'button-secondary-text':
          'rgb(var(--button-secondary-text) / <alpha-value>)',
        'button-destructive':
          'rgb(var(--button-destructive) / <alpha-value>)',
        'state-success': 'rgb(var(--state-success) / <alpha-value>)',
        'state-warning': 'rgb(var(--state-warning) / <alpha-value>)',
        'state-error': 'rgb(var(--state-error) / <alpha-value>)',
        'state-info': 'rgb(var(--state-info) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};
