# IRS IDMS - Intelligent Document Management System

A React-based user interface for the IRS Intelligent Document Management System (IDMS). This application provides attorneys and legal professionals with tools to search case files, manage documents, and verify extracted data using AI-powered document processing.

## Features

- **Conversational Search**: Natural language search across case files, documents, and emails
- **Matter Management**: View and manage legal matters with associated documents, teams, and timelines
- **Document Queue**: Track and process documents pending verification
- **Human-in-the-Loop (HITL) Verification**: Review and correct AI-extracted data from tax court documents
- **Document Preview**: Side-by-side view of extracted data and original documents

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Lucide React** - Icon library
- **CSS Modules** - Scoped component styling

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The development server runs at `http://localhost:5173/`

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Badge.tsx         # Status badges, confidence indicators
│   ├── Button.tsx        # Button variants (primary, secondary, etc.)
│   ├── Card.tsx          # Card container components
│   ├── Header.tsx        # Top navigation with logo, search, user info
│   ├── Sidebar.tsx       # Left navigation menu
│   ├── Table.tsx         # Data table components
│   └── index.ts          # Component exports
│
├── layouts/
│   └── MainLayout.tsx    # App shell with header + sidebar + content area
│
├── pages/                # Route-level page components
│   ├── Dashboard.tsx     # Home page with search interface
│   ├── SearchResults.tsx # Search results with matter cards
│   ├── MatterDetail.tsx  # Individual matter view
│   ├── DocumentQueue.tsx # Document verification queue table
│   ├── DocumentVerification.tsx  # HITL verification interface
│   └── index.ts          # Page exports
│
├── App.tsx               # Root component with routing
├── App.css               # Global app styles
├── index.css             # Design system variables and base styles
└── main.tsx              # Application entry point
```

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Dashboard | Home page with conversational search |
| `/search` | SearchResults | Search results (accepts `?q=` query param) |
| `/matters/:id` | MatterDetail | Individual matter details |
| `/document-queue` | DocumentQueue | Document verification queue |
| `/verification/:id` | DocumentVerification | HITL document verification |

## Design System

The application uses CSS custom properties for consistent theming. Key variables are defined in `src/index.css`:

### Colors

```css
--color-primary-dark: #1e3a5f;    /* Primary actions, header */
--color-primary: #2c4f75;          /* Secondary elements */
--color-primary-light: #3d5a80;    /* Hover states */
--color-bg-primary: #f9fafb;       /* Main background */
--color-bg-secondary: #e8f0f7;     /* Highlighted sections */
```

### Status Colors

```css
--color-success: #10b981;          /* Verified, high confidence */
--color-warning: #f59e0b;          /* Pending, medium confidence */
--color-danger: #fb2c36;           /* Rejected, low confidence */
--color-info: #3b82f6;             /* Informational */
```

### Spacing & Layout

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--header-height: 75px;
--sidebar-width: 256px;
```

## Components

### Badge
Status and confidence indicators with variants: `success`, `warning`, `danger`, `info`.

```tsx
<Badge variant="success">Verified</Badge>
<ConfidenceBadge value={95} />
<StatusBadge status="confirmed" />
```

### Button
Multiple variants and sizes for different contexts.

```tsx
<Button variant="primary" size="lg" icon={<Check />}>
  Approve
</Button>
<Button variant="outline">Cancel</Button>
<IconButton icon={<Edit />} aria-label="Edit" />
```

### Card
Container component for content sections.

```tsx
<Card padding="lg" variant="bordered">
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Actions</CardFooter>
</Card>
```

### Table
Data table with sortable headers and clickable rows.

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableCell header>Name</TableCell>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow onClick={() => {}}>
      <TableCell>Value</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## Figma Design Reference

The UI was built from Figma designs at:
`https://www.figma.com/design/bsYh8MXSoGgmSO8CNAFZQ9/IDMS-Screen-Flow`

### Screens Implemented

1. **1.0 Dashboard** - Search-focused landing page
2. **2.0 Search Results** - Matter search results with cards
3. **3.0 Results Detail** - Matter detail view
4. **4.0 Document List** - Document verification queue
5. **5.0 HITL Verification** - Document verification view
6. **5.1 HITL Edit** - Document verification with editing

## Development

### Adding New Pages

1. Create component in `src/pages/`
2. Add CSS module for styling
3. Export from `src/pages/index.ts`
4. Add route in `src/App.tsx`

### Adding New Components

1. Create component in `src/components/`
2. Add CSS module for styling
3. Export from `src/components/index.ts`

### Code Style

- Use TypeScript for all new code
- Use CSS Modules for component styling
- Follow existing naming conventions
- Keep components focused and reusable

## License

Internal IRS project - not for public distribution.
