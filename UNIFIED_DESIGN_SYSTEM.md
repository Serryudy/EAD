# 🎨 Unified Design System for Appointment Booking

## Color Palette

### Primary Colors
- **Deep Blue Dark**: `#0A2C5E` - Main headings, primary backgrounds
- **Deep Blue Medium**: `#1B4C8C` - Gradient end, secondary backgrounds
- **Deep Blue Card**: `#042A5C` - Card backgrounds
- **Bright Blue**: `#2F8BFF` - Borders, accents, CTAs

### Secondary Colors
- **Light Blue**: `#93c5fd` - Secondary text, labels
- **Pale Blue**: `#e0e7ff` - Tertiary text
- **Green Success**: `#10b981` - Success states, prices
- **Amber Warning**: `#f59e0b` - Warnings, special notes

### Neutral Colors
- **Slate 600**: `#64748b` - Body text
- **Slate 900**: `#0f172a` - Alternative dark text
- **White**: `#ffffff` - Text on dark backgrounds

## Typography

### Font Family
- **Primary**: `'Poppins', sans-serif`
- Always use Poppins for consistency across all text elements

### Font Sizes
- **Hero Heading**: `2rem` (32px) - Step titles
- **Section Heading**: `1.25rem` (20px) - Card headers
- **Body Large**: `1rem` (16px) - Descriptions
- **Body**: `0.875rem` (14px) - Details, labels
- **Small**: `0.75rem` (12px) - Badges, hints

### Font Weights
- **Bold**: `700` - Main headings
- **Semi-bold**: `600` - Subheadings, card titles
- **Medium**: `500` - Labels, badges
- **Normal**: `400` - Body text

## Component Styles

### Cards (Selected State)
```css
background: linear-gradient(135deg, #0A2C5E 0%, #1B4C8C 100%)
border: 2px solid #2F8BFF
border-radius: 12px
padding: 1.5rem
box-shadow: 0 4px 12px rgba(10, 44, 94, 0.2)
```

### Cards (Unselected State)
```css
background: #042A5C
border: 1px solid rgba(47, 139, 255, 0.3)
border-radius: 12px
padding: 1.5rem
```

### Cards (Hover - Unselected)
```css
border: 1px solid #2F8BFF
transform: translateY(-4px)
box-shadow: 0 8px 16px rgba(47, 139, 255, 0.2)
transition: all 0.3s ease
```

### Icon Containers
```css
width: 56px
height: 56px
border-radius: 12px
background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)
display: flex
align-items: center
justify-content: center
box-shadow: 0 4px 12px rgba(47, 139, 255, 0.3)
```

### Selection Checkmark
```css
width: 24px
height: 24px
border-radius: 50%
background: #10b981
position: absolute
top: 1rem
right: 1rem
box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4)
```

### Badges
```css
padding: 0.25rem 0.75rem
background: rgba(47, 139, 255, 0.2)
border: 1px solid rgba(47, 139, 255, 0.4)
border-radius: 9999px
font-size: 0.75rem
font-weight: 500
color: #93c5fd
```

### Summary Cards
```css
background: linear-gradient(135deg, #0A2C5E 0%, #1B4C8C 100%)
border-radius: 12px
padding: 1.5rem
border: 1px solid #2F8BFF
box-shadow: 0 4px 12px rgba(10, 44, 94, 0.2)
```

### Buttons (Primary)
```css
background: linear-gradient(135deg, #0A2C5E 0%, #1B4C8C 100%)
color: white
padding: 1rem 2rem
border-radius: 8px
font-weight: 600
font-family: 'Poppins', sans-serif
border: none
```

### Buttons (Secondary)
```css
background: white
color: #0A2C5E
padding: 1rem 2rem
border-radius: 8px
border: 2px solid #2F8BFF
font-weight: 600
font-family: 'Poppins', sans-serif
```

## Layout Patterns

### Step Header
```tsx
<div style={{ marginBottom: '2rem', textAlign: 'center' }}>
  <h2 style={{
    fontSize: '2rem',
    fontWeight: '700',
    color: '#0A2C5E',
    marginBottom: '0.5rem',
    fontFamily: 'Poppins, sans-serif'
  }}>
    Step Title
  </h2>
  <p style={{
    color: '#64748b',
    fontSize: '1rem',
    fontFamily: 'Poppins, sans-serif'
  }}>
    Step description
  </p>
</div>
```

### Grid Layout
```tsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: '1.5rem',
  marginBottom: '2rem'
}}>
  {/* Cards */}
</div>
```

### Detail Row
```tsx
<div style={{
  display: 'flex',
  alignItems: 'flex-start',
  gap: '1rem',
  padding: '1rem',
  background: 'rgba(47, 139, 255, 0.1)',
  borderRadius: '8px',
  border: '1px solid rgba(47, 139, 255, 0.2)'
}}>
  {/* Icon + Content */}
</div>
```

## Icon Colors

### Service Icons
- AC/Cooling: Purple gradient `#a855f7 → #9333ea`
- Services: Blue gradient `#3b82f6 → #2563eb`
- Vehicles: Green gradient `#10b981 → #059669`
- Time: Purple gradient `#a855f7 → #9333ea`
- Special: Amber gradient `#f59e0b → #d97706`

### Status Colors
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Amber)
- Info: `#2F8BFF` (Blue)
- Error: `#ef4444` (Red)

## Spacing Scale

- **xs**: `0.25rem` (4px)
- **sm**: `0.5rem` (8px)
- **md**: `1rem` (16px)
- **lg**: `1.5rem` (24px)
- **xl**: `2rem` (32px)
- **2xl**: `3rem` (48px)

## Border Radius Scale

- **sm**: `8px` - Buttons, small cards
- **md**: `12px` - Main cards, containers
- **lg**: `16px` - Large containers
- **full**: `9999px` - Badges, pills

## Shadows

### Elevated
```css
box-shadow: 0 4px 12px rgba(10, 44, 94, 0.2)
```

### Hover
```css
box-shadow: 0 8px 16px rgba(47, 139, 255, 0.2)
```

### Icon Glow
```css
box-shadow: 0 4px 12px rgba(47, 139, 255, 0.3)
```

### Success Glow
```css
box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4)
```

## Transitions

### Standard
```css
transition: all 0.3s ease
```

### Quick
```css
transition: all 0.2s ease
```

### Slow
```css
transition: all 0.5s ease
```

## Implementation Checklist

✅ **ServiceSelectionStep** - Updated with unified design
⬜ **VehicleSelectionStep** - Needs update
⬜ **DateSelectionStep** - Needs update
⬜ **TimeSlotSelectionStep** - Needs update (partially done)
✅ **ReviewConfirmStep** - Already uses unified design
✅ **ConfirmationStep** - Already uses unified design

## Notes

- All inline styles to avoid Tailwind conflicts
- Consistent use of Poppins font
- Deep blue theme throughout
- Hover states on all interactive elements
- Selection indicators with green checkmarks
- Smooth transitions on all state changes
- Icons from lucide-react with consistent sizing
- Responsive grid layouts
- Accessible color contrasts
