// Centralized color system for HireKarma
// Based on the defined color palette:
// Dark Blue: #1b52a4, Bright Blue: #00a2e5, Yellow: #fec40d, Orange: #f58020, Red: #d64246, Dark Green: #098855

export const colors = {
  // Primary brand colors
  primary: {
    50: '#e6f3ff',
    100: '#b3d9ff',
    200: '#80bfff',
    300: '#4da5ff',
    400: '#1a8bff',
    500: '#1b52a4', // Dark Blue - Main brand color
    600: '#154a8f',
    700: '#0f427a',
    800: '#093a65',
    900: '#033250',
  },
  
  // Secondary colors
  secondary: {
    50: '#e6f9ff',
    100: '#b3edff',
    200: '#80e1ff',
    300: '#4dd5ff',
    400: '#1ac9ff',
    500: '#00a2e5', // Bright Blue
    600: '#0091cc',
    700: '#0080b3',
    800: '#006f99',
    900: '#005e80',
  },
  
  // Accent colors
  accent: {
    yellow: {
      50: '#fffdf0',
      100: '#fff8cc',
      200: '#fff399',
      300: '#ffee66',
      400: '#ffe933',
      500: '#fec40d', // Yellow
      600: '#e5b00c',
      700: '#cc9c0b',
      800: '#b3880a',
      900: '#997409',
    },
    orange: {
      50: '#fef7f0',
      100: '#fdebd1',
      200: '#fbdfb2',
      300: '#f9d393',
      400: '#f7c774',
      500: '#f58020', // Orange
      600: '#dd731d',
      700: '#c5661a',
      800: '#ad5917',
      900: '#954c14',
    },
    red: {
      50: '#fdf2f2',
      100: '#fbe6e6',
      200: '#f9d9d9',
      300: '#f7cccc',
      400: '#f5bfbf',
      500: '#d64246', // Red
      600: '#c13b3f',
      700: '#ac3438',
      800: '#972d31',
      900: '#82262a',
    },
    green: {
      50: '#f0f9f6',
      100: '#d1f0e6',
      200: '#b2e7d6',
      300: '#93dec6',
      400: '#74d5b6',
      500: '#098855', // Dark Green
      600: '#087a4c',
      700: '#076c43',
      800: '#065e3a',
      900: '#055031',
    },
  },
  
  // Semantic colors
  semantic: {
    success: '#098855', // Dark Green
    warning: '#fec40d', // Yellow
    error: '#d64246', // Red
    info: '#00a2e5', // Bright Blue
  },
  
  // Neutral colors
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Background colors
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
    dark: '#111827',
    darkSecondary: '#1f2937',
    darkTertiary: '#374151',
  },
  
  // Text colors
  text: {
    primary: '#111827',
    secondary: '#374151',
    tertiary: '#6b7280',
    inverse: '#ffffff',
    muted: '#9ca3af',
  },
  
  // Border colors
  border: {
    light: '#e5e7eb',
    medium: '#d1d5db',
    dark: '#9ca3af',
    focus: '#1b52a4',
  },
  
  // Shadow colors
  shadow: {
    light: 'rgba(27, 82, 164, 0.1)',
    medium: 'rgba(27, 82, 164, 0.15)',
    dark: 'rgba(27, 82, 164, 0.25)',
  },
} as const;

// Color utility functions
export const getColor = (colorPath: string) => {
  const path = colorPath.split('.');
  let current: any = colors;
  
  for (const key of path) {
    if (current[key] === undefined) {
      console.warn(`Color not found: ${colorPath}`);
      return colors.primary[500]; // Fallback to primary color
    }
    current = current[key];
  }
  
  return current;
};

// Export individual color groups for direct access
export const { primary, secondary, accent, semantic, neutral, background, text, border, shadow } = colors;

// Default export for the entire color system
export default colors;
