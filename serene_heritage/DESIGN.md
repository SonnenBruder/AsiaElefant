---
name: Serene Heritage
colors:
  surface: '#131411'
  surface-dim: '#131411'
  surface-bright: '#393936'
  surface-container-lowest: '#0e0e0c'
  surface-container-low: '#1b1c19'
  surface-container: '#1f201d'
  surface-container-high: '#2a2a27'
  surface-container-highest: '#343532'
  on-surface: '#e4e2dd'
  on-surface-variant: '#c4c7c7'
  inverse-surface: '#e4e2dd'
  inverse-on-surface: '#30312e'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c8c6c5'
  primary: '#c8c6c5'
  on-primary: '#313030'
  primary-container: '#121212'
  on-primary-container: '#7e7d7d'
  inverse-primary: '#5f5e5e'
  secondary: '#e9c176'
  on-secondary: '#412d00'
  secondary-container: '#604403'
  on-secondary-container: '#dab36a'
  tertiary: '#e7c08a'
  on-tertiary: '#432c03'
  tertiary-container: '#1c1000'
  on-tertiary-container: '#987848'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#ffddb0'
  tertiary-fixed-dim: '#e7c08a'
  on-tertiary-fixed: '#281800'
  on-tertiary-fixed-variant: '#5c4217'
  background: '#131411'
  on-background: '#e4e2dd'
  surface-variant: '#343532'
typography:
  display-lg:
    fontFamily: Newsreader
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Newsreader
    fontSize: 36px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  section-gap: 80px
  container-padding: 24px
  gutter: 16px
  grid-columns: '12'
  max-width: 1200px
---

## Brand & Style

The brand identity for the design system centers on the intersection of high-end Asian hospitality and modern European minimalism. It is designed to evoke a sense of quiet luxury, precision, and warmth. The target audience includes local gastronomes seeking an authentic yet elevated dining experience.

The visual style is **Minimalist-Modern** with a **Tactile** edge. It prioritizes heavy whitespace (or "negative space"), high-quality imagery, and subtle textures that mimic handmade paper or dark slate. The "Elefant" motif is integrated not through literal illustration, but through structural strength, rhythmic spacing, and small, sophisticated graphic accents that hint at heritage without feeling dated.

## Colors

The palette is anchored by **Deep Charcoal**, which serves as the canvas for the entire experience, providing a sophisticated, low-light "dinner mood." **Warm Gold/Saffron** is used sparingly as an accent color for interactive elements, highlights, and primary calls to action, symbolizing quality and spice. 

**Soft Off-White** is reserved for typography and high-contrast containers to ensure maximum readability against the dark backgrounds. A secondary **Muted Bronze** is used for borders and secondary UI elements to provide depth without breaking the minimalist aesthetic.

## Typography

This design system uses a dual-type approach to balance tradition and utility. 

**Newsreader** provides a sophisticated, editorial feel for headlines and menu categories. Its classic serif terminals evoke the "authentic" and "literary" aspects of high-quality dining.

**Plus Jakarta Sans** is used for all functional UI elements, body copy, and price points. Its modern, geometric construction ensures clarity and a contemporary "bistro" feel. 

- Use **Display** sizes for hero sections and major menu categories.
- Use **Label-MD** with wide letter-spacing for sub-headings and descriptors like "Vegan" or "Spicy."
- Ensure body text maintains a high line-height to allow the layout to "breathe."

## Layout & Spacing

The layout follows a **Fixed Grid** model for desktop to maintain an elegant, centered composition, while transitioning to a fluid layout for mobile devices. 

- **Desktop:** 12-column grid with a 1200px max-width.
- **Mobile:** Single column with 24px side margins.
- **Rhythm:** Use an 8px base unit. Section spacing should be generous (80px+) to emphasize the minimalist brand personality.

Menu items should be organized in a modular grid where images and text alternate or stack to create a rhythmic, gallery-like flow.

## Elevation & Depth

Depth in this design system is achieved through **Tonal Layering** and **Low-Contrast Outlines** rather than heavy shadows.

- **Surface 0 (Background):** Deep Charcoal.
- **Surface 1 (Cards/Modals):** A slightly lighter charcoal (#1E1E1E).
- **Accents:** Use 1px "Hairline" borders in Muted Bronze (#8C6D3E at 30% opacity) to define cards and sections. 
- **Active States:** Subtle inner-glows or a thin Saffron border highlight interactive elements.
- **Photography:** Food images should have high-contrast lighting to create natural depth within the UI.

## Shapes

The shape language is **Soft** but structured. A base radius of 0.25rem (4px) is applied to buttons and small UI elements to provide a touch of approachability without losing the precision of a high-end establishment. 

Large containers and food photography cards should use the `rounded-lg` (8px) setting. Avoid fully circular "pill" shapes for buttons to maintain the architectural, minimalist feel; instead, use slightly rounded rectangles.

## Components

### Buttons
- **Primary:** Saffron background with charcoal text. No shadow, 4px corner radius.
- **Secondary:** Transparent with a 1px Saffron border.
- **Tertiary:** Text-only with a Saffron underline on hover.

### Menu Cards
- Use a modular vertical stack: Image (top), Title (Newsreader), Description (Jakarta Sans), Price (Saffron color).
- Include a subtle 1px divider between items in a list view.

### Chips & Tags
- Used for dietary restrictions (e.g., "GF", "Spicy").
- Small, uppercase text with a low-opacity Gold background.

### Navigation
- Top-aligned, fixed. Use a semi-transparent Charcoal background with a backdrop-blur.
- Links are in Jakarta Sans, transitioning to Saffron on hover.

### Input Fields
- Dark backgrounds with a bottom-border only (minimalist style). 
- Focus state transforms the bottom border into solid Gold.

### Elephant Motifs
- Used as background watermarks or small decorative "end-marks" after long sections of text. Always in a low-contrast charcoal-on-charcoal tone.