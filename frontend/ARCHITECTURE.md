# HMS Frontend Architecture

The frontend is organized by responsibility and hospital feature.

## Structure

- `api/` — HTTP/API functions only. Components do not construct endpoint URLs directly.
- `components/common/` — reusable UI primitives such as modals, status badges, loading states and page headers.
- `components/<feature>/` — reusable UI pieces for patients, appointments, clinical care, pharmacy, laboratory, billing and doctors.
- `features/<feature>/` — route-level feature pages that coordinate components and hooks.
- `hooks/` — reusable data-fetching and feature state logic.
- `routes/` — authentication/role guards and application route configuration.
- `layouts/` — role-specific application shells.
- `pages/` — remaining simple pages and dashboards that do not yet require deeper decomposition.
- `utils/` — formatting and error helpers.

## Preferred dependency direction

`Page -> Hook -> API -> FastAPI`

`Page -> Feature Component -> Common Component`

Components should not contain authentication redirects or hard-coded API URLs. API calls belong in `api/` modules and reusable asynchronous state belongs in hooks.

## Adding a new feature

1. Add API functions under `api/`.
2. Add a hook under `hooks/` if state/fetching is shared.
3. Add reusable UI under `components/<feature>/`.
4. Add the route page under `features/<feature>/`.
5. Register the page in `routes/AppRoutes.jsx`.
6. Keep role restrictions in route guards and backend authorization.
