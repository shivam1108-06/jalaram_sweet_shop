# Jalaram Sweet Shop - Design Palette

## Color Scheme (Flipkart-style)

| Role | Color | Hex | Tailwind Config Key |
|------|-------|-----|---------------------|
| Primary | Blue | `#2874F0` | `primary` |
| Secondary | Dark Blue | `#172337` | `secondary` |
| Accent | Yellow | `#FFE500` | `accent` |
| Background | White | `#FFFFFF` | `background` |
| Text | Dark Gray | `#212121` | `text-primary` |
| Text Muted | Gray | `#878787` | `text-muted` |
| Success | Green | `#388E3C` | `success` |
| Error | Red | `#D32F2F` | `error` |
| Border | Light Gray | `#E0E0E0` | `border` |

## Tailwind Config

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#2874F0',
        secondary: '#172337',
        accent: '#FFE500',
        success: '#388E3C',
        error: '#D32F2F',
        border: '#E0E0E0',
        'text-primary': '#212121',
        'text-muted': '#878787',
      }
    }
  }
}
```

## Usage Examples

```jsx
// Primary button
<button className="bg-primary text-white hover:bg-secondary">Buy Now</button>

// Accent highlight
<span className="bg-accent text-secondary px-2 py-1">Sale</span>

// Card
<div className="bg-white border border-border rounded-lg shadow-sm">

// Text
<h1 className="text-text-primary">Title</h1>
<p className="text-text-muted">Description</p>
```
