import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        kondo: {
          navy: "#061B57",
          blue: "#0866FF",
          cyan: "#22B8FF",
          sky: "#EAF5FF",
          ink: "#08122B",
          muted: "#667085"
        }
      },
      boxShadow: {
        soft: "0 18px 45px rgba(8, 18, 43, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
