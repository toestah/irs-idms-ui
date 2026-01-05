# IRS IDMS UI - Developer Guide

## Quick Reference

| Action | Command | What Happens |
|--------|---------|--------------|
| Start dev server | `npm run dev` | Runs at http://localhost:5173 |
| Run linter | `npm run lint` | ESLint check (same as CI) |
| Type check | `npx tsc --noEmit` | TypeScript validation |
| Production build | `npm run build` | Creates `dist/` folder |
| Preview build | `npm run preview` | Serve production build locally |

**Live URL:** https://idms-frontend-5b63suhb3a-uc.a.run.app

---

## How the CI/CD Pipeline Works

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  You push   │────▶│  GitHub     │────▶│  Build &    │────▶│  Deploy to  │
│  to main    │     │  Actions    │     │  Push Image │     │  Cloud Run  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                          │
                          ▼
                    Lint + Type Check
                    (Fast feedback ~15s)
```

### What Triggers What

| Git Action | Pipeline Behavior |
|------------|-------------------|
| Push to `main` | Full pipeline: lint → type check → build → deploy |
| Push to other branch | Lint + type check only (no deploy) |
| Open PR to `main` | Lint + type check only (no deploy) |
| Merge PR to `main` | Full pipeline with deploy |

### Typical Workflow

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit locally
3. Push to GitHub: `git push origin feature/my-feature`
4. Open a PR → CI runs lint/type check
5. Get PR approved and merge → Auto-deploys to production

---

## Pair Programming Protocol

### Before Starting a Session

1. **Sync up:**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create a shared branch:**
   ```bash
   git checkout -b pair/session-YYYY-MM-DD
   ```

3. **Verify local environment works:**
   ```bash
   npm install
   npm run dev
   ```

### During the Session

**Driver (person typing):**
- Share screen
- Write code
- Commit frequently with clear messages

**Navigator (person reviewing):**
- Watch for bugs, typos, logic issues
- Think about architecture and edge cases
- Look up docs when needed

**Switch roles every 15-25 minutes.**

### Commit Convention

Use clear, descriptive commits:

```bash
# Good
git commit -m "Add document search filter by date range"
git commit -m "Fix sidebar not closing on mobile"
git commit -m "Update API endpoint for matter details"

# Bad
git commit -m "fix"
git commit -m "updates"
git commit -m "WIP"
```

### Ending a Session

1. **Make sure all changes are committed:**
   ```bash
   git status  # Should be clean
   ```

2. **Push the branch:**
   ```bash
   git push origin pair/session-YYYY-MM-DD
   ```

3. **If ready for production, create a PR to `main`**

4. **Document what was done and what's next** (in PR description or Slack)

---

## Pre-Push Checklist

Before pushing to `main` or creating a PR, run these locally:

```bash
# 1. Lint check (catches style issues)
npm run lint

# 2. Type check (catches type errors)
npx tsc --noEmit

# 3. Build test (catches build-time errors)
npm run build
```

If all three pass locally, CI will pass too.

---

## Project Structure

```
src/
├── components/          # Reusable UI components (Button, Card, etc.)
│   ├── ComponentName.tsx
│   ├── ComponentName.module.css
│   └── index.ts         # Exports all components
├── pages/               # Route-level components
│   ├── PageName.tsx
│   ├── PageName.module.css
│   └── index.ts
├── layouts/             # Page wrappers (MainLayout with header/sidebar)
├── App.tsx              # Route definitions
└── index.css            # Design system tokens (colors, spacing)
```

### Adding a New Page

1. Create `src/pages/NewPage.tsx` and `src/pages/NewPage.module.css`
2. Export from `src/pages/index.ts`
3. Add route in `src/App.tsx`

### Adding a New Component

1. Create `src/components/ComponentName.tsx` and `.module.css`
2. Export from `src/components/index.ts`
3. Use in pages: `import { ComponentName } from '../components'`

---

## Styling Guidelines

- **CSS Modules only** - no Tailwind, no inline styles
- Use design tokens from `src/index.css`:
  ```css
  .myButton {
    background: var(--color-primary-dark);
    padding: var(--spacing-md);
  }
  ```
- Match the Figma designs exactly

---

## Troubleshooting

### CI Failed on Lint

```bash
# Run locally to see errors
npm run lint

# Auto-fix what can be fixed
npm run lint -- --fix
```

### CI Failed on Type Check

```bash
# Run locally to see errors
npx tsc --noEmit
```

### Deployment Failed

1. Check GitHub Actions logs: https://github.com/toestah/irs-idms-ui/actions
2. Most common issues:
   - Docker build failed → check Dockerfile syntax
   - Cloud Run deploy failed → check GCP permissions

### Local Dev Server Won't Start

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## Environment Variables

For local development, create `.env.local` (gitignored):

```bash
VITE_API_URL=http://localhost:8000
VITE_APP_ENV=development
```

For production, these are set during the Docker build in CI.

---

## Useful Commands

```bash
# See what files changed
git status

# See actual changes
git diff

# Undo uncommitted changes to a file
git checkout -- path/to/file

# Undo last commit (keep changes)
git reset --soft HEAD~1

# See recent commits
git log --oneline -10

# See CI status
gh run list --limit 5
```

---

## Contact & Resources

- **Repo:** https://github.com/toestah/irs-idms-ui
- **Live Site:** https://idms-frontend-5b63suhb3a-uc.a.run.app
- **CI/CD:** https://github.com/toestah/irs-idms-ui/actions
- **Figma:** https://www.figma.com/design/bsYh8MXSoGgmSO8CNAFZQ9/IDMS-Screen-Flow

---

## Quick Start for New Session

```bash
# 1. Get latest
git checkout main && git pull

# 2. Create branch
git checkout -b feature/what-youre-working-on

# 3. Start dev server
npm run dev

# 4. Make changes, test in browser

# 5. Before committing, verify
npm run lint && npx tsc --noEmit

# 6. Commit and push
git add .
git commit -m "Descriptive message"
git push origin feature/what-youre-working-on

# 7. Create PR when ready
gh pr create --title "What this does" --body "Details..."
```
