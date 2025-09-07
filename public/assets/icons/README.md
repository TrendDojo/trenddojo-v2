# TrendDojo Icons & Favicons

## Files Created

### Main Icon
- `td-icon.svg` - Main TrendDojo house icon (85x81)
- Source for all favicon variants
- Contains white circle background and purple gradient house

### Favicon Pack
- `favicons/favicon-16x16.svg` - Small favicon (16x16)
- `favicons/favicon-32x32.svg` - Standard favicon (32x32)  
- `favicons/apple-touch-icon.svg` - Apple touch icon (180x180)

### Logo Files
- `../logos/td-icon.svg` - Circular house icon only
- `../logos/td-logo-text.svg` - Text-only TrendDojo wordmark
- `../logos/td-logo.svg` - Icon + text combination
- `../logos/td-logo-R.svg` - Icon + text + registered trademark (®) symbol

## Usage

### Logo Selection Guide
- **td-icon.svg**: Use for favicons, app icons, and standalone branding
- **td-logo-text.svg**: Use for text-heavy designs where icon would be too small
- **td-logo.svg**: Primary logo for headers, business cards, general branding
- **td-logo-R.svg**: Use in formal contexts requiring trademark indication

### In HTML Head
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/svg+xml" sizes="16x16" href="/assets/icons/favicons/favicon-16x16.svg">
<link rel="icon" type="image/svg+xml" sizes="32x32" href="/assets/icons/favicons/favicon-32x32.svg">
<link rel="apple-touch-icon" href="/assets/icons/favicons/apple-touch-icon.svg">
<link rel="manifest" href="/manifest.json">
```

### Web App Manifest
- `manifest.json` - PWA manifest for mobile app installation
- Uses TrendDojo brand colors and icon

## Icon Design
- **Professional house icon** representing trading/business management
- **Brand colors**: Purple gradient (#7a4ca2 → #6d4d9b → #474f84)  
- **Scalable SVG** format for all sizes
- **Multiple variants** for different use cases

## Brand Colors Used
- Background: #0f172a (Deep navy)
- Theme: #7c3aed (Purple accent)
- Icon gradient: Purple to dark blue

*Updated: 2025-09-07 - Added new logo variants from tmp directory*