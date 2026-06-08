import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // INI WAJIB ADA
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          blue: "#2563eb",
          light: "#eff6ff",
        }
      }
    },
  },
plugins: [require('@tailwindcss/typography')],
};
export default config;