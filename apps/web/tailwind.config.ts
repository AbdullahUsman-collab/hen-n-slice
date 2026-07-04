/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#4C1590',
          'purple-deep': '#250764',
          gold: '#FEC11F',
          orange: '#EE861B',
          'promo-yellow': '#FEDA83',
        },
        surface: {
          background: '#FEFEFE',
          card: '#FFFFFF',
        },
        text: {
          primary: '#1A1A2E',
          secondary: '#6B7280',
          muted: '#9CA3AF',
          'on-brand': '#FFFFFF',
        },
        border: {
          DEFAULT: '#E5E0EB',
          light: '#F0ECF5',
        },
        status: {
          success: '#22C55E',
          warning: '#EAB308',
          error: '#EF4444',
        },
      },
      fontFamily: {
        heading: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['12px', '16px'],
        sm: ['14px', '20px'],
        base: ['16px', '24px'],
        lg: ['18px', '28px'],
        xl: ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['30px', '38px'],
        '4xl': ['36px', '44px'],
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
        20: '80px',
      },
      borderRadius: {
        none: '0',
        sm: '6px',
        md: '12px',
        lg: '16px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(76,21,144,0.08)',
        md: '0 4px 12px rgba(76,21,144,0.12)',
        lg: '0 8px 24px rgba(76,21,144,0.15)',
      },
      maxWidth: {
        container: '1200px',
      },
    },
  },
  plugins: [],
};
