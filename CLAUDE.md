# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Red is a TUI (Terminal User Interface) Redis client for inspecting and managing Redis databases, inspired by k9s. Built with Bun, React, and OpenTUI for terminal rendering.

## Development Commands

```sh
# Initialize repository (run once after clone)
./scripts/init.sh

# Run development mode with hot reload
bun run dev

# Build production binary
bun build --compile ./src/main.ts --outfile ./dist/bin/red

# Lint and format code
bunx @biomejs/biome check ./src --fix
```

## Architecture

### Tech Stack
- **Runtime**: Bun (TypeScript runtime)
- **UI Framework**: React with OpenTUI (`@opentui/react`) for terminal rendering
- **State Management**: TanStack Query (React Query) for async state and caching
- **Redis Client**: ioredis
- **Configuration**: cosmiconfig with Zod validation
- **CLI**: yargs

### Application Flow

1. **Entry Point** (`src/main.ts`):
   - Loads configuration from files, env vars, or CLI args (precedence order)
   - Initializes Redis connection via `initRedis()`
   - Renders React app using OpenTUI's `render()`

2. **Configuration System** (`src/config.ts`):
   - Multi-source config: CLI args → env vars → config file → defaults
   - Config file can be `.redrc`, `.redrc.json`, `.redrc.yaml`, etc.
   - Validated with Zod schema
   - Environment variables prefixed with `RED_`

3. **Redis Connection** (`src/redis.ts`):
   - Singleton Redis instance initialized at startup
   - Auto-retry every 1 second on connection failure
   - Access via `getRedis()` throughout the app

4. **Routing System** (`src/routing/`):
   - Custom client-side routing (not URL-based)
   - Route types: `Browser` (key browser view) and `EntryDetails` (individual key details)
   - Managed via React Context in `RouteProvider`
   - Routes track previous route for navigation history

5. **Component Architecture**:
   - **Pure components** (`src/components/pure/`): Stateless, reusable UI elements
   - **Functional components** (`src/components/functional/`): Stateful, business logic components
   - Main views: `Browser` (key navigation with groups) and `EntryDetails` (key value inspection)

6. **Browser View** (`src/components/functional/browser/browser.tsx`):
   - Core UI for navigating Redis keys hierarchically using delimiter-based grouping
   - Uses `RedisUtils` to scan keys and create groups (folders) from key prefixes
   - Features: search, auto-refresh, keyboard navigation, delete keys/groups
   - React Query for data fetching and caching
   - Maintains highlighted key state and scroll position

7. **Redis Key Utilities** (`src/util/redis-get-grouped-keys.ts`):
   - `RedisUtils` class handles key scanning and grouping logic
   - Groups keys by delimiter (default `:`) to create folder-like structure
   - Methods: `getDirectChildKeys()`, `getRecursiveChildKeys()`, `getDirectChildGroups()`
   - Uses Redis SCAN command (via scanStream) for efficient key iteration

### Context Providers

- **AppProvider** (`src/provider.tsx`): Root provider wrapping QueryClient, RouteProvider, RefreshProvider, and RegisteredKeybindsProvider
- **RefreshProvider**: Manages auto-refresh state for the browser view
- **RegisteredKeybindsProvider**: Tracks and displays active keybindings in the UI

### Key Patterns

- **OpenTUI Components**: Use JSX with `<box>`, `<text>`, `<input>`, `<scrollbox>` elements instead of HTML
- **JSX Import Source**: Set to `@opentui/react` in tsconfig.json
- **Keyboard Handling**: Use `useKeyboard()` hook from OpenTUI for all keyboard interactions
- **Queries**: Use React Query with queryKey format: `["redis", "keys", path, options]`
- **Redis Operations**: All Redis operations go through `getRedis()` singleton

## Configuration Schema

Key configuration options (see `src/config.ts` for full schema):
- `connectionString`: Redis connection URL (default: `redis://localhost:6379`)
- `delimiter`: Key delimiter for grouping (default: `:`)
- `path`: Initial path to open in browser
- `autoRefresh`: Enable auto-refresh (default: `false`)
- `refreshInterval`: Refresh interval in ms (default: `5000`, min: `1000`)

## Important Implementation Notes

- Always use `getConfig()` to access config after app initialization
- Always use `getRedis()` to access Redis client instance
- OpenTUI rendering is non-DOM - no HTML elements, use OpenTUI components
- Keyboard shortcuts are displayed dynamically using `useRegisterKeyBind()` hook
- Browser view uses delimiter-based grouping to create hierarchical navigation from flat Redis keys
