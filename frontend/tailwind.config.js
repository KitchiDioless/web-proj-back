/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Share Tech Mono', 'monospace'],
        display: ['Share Tech Mono', 'monospace'],
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem'
      },
      colors: {
        border: "hsl(180 100% 20% / 0.3)",
        input: "hsl(200 100% 10%)",
        ring: "hsl(180 100% 50%)",
        background: "hsl(220 30% 5%)",
        foreground: "hsl(180 100% 90%)",
        primary: {
          DEFAULT: "hsl(180 100% 50%)",
          foreground: "hsl(220 30% 5%)",
        },
        secondary: {
          DEFAULT: "hsl(280 100% 50%)",
          foreground: "hsl(180 100% 90%)",
        },
        destructive: {
          DEFAULT: "hsl(0 100% 50%)",
          foreground: "hsl(180 100% 90%)",
        },
        muted: {
          DEFAULT: "hsl(220 30% 10%)",
          foreground: "hsl(180 100% 70%)",
        },
        accent: {
          DEFAULT: "hsl(300 100% 50%)",
          foreground: "hsl(180 100% 90%)",
        },
        popover: {
          DEFAULT: "hsl(220 30% 8%)",
          foreground: "hsl(180 100% 90%)",
        },
        card: {
          DEFAULT: "hsl(220 30% 8% / 0.8)",
          foreground: "hsl(180 100% 90%)",
        },
      },
      boxShadow: {
        'neon': '0 0 10px hsl(180 100% 50%), 0 0 20px hsl(180 100% 50% / 0.5)',
        'neon-lg': '0 0 20px hsl(180 100% 50%), 0 0 40px hsl(180 100% 50% / 0.5)',
      }
    }
  },
  plugins: [],
}