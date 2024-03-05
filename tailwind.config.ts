import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        "upper-blur": "0 -15px 30px 15px rgba(255, 255, 255, 0.8)",
      },
      keyframes: {
        bgload: {
          '0%': { backgroundSize: '0px' },
          '100%': {backgroundSize: '100%'}
        },
        loadingBounce: {
          "0%, 100%": { transform: "scale(0.5)" },
          "50%": { transform: "scale(1)" },
        }
      },
      animation: {
        bgload: 'bgload 0.72s ease-out',
        loadingBounce: "loadingBounce 1s infinite",
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
