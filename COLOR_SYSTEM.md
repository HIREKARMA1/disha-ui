# HireKarma Color System

## Overview
This document describes the centralized color system implemented for HireKarma. The system is designed to be easily maintainable and allows for quick color theme changes across the entire UI.

## Color Palette
The system is based on the following 6-color palette:

- **Dark Blue** (`#1b52a4`) - Primary brand color
- **Bright Blue** (`#00a2e5`) - Secondary brand color  
- **Yellow** (`#fec40d`) - Warning/Accent color
- **Orange** (`#f58020`) - Accent color
- **Red** (`#d64246`) - Error/Destructive color
- **Dark Green** (`#098855`) - Success color

## File Structure
- **`lib/colors.ts`** - Central color definitions and utilities
- **`tailwind.config.js`** - Tailwind CSS configuration with color extensions
- **`COLOR_SYSTEM.md`** - This documentation file

## Color Categories

### 1. Primary Colors
- **Primary 500** (`#1b52a4`) - Main brand color, used for:
  - Primary buttons
  - Brand elements
  - Focus states
  - Main text accents

### 2. Secondary Colors  
- **Secondary 500** (`#00a2e5`) - Supporting brand color, used for:
  - Secondary buttons
  - Gradients with primary
  - Info states
  - Hover effects

### 3. Accent Colors
- **Yellow** (`#fec40d`) - Warning states, highlights
- **Orange** (`#f58020`) - Accent elements, tertiary actions
- **Red** (`#d64246`) - Error states, destructive actions
- **Green** (`#098855`) - Success states, positive feedback

### 4. Semantic Colors
- `success` - Success messages, positive feedback
- `warning` - Warning messages, caution states
- `error` - Error messages, destructive actions
- `info` - Information messages, neutral states

## Usage Examples

### In Components
```tsx
// Using Tailwind classes (recommended)
<Button className="bg-primary-500 hover:bg-primary-600">
  Primary Button
</Button>

<Button className="bg-secondary-500 hover:bg-secondary-600">
  Secondary Button
</Button>

<Button className="bg-success hover:bg-accent-green-600">
  Success Button
</Button>
```

### In CSS
```css
.custom-element {
  background-color: theme('colors.primary.500');
  border-color: theme('colors.border.focus');
}
```

### Direct Import
```tsx
import { colors, primary, secondary } from '@/lib/colors';

// Access specific colors
const brandColor = colors.primary[500];
const accentColor = colors.accent.yellow[500];
```

## Button Variants
The Button component includes these color variants:
- `default` - Primary colors
- `secondary` - Secondary colors  
- `destructive` - Error colors
- `success` - Success colors
- `warning` - Warning colors
- `info` - Info colors
- `outline` - Bordered with hover effects
- `ghost` - Transparent with hover effects
- `link` - Text-only with primary color
- `gradient` - Primary to secondary gradient

## Changing Colors

### Method 1: Update Tailwind Config (Recommended)
1. Modify `tailwind.config.js`
2. Colors will automatically update across all components
3. No component changes needed

### Method 2: Update Color Definitions
1. Modify `lib/colors.ts`
2. Update any hardcoded color references
3. Rebuild the application

### Method 3: CSS Custom Properties
1. Add CSS custom properties to `globals.css`
2. Reference them in components
3. Update values in one place

## Best Practices

1. **Always use semantic color names** instead of hardcoded hex values
2. **Use Tailwind classes** when possible for consistency
3. **Test color contrast** for accessibility compliance
4. **Maintain color hierarchy** - primary for main actions, secondary for supporting elements
5. **Use accent colors sparingly** for emphasis and highlights

## Accessibility
- All colors meet WCAG AA contrast requirements
- Dark mode support included
- Focus states use primary colors for visibility
- Error and success states have distinct, accessible colors

## Future Enhancements
- Color scheme switching (light/dark/auto)
- Custom theme creation
- Color palette generation tools
- Accessibility validation tools

## Troubleshooting

### Colors Not Updating
1. Check if Tailwind is rebuilding
2. Verify color names in config
3. Clear browser cache
4. Restart development server

### Color Conflicts
1. Check for hardcoded colors in components
2. Verify Tailwind class specificity
3. Use `!important` sparingly and only when necessary

### Performance Issues
1. Limit color variations to necessary shades
2. Use CSS custom properties for dynamic colors
3. Avoid excessive color calculations in components
