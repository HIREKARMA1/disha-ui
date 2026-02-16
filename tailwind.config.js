/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // CSS Variables for shadcn/ui components
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#e6f3ff",
          100: "#b3d9ff",
          200: "#80bfff",
          300: "#4da5ff",
          400: "#1a8bff",
          500: "#1b52a4", // Main brand color - Dark Blue
          600: "#154a8f",
          700: "#0f427a",
          800: "#093a65",
          900: "#033250",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          50: "#e6f9ff",
          100: "#b3edff",
          200: "#80e1ff",
          300: "#4dd5ff",
          400: "#1ac9ff",
          500: "#00a2e5", // Bright Blue
          600: "#0091cc",
          700: "#0080b3",
          800: "#006f99",
          900: "#005e80",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          yellow: {
            50: "#fffdf0",
            100: "#fff8cc",
            200: "#fff399",
            300: "#ffee66",
            400: "#ffe933",
            500: "#fec40d", // Yellow
            600: "#e5b00c",
            700: "#cc9c0b",
            800: "#b3880a",
            900: "#997409",
          },
          orange: {
            50: "#fef7f0",
            100: "#fdebd1",
            200: "#fbdfb2",
            300: "#f9d393",
            400: "#f7c774",
            500: "#f58020", // Orange
            600: "#dd731d",
            700: "#c5661a",
            800: "#ad5917",
            900: "#954c14",
          },
          red: {
            50: "#fdf2f2",
            100: "#fbe6e6",
            200: "#f9d9d9",
            300: "#f7cccc",
            400: "#f5bfbf",
            500: "#d64246", // Red
            600: "#c13b3f",
            700: "#ac3438",
            800: "#972d31",
            900: "#82262a",
          },
          green: {
            50: "#f0f9f6",
            100: "#d1f0e6",
            200: "#b2e7d6",
            300: "#93dec6",
            400: "#74d5b6",
            500: "#098855", // Dark Green
            600: "#087a4c",
            700: "#076c43",
            800: "#065e3a",
            900: "#055031",
          },
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Semantic colors
        success: "#098855", // Dark Green
        warning: "#fec40d", // Yellow
        error: "#d64246", // Red
        info: "#00a2e5", // Bright Blue

        // Brand colors for backward compatibility
        brand: {
          black: "#000000",
          white: "#FFFFFF",
          blue: "#1b52a4", // Updated to Dark Blue
        },

        // Enhanced gray scale
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        poppins: ["var(--font-poppins)", "Poppins", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(27, 82, 164, 0.07), 0 10px 20px -2px rgba(27, 82, 164, 0.04)",
        medium:
          "0 4px 25px -5px rgba(27, 82, 164, 0.1), 0 10px 10px -5px rgba(27, 82, 164, 0.04)",
        large:
          "0 10px 40px -10px rgba(27, 82, 164, 0.15), 0 20px 25px -5px rgba(27, 82, 164, 0.1)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
