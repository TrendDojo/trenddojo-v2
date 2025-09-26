/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Keep existing
        background: "var(--background)",
        foreground: "var(--foreground)",
        
        // TrendDojo Custom Theme Colors
        'trenddojo': {
          // Primary brand colors (purple-blue)
          'primary': {
            50: '#f0f4ff',
            100: '#e0e7ff', 
            200: '#c7d2fe',
            300: '#a5b4fc',
            400: '#818cf8',
            500: '#6366f1',
            600: '#5b21b6', // Main CTA button color
            700: '#4c1d95',
            800: '#3730a3',
            900: '#312e81',
            950: '#1e1b4b',
          },
          
          // Background colors
          'bg': {
            'primary': '#0f172a',   // Deep navy background
            'secondary': '#1e293b', // Card backgrounds  
            'tertiary': '#334155',  // Borders/dividers
          },
          
          // Purple accent colors (for "Discipline" text and shapes)
          'purple': {
            50: '#faf5ff',
            100: '#f3e8ff',
            200: '#e9d5ff', 
            300: '#d8b4fe',
            400: '#c084fc',
            500: '#a855f7',
            600: '#9333ea',  
            700: '#7c3aed', // "Discipline" text color
            800: '#6b21a8',
            900: '#581c87',
            950: '#3b0764',
          },
          
          // Status colors
          'status': {
            'success': '#10b981',
            'warning': '#f59e0b', 
            'error': '#ef4444',
            'info': '#3b82f6',
          }
        }
      },
      
      // Custom animations for the floating shapes
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 8s ease-in-out infinite 2s',
      },
      
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      
      // Custom backdrop blur
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}