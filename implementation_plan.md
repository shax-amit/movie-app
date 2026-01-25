# Plan: HW2 Compliance Fixes

The project currently uses Redux for state management, which is great but leaves the specific "Context API" requirement from HW2 unfulfilled in the active codebase. Additionally, the README is outdated.

## Proposed Changes

### [NEW] [ThemeContext.jsx](file:///c:/Users/user/Desktop/לימודים/שנה ג סמסטר א/שיטות מארג/HW1/src/context/ThemeContext.jsx)
Create a new `ThemeContext` to manage the application's light/dark mode globally.
- Store `theme` state ('light' or 'dark').
- Provide a `toggleTheme` function.
- Persist selection in `localStorage`.

### [MODIFY] [App.jsx](file:///c:/Users/user/Desktop/לימודים/שנה ג סמסטר א/שיטות מארג/HW1/src/App.jsx)
- Wrap the main application components with `ThemeProvider`.

### [MODIFY] [Navbar.jsx](file:///c:/Users/user/Desktop/לימודים/שנה ג סמסטר א/שיטות מארג/HW1/src/components/Navbar.jsx)
- Switch from local `useLocalStorage` for theme to using the global `ThemeContext` via `useTheme` hook.

### [MODIFY] [README.md](file:///c:/Users/user/Desktop/לימודים/שנה ג סמסטר א/שיטות מארג/HW1/README.md)
- Update the **Routing** section to accurately describe the pages and APIs (TMDB instead of Ghibli).
- Update the **Global State** section to correctly explain the use of `ThemeContext`.

## Verification Plan

### Automated Tests
- None (Visual verification required)

### Manual Verification
1. Open the app and navigate through all routes (`/`, `/form`, `/api`, `/my-list`).
2. Verify that entering a garbage URL (e.g., `/test404`) triggers the **404 Page**.
3. Toggle the **Theme Switcher** in the Navbar.
4. Verify the theme changes and persists after a page refresh.
5. Check if `localStorage` key `theme` is updated.
