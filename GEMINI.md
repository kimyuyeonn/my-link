# MyLink (마이링크) - Project Guidelines

## Project Overview
**MyLink** is a multi-link profile service (similar to Linktree) that allows users to aggregate multiple web links into a single, shareable profile page.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4, shadcn/ui, Radix UI
- **Backend/Auth:** Firebase (Authentication & Firestore)

## Core Commands
- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application.
- `npm run lint`: Runs ESLint.
- `npm run format`: Formats code.

## Development Guidelines
1. Use `npx shadcn@latest add [component]` for UI components.
2. Prioritize mobile-first design.
3. Only Google Social Login is supported.
4. Use `cn` utility for Tailwind class merging.

## Agent Interaction Conventions
- **File Referencing:** Always refer to files using the `@` prefix (e.g., `@app/page.tsx`, `@docs/PRD.md`).
