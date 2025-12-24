# Claude Code Context

This file provides context for Claude (and other AI assistants) working on this codebase.

## Project Overview

**IRS IDMS (Intelligent Document Management System)** is a React-based UI for managing tax court documents. The application helps attorneys search case files, manage legal matters, and verify AI-extracted data from documents.

## Architecture Decisions

### Styling Approach
- **CSS Modules** are used for component-scoped styling (not Tailwind)
- Each component has a corresponding `.module.css` file
- Design tokens are defined as CSS custom properties in `src/index.css`
- The design system follows the Figma designs exactly

### Routing
- Uses **React Router v6** with nested routes
- `MainLayout` wraps all pages and provides header + sidebar
- Route params like `:id` are used for detail pages

### State Management
- Currently uses **local component state** only
- No global state management library (Redux, Zustand, etc.) is implemented
- Data is mocked inline in components - no API integration yet

### Component Organization
- **Atomic design principles**: small reusable components in `components/`
- **Page components** in `pages/` correspond to routes
- **Layouts** wrap pages with common UI (header, sidebar)

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/index.css` | Design system tokens (colors, spacing, typography) |
| `src/App.tsx` | Route definitions |
| `src/layouts/MainLayout.tsx` | Page wrapper with header + sidebar |
| `src/components/index.ts` | All shared component exports |
| `src/pages/index.ts` | All page component exports |

## Common Tasks

### Adding a New Page
1. Create `src/pages/NewPage.tsx` and `src/pages/NewPage.module.css`
2. Export from `src/pages/index.ts`
3. Add route in `src/App.tsx` inside the `<Route path="/" element={<MainLayout />}>` block

### Adding a New Component
1. Create `src/components/ComponentName.tsx` and `src/components/ComponentName.module.css`
2. Export from `src/components/index.ts`
3. Import and use in pages as needed

### Styling Guidelines
- Use CSS custom properties from `index.css` (e.g., `var(--color-primary-dark)`)
- Use CSS Modules syntax: `className={styles.myClass}`
- Follow existing patterns for hover states, transitions, etc.

## Design System Reference

### Color Palette
```
Primary Dark:    #1e3a5f  (header, primary buttons, active nav)
Primary:         #2c4f75  (search bars, secondary elements)
Primary Light:   #3d5a80  (hover states)
Background:      #f9fafb  (main content area)
White:           #ffffff  (cards, sidebar)
Border:          #e5e7eb  (standard borders)
```

### Confidence Indicator Colors
```
High (≥95%):    #10b981 (green)
Medium (80-94%): #f59e0b (yellow/orange)
Low (<80%):     #fb2c36 (red)
```

### Status Badge Colors
- Confirmed/Verified: Green (`success`)
- Scheduled/Info: Blue (`info`)
- Pending/Upcoming: Yellow (`warning`)
- Rejected: Red (`danger`)

## Figma Integration

The UI was built using the Figma MCP server. Original designs are at:
`https://www.figma.com/design/bsYh8MXSoGgmSO8CNAFZQ9/IDMS-Screen-Flow`

Node IDs for main screens:
- Dashboard: `34:3404`
- Search Results: `34:3742`
- Matter Detail: `34:4313`
- Document Queue: `160:15757`
- HITL Verification: `169:16552`
- HITL Edit: `172:19076`

## Future Work / TODOs

- [ ] Connect to backend API (currently all data is mocked)
- [ ] Add authentication/login flow
- [ ] Implement actual search functionality
- [ ] Add document upload feature
- [ ] Implement real document preview (PDF viewer)
- [ ] Add form validation for HITL editing
- [ ] Add loading states and error handling
- [ ] Add unit tests
- [ ] Add E2E tests

## Dependencies

Key dependencies and their purposes:
- `react-router-dom` - Client-side routing
- `lucide-react` - Icon library (consistent with Figma designs)

## Running the Project

```bash
npm install      # Install dependencies
npm run dev      # Start dev server at localhost:5173
npm run build    # Production build
npm run preview  # Preview production build
```
