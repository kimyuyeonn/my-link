# My Link Project Overview

"My Link" is a link management application designed to centralize and manage your links. The project is primarily composed of a Next.js application located in the `my-profile` directory.

## Core Technologies
- **Framework:** Next.js 16 (App Router)
- **Library:** React 19
- **Styling:** Tailwind CSS 4, PostCSS
- **Language:** TypeScript
- **Environment:** Node.js

## Project Structure
- `/my-profile`: The main Next.js application directory.
  - `/app`: Contains the application routes, components, and global styles (Next.js App Router).
  - `/public`: Static assets like images and SVG files.
  - `package.json`: Project dependencies and scripts.
  - `tsconfig.json`: TypeScript configuration.
  - `next.config.ts`: Next.js configuration.
  - `eslint.config.mjs`: ESLint configuration for code quality.

## Building and Running (within `my-profile`)

The following commands should be executed from within the `my-profile` directory:

- **Development Server:** `npm run dev` - Starts the development server at `http://localhost:3000`.
- **Production Build:** `npm run build` - Creates an optimized production build.
- **Start Production Server:** `npm start` - Starts the application in production mode.
- **Linting:** `npm run lint` - Runs ESLint to check for code quality issues.

## Development Conventions

- **Next.js App Router:** The project uses the Next.js App Router pattern for routing and layout management.
- **TypeScript:** Strict typing is encouraged across the codebase.
- **Tailwind CSS:** Utility-first CSS framework for styling components.
- **Component Placement:** React components should generally be placed within the `app` directory or a dedicated `components` directory (if one is created).
- **ESLint:** Adhere to the configured linting rules to maintain code consistency.
- **Metadata:** Use the `metadata` export in `layout.tsx` or `page.tsx` for SEO and document head management.
