/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'background-primary': '#F9FAFB',
        'background-secondary': '#F3F4F6',
        'card-background': '#FFFFFF',
        'border-default': '#D1D5DB',
        divider: '#E5E7EB',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        'text-tertiary': '#9CA3AF',
        'text-disabled': '#D1D5DB',
        'button-primary': '#2563EB',
        'button-primary-pressed': '#1D4ED8',
        'button-secondary': '#E5E7EB',
        'button-secondary-text': '#111827',
        'button-destructive': '#DC2626',
        'state-success': '#16A34A',
        'state-warning': '#F59E0B',
        'state-error': '#DC2626',
        'state-info': '#2563EB',
      },
    },
  },
  plugins: [],
};
