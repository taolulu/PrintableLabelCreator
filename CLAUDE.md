# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **label design and layout application** built with React and Vite. The app allows users to create, edit, and print custom labels on A4 paper with support for rich text editing, image uploads, and multi-page print previews.

## Core Architecture

### Main Components
- **App.tsx**: Main application component with state management for labels, print preview, and pagination
- **LabelEditor.tsx**: Rich text editor interface using TipTap for label content editing
- **Label.tsx**: Individual label rendering component
- **A4Page.tsx**: A4 paper layout component that arranges labels in a 2x6 grid per page
- **Toolbar.tsx**: Editor toolbar with formatting controls

### Key Features
- **Rich Text Editing**: Uses TipTap editor with custom font size styling
- **Image Management**: IndexedDB storage for image blobs with `idbImages.ts` utility
- **Print Preview**: Multi-page preview with pagination and quantity controls
- **Responsive Layout**: CSS grid-based responsive design that adapts to screen aspect ratio
- **State Persistence**: localStorage-based persistence with JSON export/import

### Data Flow
```
App (state) → LabelEditor (edit) → Label (display) → A4Page (print layout)
```

### Label Structure
```typescript
interface IndividualLabel {
  id: string;
  title: string; // HTML content
  imageUrl: string; // data URL or idb:// reference
  titleFontSize?: number;
}
```

## Essential Commands

### Development
```bash
# Start development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

### Build
```bash
# Build for production
npm run build
# or
yarn build
# or
pnpm build
```

### Development Server Configuration
- **Port**: 3000
- **Auto-open**: Enabled
- **Build Target**: ESNext
- **Output Directory**: `build/`

## Configuration Files

### Vite Configuration (`vite.config.ts`)
- React SWC plugin for optimized compilation
- Path aliases for all dependencies to prevent duplication
- Custom asset alias for Figma assets
- Base URL aliases (`@` → `src/`)

### Tailwind Configuration (`tailwind.config.ts`)
- Content paths for React components
- Typography plugin enabled
- Animation plugin enabled
- Extends default theme

### PostCSS Configuration (`postcss.config.js`)
- Tailwind CSS processing
- Autoprefixer for vendor prefixes

### Build & Dev Dependencies
- **Framework**: React 18.3.1 with TypeScript
- **UI Components**: Radix UI primitives and Tailwind CSS
- **Rich Text Editor**: TipTap (ProseMirror-based)
- **Styling**: Tailwind CSS with custom responsive utilities
- **Icons**: Lucide React
- **Animations**: Tailwind CSS Animate

## Key Directories

### `src/`
- **components/**: Reusable UI components (Radix UI styled with Tailwind)
- **components/ui/**: Component library following Radix UI patterns
- **lib/**: Utilities (IndexedDB image storage)
- **assets/**: Static assets

### `build/`
- Production build output directory

## Notable Implementation Details

### Print System
- Labels are arranged in 2 columns × 6 rows per A4 page (12 labels/page)
- Dynamic page calculation based on label count and print copies
- Fill labels added to complete partial pages
- Print preview shows pagination controls

### Responsive Design
- Aspect-ratio based layout switching (horizontal/vertical)
- Mobile-first touch optimizations
- CSS custom properties for responsive scaling

### Image Storage
- Images stored in IndexedDB with `idb://` URL scheme
- Automatic blob URL cleanup on component unmount
- Import/export converts between data URLs and indexedDB references

### State Management
- localStorage persistence with debounced saving (700ms)
- JSON export/import with image blob handling
- Global state hoisted to App component

## Performance Considerations

### Code Splitting
- Vite's built-in code splitting for production builds
- Dynamic imports supported but not currently used

### Image Optimization
- IndexedDB storage prevents memory leaks
- Blob URL revocation on component unmount
- Data URL conversion during import/export

### Responsive Performance
- CSS transforms for scaling previews
- Virtualized rendering via pagination
- Touch-action optimizations for mobile

## Browser Support

### Target Browsers
- Modern browsers with ESNext support
- Mobile-first responsive design
- Print media query support for A4 layout

### Polyfills
- None explicitly configured (relies on Vite defaults)