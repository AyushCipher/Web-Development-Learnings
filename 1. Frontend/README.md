# 1. Frontend

A structured, hands-on progression through frontend web development -
from raw HTML and CSS fundamentals (box model, flexbox, grid,
transforms, animations) through JavaScript, and into modern React
(hooks, forms, routing, context, Redux Toolkit, TypeScript). Each
numbered folder is a self-contained lecture exercise or project, with
extensive Q&A-style comments in the source explaining not just *what*
the code does but *why* it's built that way.

## How this folder is organized

- **HTML/CSS folders** are static: open the `.html` file directly in a
  browser, or use an extension like VS Code's Live Server.
- **React/JS project folders** are independently runnable:

```bash
cd "<folder name>"
npm install
npm run dev
```

## Topics covered, in progression order

### HTML & CSS Fundamentals

| Folder | Topic |
|---|---|
| 1 Html Codes | Core HTML: lists, tables, forms, iframes, links |
| 2 CSS Basics | Selectors, box model intro |
| 3 CSS Box Model | Margin/border/padding/content model in depth |
| 4 CSS gradient(Lec-II) | Linear/radial gradients |
| 5 CSS Shadows(Lec-II) | `box-shadow` / `text-shadow` |
| 5a Box&TextShadow(harry) | Shadow practice, second pass |
| 6 CSS Dimension(Lec II) | Width/height, `box-sizing` |
| 7 CSS 2d Transformation | `transform`: translate/scale/rotate/skew |
| 8 CSS 3d transformations | `perspective`, 3D `transform` |
| 9 CSS position | `static`/`relative`/`absolute`/`fixed`/`sticky` |
| 10 CSS Flexbox | Flexbox layout model |
| 11 Parallax Effect Website | Scroll-based parallax background |
| 12 Unwrap Doubt session(image task) | Image layout troubleshooting exercise |
| 13 Product Card Projects | Card UI components |
| 14 CSS Grid | Grid layout basics |
| 15 CSS Gridarea | Named `grid-template-areas` |
| 16 AdvanceGrid | Advanced grid patterns |
| 17 Grid Properties | Full grid property reference |
| 18 Responsivness | Responsive layout techniques |
| 19 Grid Mediaquery | Grid + `@media` breakpoints |
| 20 Nested Grid | Grids nested inside grid items |
| 21 Blog using Grids.html | Blog layout built with CSS Grid |
| 22 Variables in CSS | Custom properties (`--var`) |
| 23 CSS Transition | `transition` property |
| 24 Animation CSS | `@keyframes` animations |
| 25 ModernButtons | Modern button styling patterns |
| 27 Modern Chair | CSS-only illustration/graphic |

### JavaScript

| Folder | Topic |
|---|---|
| 30. Javascript Basics | Core JS syntax and fundamentals |
| 31. JS ADVANCED | Closures, prototypes, async, and other advanced topics |
| 32. Js Small Projects | Small standalone JS exercises |
| 33. Js Mini Projects | Slightly larger JS mini-projects |

### React Fundamentals

| Folder | Topic |
|---|---|
| 34. ReactConcept 1 - HOOKS | `useState`, `useRef`, `useMemo`, `useCallback` demos, each with a visual on-screen demonstration |
| 35. ReactHook - useEffect | `useEffect` lifecycle and dependency-array behavior |
| 36. ReactConcept 2 - FORMS | Controlled form inputs |
| 37. Creating REACT FORM | Registration form with full client-side validation |
| 38. ReactConcept 3 - ROUTERS | React Router fundamentals |
| 39. React ROUTES Part 2 | React Router, continued (nested/dynamic routes) |
| 42. CUSTOM HOOKS CONCEPT | Building custom hooks (e.g. a random GIF generator) |
| 43. Context API Blog Website | Context API for global state, first pass |
| 44. Context API Blog Website 2 | Dual Context providers (blog + theme), no prop drilling |

### State Management

| Folder | Topic |
|---|---|
| 45. Redux Counter App | Redux Toolkit counter with a custom increment amount |
| 46. Redux Shopping App | Redux Toolkit shopping cart |

### React Practice Projects

| Folder | Topic |
|---|---|
| 40. REACT PROJECTS | A collection of small interview-style React projects: To-Do List, Notes App, Analog Clock, Password Generator, Calculator, Weather App, Form Validation, Tourism Cards, Testimonial Section, Tic-Tac-Toe, Quiz App, and more |
| 48. React Frontend Projects | Larger practice builds: a News/Blog App (with a JSON Server-backed variant), the Purple Bean Agro Site, and a Portfolio Website |

### Full Projects & Clones

| Folder | Topic |
|---|---|
| 28 Razorpay Clone | Razorpay payments UI clone |
| 29 Discord Clone | Discord UI clone |

### TypeScript

| Folder | Topic |
|---|---|
| 49. Typescript | TypeScript fundamentals applied to frontend code |

## What this folder is (and isn't)

This is a personal learning/practice repository, not a portfolio of
production sites - the goal throughout is depth of understanding over
polish. Folder numbering reflects the order topics were learned in, not
a strict dependency chain, so a few numbers are skipped where a project
was later removed from tracking.
