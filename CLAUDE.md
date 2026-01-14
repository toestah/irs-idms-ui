# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**IRS IDMS (Intelligent Document Management System)** - React UI for managing tax court documents. Helps attorneys search case files, manage legal matters, and verify AI-extracted data from documents.

## Commands

```bash
npm run dev      # Start dev server at localhost:5173
npm run build    # TypeScript check + Vite production build
npm run lint     # ESLint check
npm run preview  # Preview production build locally
```

## Architecture

### Tech Stack
- React 19 + TypeScript + Vite (with SWC)
- React Router v7 for routing
- CSS Modules for component styling (not Tailwind)
- Lucide React for icons

### Code Organization

```
src/
├── config/env.ts          # Environment variables and feature flags
├── services/api/          # API client and endpoint modules
│   ├── client.ts          # ApiClient class with auth, timeout, error handling
│   ├── search.ts          # Search API (Vertex AI Search integration)
│   ├── cases.ts           # Case/matter CRUD operations
│   ├── documents.ts       # Document operations
│   └── types.ts           # Shared API types
├── hooks/                 # Custom React hooks
│   ├── useSearch.ts       # Search with loading/error states
│   └── useCase.ts         # Case data fetching
├── components/            # Reusable UI components
├── pages/                 # Route-level page components
└── layouts/MainLayout.tsx # App shell (header + sidebar + content)
```

### API Integration

Two backend services configured via environment variables:
- `VITE_API_URL` / `VITE_API_BASE_URL` - Main backend (Cloud Run)
- `VITE_ADK_URL` / `VITE_ADK_BASE_URL` - ADK service for AI features

API client (`src/services/api/client.ts`) handles:
- Bearer token auth from localStorage (`auth_token`)
- Request timeout with AbortController
- Debug logging when `VITE_DEBUG_MODE=true`

Feature flags in `src/config/env.ts`:
- `VITE_ENABLE_AI_ANSWERS` - AI-generated answer summaries
- `VITE_ENABLE_DOCUMENT_CHAT` - Document chat feature
- `VITE_ENABLE_SSE_STREAMING` - Server-sent events for streaming

### Styling

- CSS Modules: each component has a `.module.css` file
- Design tokens defined as CSS custom properties in `src/index.css`
- Use `var(--color-primary-dark)`, `var(--spacing-md)`, etc.

Key colors:
- Primary: `#1e3a5f` (dark), `#2c4f75`, `#3d5a80` (light/hover)
- Confidence: green (≥95%), yellow (80-94%), red (<80%)

### Routing

Routes defined in `src/App.tsx`, all wrapped by `MainLayout`:
- `/` - Dashboard with search
- `/search?q=` - Search results
- `/matters/:id` - Matter detail
- `/document-queue` - Document verification queue
- `/verification/:id` - HITL document verification

### Adding New Features

**New Page:**
1. Create `src/pages/NewPage.tsx` + `src/pages/NewPage.module.css`
2. Export from `src/pages/index.ts`
3. Add route in `src/App.tsx` inside MainLayout

**New Component:**
1. Create `src/components/Name.tsx` + `src/components/Name.module.css`
2. Export from `src/components/index.ts`

**New API Endpoint:**
1. Add function in appropriate `src/services/api/*.ts` module
2. Export from `src/services/api/index.ts`
3. Optionally create a hook in `src/hooks/` for state management

## ESLint Configuration

- Unused variables must be prefixed with `_` to be ignored
- React Hooks rules enforced
- React Refresh rules for HMR compatibility

## Figma Integration

The UI is built from Figma mockups. Claude Code can access designs directly via the Figma MCP server.

**Design File:** https://www.figma.com/design/bsYh8MXSoGgmSO8CNAFZQ9/IDMS-Screen-Flow

### Screen Mapping

| Figma Screen | Node ID | Implementation |
|--------------|---------|----------------|
| 1.0 Dashboard | `34:3404` | `src/pages/Dashboard.tsx` |
| 2.0 Search Results | `34:3742` | `src/pages/SearchResults.tsx` |
| 3.0 Results Detail | `34:4313` | `src/pages/MatterDetail.tsx` |
| 4.0 Document List | `160:15757` | `src/pages/DocumentQueue.tsx` |
| 5.0 HITL Verification | `169:16552` | `src/pages/DocumentVerification.tsx` |
| 5.1 HITL Edit | `172:19076` | `src/pages/DocumentVerification.tsx` (edit mode) |

### MCP Server Setup

The project includes `.mcp.json` for Figma MCP configuration. Each developer needs to:

1. Generate a Figma Personal Access Token (Account Settings → Personal Access Tokens)
2. Set `FIGMA_ACCESS_TOKEN` environment variable in your shell profile
3. Restart Claude Code

See `docs/FIGMA_SETUP.md` for detailed instructions.
