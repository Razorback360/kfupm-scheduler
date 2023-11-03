import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["poppins", ...fontFamily.sans],
      },
      colors:{
        "secondary":"#1e293b",
        "primary": "#111827",
        "tertiary": "#0f172a" 
      }
    },
  },
  plugins: [],
} satisfies Config;
