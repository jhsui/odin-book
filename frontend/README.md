# Sway frontend

The React and TypeScript frontend for Sway, with a community feed, post galleries, profiles, follows, and conversations. It uses Vite, Tailwind CSS, React Router, TanStack Query, and the Better Auth client.

See the [project README](../README.md) for features, backend setup, PostgreSQL migrations, Supabase Storage, OAuth credentials, and deployment configuration.

## Run locally

Use Node.js **24.x** and npm. Set up and start the backend using the project README before using the app; it listens on `http://localhost:3000`.

Run the following commands from `frontend/`:

```sh
npm ci
```

Create `.env` in this directory with:

```dotenv
VITE_BACKEND_URL=http://localhost:3000
VITE_FRONTEND_URL=http://localhost:5173
```

- `VITE_BACKEND_URL` is the backend origin used by API requests and the auth client. Do not append `/api` or a trailing slash; application request paths already include `/api`.
- `VITE_FRONTEND_URL` is the frontend origin used for the redirect after Google or GitHub sign-in.

These values are exposed to the browser. Keep database, auth, and Supabase secrets in the backend environment.

```sh
npm run dev -- --port 5173 --strictPort
```

Open **http://localhost:5173**. The Vite configuration has no API proxy, so development requests go directly to `VITE_BACKEND_URL`. The backend's `FRONTEND_URL` must match the frontend origin for CORS and trusted auth origins. Restart Vite after changing `.env`.

## Scripts

| Command                                       | Purpose                                                                    |
| --------------------------------------------- | -------------------------------------------------------------------------- |
| `npm run dev`                                 | Start the Vite development server                                          |
| `npm run build`                               | Type-check the frontend and build into `dist/`                             |
| `npm run lint`                                | Run ESLint                                                                 |
| `npm run preview -- --port 5173 --strictPort` | Serve an existing production build on the configured local frontend origin |

Stop the development server before previewing on the same port. Run `npm run build` first and keep the backend running. Preview does not run Caddy or its production API proxy.

No automated frontend tests are configured. Build and lint checks do not verify browser interactions, authentication, uploads, or persistence.

## Client routes

Routes and loaders are defined in [src/routes.tsx](src/routes.tsx).

| Path                    | Page                                                                    |
| ----------------------- | ----------------------------------------------------------------------- |
| `/`                     | Landing page with sign-in, registration, and guest access               |
| `/dashboard`            | Infinite-scrolling community feed                                       |
| `/dashboard/writing`    | Post editor; publishing requires a registered account                   |
| `/dashboard/user-index` | User directory                                                          |
| `/dashboard/post-index` | Post directory                                                          |
| `/posts/:postId`        | Post detail, image carousel, likes, and comments                        |
| `/user-profile/:userId` | Public user profile                                                     |
| `/my-profile`           | Your profile and editing controls; redirects visitors and guests to `/` |

Unmatched paths render the not-found page. These browser routes are separate from the backend's `/api/*` endpoints.

## Data and authentication

[src/main.tsx](src/main.tsx) provides the React Router browser router and TanStack Query client. The dashboard uses `useInfiniteQuery` and an intersection observer to request pages of ten posts. Directories, public profiles, comments, and like status use query caching; route loaders fetch post details, the current user's profile, and the dashboard avatar.

[src/lib/auth-client.ts](src/lib/auth-client.ts) configures Better Auth and anonymous sessions. Authenticated API calls include `credentials: "include"` so the browser sends the session cookie. The backend enforces session, registered-account, and ownership requirements.

## Shared layout and styling

The interface uses a warm ivory background, forest-green accents, Roboto body text, and Georgia display headings.

- [src/index.css](src/index.css) defines Tailwind theme tokens and shared classes such as `ui-card`, `ui-button-primary`, `ui-button-secondary`, `ui-input`, and `ui-link`.
- [src/layout/PageShell.tsx](src/layout/PageShell.tsx) provides the shared page width, spacing, sticky header, and skip-to-content link. It also exports `PageHeading` for page titles and descriptions.
- [src/layout/SwayHeader.tsx](src/layout/SwayHeader.tsx) contains shared navigation and session controls.
- Feature components live in `src/auth/`, `src/posts/`, `src/comments/`, and `src/users/`.

Reuse the shared layout and controls when adding pages. Check narrow mobile widths, keyboard focus, and loading, empty, and error states when changing the UI.

## Production

Vite embeds environment values at build time. For the included Caddy setup, build with both frontend variables set to the public frontend origin. [Caddyfile](Caddyfile) serves `dist/` from `/app/dist`, proxies `/api` requests to the backend, and falls back to `index.html` for client routes.

Update the deployment-specific proxy hostname and matching `Host` header before using it for another deployment. Follow the [project deployment notes](../README.md#deployment-notes) for backend environment values, OAuth callbacks, HTTPS cookies, and ports.
