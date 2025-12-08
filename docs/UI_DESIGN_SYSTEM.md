# Stem UI Design System
**Theme:** High-Contrast Editorial
**Status:** Active / Strict Adherence Required

This document defines the strict UI/UX standards for the Stem application. All future frontend development must adhere to these guidelines to maintain the established "High-Contrast Editorial" aesthetic.

---

## 1. Core Principles
- **Editorial Elegance:** The UI should feel like a high-end wedding magazine. Clean, spacious, and typographically driven.
- **High Contrast:** Sharp distinctions between text and background. Avoid low-contrast gray-on-gray.
- **Soft & Organic:** Use rounded corners (`rounded-3xl`) and soft shadows to counter the sharp typography.
- **Zero MUI:** We have fully migrated away from Material UI. **Do not introduce MUI components.**

---

## 2. Technology Stack
- **Styling:** Tailwind CSS (Utility-first).
- **Component Library:** Shadcn UI (Radix Primitives + Tailwind).
- **Icons:** `lucide-react` ONLY.
- **Fonts:** `next/font`
  - **Serif:** `Bodoni Moda` (Variable) - Used for Headings.
  - **Sans:** `Manrope` (Variable) - Used for UI elements, Body text, Data.

---

## 3. Typography System

### Headings (Serif)
Use the `font-serif` utility class.
- **Page Title:** `text-5xl md:text-6xl tracking-tight text-foreground`
- **Section Header:** `text-3xl text-foreground`
- **Card Title:** `text-xl` or `text-2xl`

### Body & UI (Sans)
Use the `font-sans` utility class (default).
- **Body:** `text-base text-foreground`
- **Muted Text:** `text-sm text-muted-foreground` (Use sparingly for labels)
- **Buttons/Tags:** `text-sm font-medium`

---

## 4. Visual Language

### Borders & Radius
- **Major Containers (Cards, Modals):** `rounded-3xl`
- **Inner Elements (Inputs, Inner Cards):** `rounded-xl`
- **Interactables (Buttons, Badges/Chips):** `rounded-full` (Strict rule)

### Shadows (Custom Config)
- **Base State:** `shadow-soft` (Subtle depth)
- **Hover State:** `shadow-medium` or `shadow-lifted`
- **Usage:** Apply to white cards on the `bg-canvas` background.

### Animations
- **Page Load:** `animate-fade-up` on the main container.
- **Hover:** `transition-all duration-300 hover:translate-y-[-2px]` on interactive cards.

---

## 5. Component Patterns

### Page Layout (Standard)
```tsx
<div className="w-full max-w-[container-size] mx-auto py-8 px-6 space-y-8 animate-fade-up">
  {/* Header */}
  <div className="flex flex-col md:flex-row justify-between gap-4">
    <div>
      <h1 className="font-serif text-5xl md:text-6xl text-foreground tracking-tight">Page Title</h1>
      <p className="text-xl text-muted-foreground mt-2 font-light">Subtitle</p>
    </div>
    {/* Actions */}
    <div className="flex gap-2">
      <Button className="rounded-full">Action</Button>
    </div>
  </div>

  {/* Content */}
  <div className="grid ...">
    {/* ... */}
  </div>
</div>
```

### Cards (Standard)
```tsx
<Card className="bg-white rounded-3xl border border-border shadow-soft">
  <CardHeader className="p-6 border-b border-border/70">
    <CardTitle className="font-serif text-2xl">Title</CardTitle>
  </CardHeader>
  <CardContent className="p-6">
    {/* Content */}
  </CardContent>
</Card>
```

### Interactive Cards (Hoverable)
Used for items like Vendors or Timeline Events.
```tsx
<Card className="rounded-xl shadow-soft transition-all duration-300 hover:shadow-medium hover:translate-y-[-2px] cursor-pointer">
   {/* Content */}
</Card>
```

### Empty States
Must be consistent across all tools.
- **Container:** Dashed border, transparent background.
- **Icon:** Large (h-8 w-8), inside a circle `bg-primary/10`.
- **Action:** Clear Call-to-Action button.

```tsx
<Card className="text-center p-8 border-dashed border-muted-foreground/30 shadow-none bg-canvas">
  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
    <IconName className="h-8 w-8 text-primary" />
  </div>
  <CardTitle className="font-serif text-2xl mb-2">No items yet</CardTitle>
  <p className="text-muted-foreground mb-6">Helper text here.</p>
  <Button className="rounded-full shadow-soft">Action</Button>
</Card>
```

---

## 6. Iconography
- **Library:** `lucide-react`
- **Sizing:** Standard UI icons are `h-4 w-4`. Feature icons are `h-6 w-6` or `h-8 w-8`.
- **Color:** Use Tailwind text colors (e.g., `text-primary`, `text-muted-foreground`).

---

## 7. Forbidden Patterns (Anti-Patterns)
1.  **NO Material UI (MUI):** Never import `@mui/material` or `@mui/icons-material`.
2.  **No Square Buttons:** Buttons must be `rounded-full`.
3.  **No Sharp Cards:** Main content cards must be `rounded-3xl`.
4.  **No Default Shadows:** Avoid default Tailwind `shadow-md` unless matched to the custom theme. Use `shadow-soft`.
