# TrendDojo Design Theme

*Based on the homepage design with deep navy background and purple accent colors*

## 🎨 Color Palette

### Background Colors
```css
--bg-primary: #0f172a     /* Deep navy - main background */
--bg-secondary: #1e293b   /* Card backgrounds */
--bg-tertiary: #334155    /* Borders, dividers */
```

### Text Colors  
```css
--text-primary: #ffffff   /* Main headings */
--text-secondary: #e2e8f0 /* Body text, descriptions */ 
--text-muted: #94a3b8     /* Labels, secondary info */
--text-accent: #8b5cf6    /* Purple accent ("Discipline") */
```

### Brand Colors
```css
--purple-600: #9333ea     /* Primary purple */
--purple-700: #7c3aed     /* "Discipline" text */
--primary-600: #5b21b6    /* CTA button */
```

## 🏗️ Usage in Components

### Tailwind Classes

**Backgrounds:**
```html
<!-- Main background -->
<div class="bg-trenddojo-bg-primary">

<!-- Card backgrounds -->
<div class="bg-trenddojo-bg-secondary/60 backdrop-blur-sm">

<!-- Stats cards -->
<div class="bg-white/20 backdrop-blur-md border border-white/10">
```

**Text:**
```html
<!-- Main headings -->
<h1 class="text-white drop-shadow-lg">

<!-- Accent text -->
<span class="text-trenddojo-purple-700">Discipline</span>

<!-- Body text -->
<p class="text-slate-200 drop-shadow-md">
```

**Buttons:**
```html
<!-- Primary CTA -->
<button class="bg-trenddojo-primary-600 hover:bg-trenddojo-primary-700">

<!-- Secondary button -->
<button class="border border-white/20 hover:border-white/40 backdrop-blur-sm">
```

### TypeScript Theme Object

```typescript
import { trendDojoTheme } from '@/styles/theme'

// Use in components
const buttonStyle = {
  backgroundColor: trendDojoTheme.primary[600],
  color: trendDojoTheme.text.primary,
}
```

## 🎯 Design Principles

### Contrast & Readability
- **High contrast text** with drop shadows for visibility
- **Semi-transparent cards** with backdrop blur for depth
- **Bright accent colors** on dark backgrounds

### Visual Hierarchy
- **White text** for primary headings
- **Light gray** for body text  
- **Purple accent** for brand highlights
- **Colored shapes** for visual interest

### Interactive Elements
- **Hover effects** with opacity and color changes
- **Backdrop blur** for modern glass effect
- **Subtle animations** for floating shapes

## 🔧 Implementation

### Global CSS Variables
Add to your CSS file:
```css
:root {
  --color-bg-primary: #0f172a;
  --color-bg-secondary: #1e293b;
  --color-text-primary: #ffffff;
  --color-text-secondary: #e2e8f0;
  --color-accent: #8b5cf6;
}
```

### Component Examples

**Hero Section:**
```jsx
<section class="bg-trenddojo-bg-primary min-h-screen">
  <h1 class="text-white text-7xl font-bold drop-shadow-lg">
    Trade with <span class="text-trenddojo-purple-700">Discipline</span>
  </h1>
</section>
```

**Stats Cards:**
```jsx
<div class="bg-white/20 backdrop-blur-md rounded-lg p-4 border border-white/10">
  <div class="text-white font-bold drop-shadow-md">10,000+</div>
  <div class="text-slate-200">Trades Executed</div>
</div>
```

## 🚀 Environment Indicators

```jsx
// Development
<div class="bg-slate-800 text-trenddojo-status-warning">DEVELOPMENT</div>

// Paper Trading  
<div class="bg-trenddojo-status-success">📊 PAPER TRADING</div>
```

---

*This theme maintains the sophisticated, professional trading platform aesthetic while ensuring excellent readability and visual hierarchy.*