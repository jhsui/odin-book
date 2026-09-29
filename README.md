# Odin Book — Sway

Sway is a full-stack social app for sharing posts, joining conversations, and following other users. Built with React, TypeScript, Express, and PostgreSQL, it brings together authentication, image uploads, a paginated feed, and user profiles.

For frontend development, client routes, and shared UI conventions, see the [frontend guide](frontend/README.md).

## Features

- **Authentication:** email/password registration and sign-in, Google and GitHub OAuth, and anonymous guest sessions.
- **Posts:** create posts with a title, text, and up to four images; browse an infinite-scrolling feed and a post directory; view individual posts and delete your own.
- **Conversations:** like and unlike posts, add comments, and delete your own comments.
- **Connections:** browse the user directory, follow and unfollow users, and view follower/following lists.
- **Profiles:** update your display name, avatar, and introduction, and browse a user's posts and comments.
- **Image galleries:** browse post images with previous/next controls and an image counter.

Anyone can browse without signing in. Signing in as a guest creates an anonymous session that can like and unlike posts and add or delete its own comments. Creating posts, following users, and editing a profile require a registered account.

## Tech stack

| Layer                       | Technologies                                                   |
| --------------------------- | -------------------------------------------------------------- |
| Frontend                    | React, TypeScript, Vite, Tailwind CSS                          |
| Routing and server state    | React Router, TanStack Query, React Intersection Observer      |
| Backend                     | Node.js, Express, TypeScript                                   |
| Database                    | PostgreSQL, Prisma, PostgreSQL driver adapter                  |
| Authentication              | Better Auth with email/password, OAuth, and anonymous sessions |
| File storage                | Supabase Storage, Multer                                       |
| Validation                  | express-validator                                              |
| Production frontend serving | Caddy with an API reverse proxy                                |

## How it works

The React frontend calls the Express API under `/api`. Better Auth handles cookie-based sessions at `/api/auth`, while backend middleware checks whether an action requires a session, a registered account, or ownership of a resource.

Prisma stores users, sessions, accounts, posts, comments, likes, follows, and image metadata in PostgreSQL. Image files live in Supabase Storage. The backend turns stored object paths into signed URLs valid for one hour; the dashboard batches URL signing for each page of ten posts.

The frontend uses TanStack Query for cached server data and infinite scrolling, alongside React Router loaders for selected pages. Database constraints enforce one like per user/post pair and one follow per follower/following pair.

Shared page layouts and Tailwind theme tokens keep the interface consistent, with warm ivory backgrounds, forest-green accents, and serif display headings. [PageShell](frontend/src/layout/PageShell.tsx) supplies the shared header, content width, and skip-to-content link; [index.css](frontend/src/index.css) defines reusable surfaces and controls.

## Project structure

```text
odin-book/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Data models
│   │   └── migrations/         # Versioned database migrations
│   ├── prisma.config.ts       # Prisma connection configuration
│   └── src/
│       ├── app.ts             # Express entry point
│       ├── controllers/       # Posts, comments, users, and image helpers
│       ├── lib/               # Auth, Prisma, and Supabase clients
│       ├── middleware/        # Permissions, validation, and error handling
│       └── routes/            # API route definitions
└── frontend/
    ├── Caddyfile              # Production SPA serving and API proxy
    └── src/
        ├── auth/              # Sign-in, registration, and guest access
        ├── comments/          # Comment lists and actions
        ├── layout/            # Shared page shell, headings, and navigation
        ├── posts/             # Feed cards, editor, detail view, and gallery
        ├── users/             # Profiles, user directory, and follow controls
        ├── Dashboard.tsx      # Infinite-scrolling feed
        └── routes.tsx         # Client routes and loaders
```

## Run locally

### Prerequisites

- Node.js **24.x** and npm. The backend runs TypeScript directly through Node.
- A PostgreSQL database.
- A Supabase project with Storage enabled.
- Google and/or GitHub OAuth credentials if you want to use those sign-in methods.

### 1. Clone the repository

```sh
git clone https://github.com/jhsui/odin-book.git
cd odin-book
```

Run the commands below from the repository root unless otherwise noted. The frontend and backend have separate package manifests and lockfiles.

### 2. Configure the backend

Create `backend/.env`:

```dotenv
DATABASE_URL=postgresql://postgres:your-password@localhost:5432/odin_book

BETTER_AUTH_SECRET=replace-with-a-random-secret
BETTER_AUTH_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your-supabase-server-secret-key

# Needed only for the corresponding social sign-in provider.
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

Generate a value for `BETTER_AUTH_SECRET` with:

```sh
openssl rand -base64 32
```

Use a Supabase server secret key with permission to upload, remove, and sign storage objects. Keep it in the backend environment; the frontend only needs the public application URLs below.

`backend/prisma.config.ts` also accepts `SHADOW_DATABASE_URL` for development migrations. It is optional for applying the existing migrations with `prisma migrate deploy`. If you configure it for `prisma migrate dev`, point it to a separate, disposable database.

### 3. Create the storage buckets

In your Supabase project's Storage dashboard, create these **private** buckets with the exact names:

- `user-avatars`
- `post-images`

The backend uses its server key to access them and returns signed image URLs to the browser. Allow uploads up to **5 MiB per file** in the bucket settings. The application accepts up to four images per post, and the post editor supports JPEG, PNG, and WebP.

### 4. Configure the frontend

Create `frontend/.env`:

```dotenv
VITE_BACKEND_URL=http://localhost:3000
VITE_FRONTEND_URL=http://localhost:5173
```

Use origins without a trailing slash. Do not append `/api` to `VITE_BACKEND_URL`: the request paths already include it. Vite exposes `VITE_*` variables to the browser, so they must not contain secrets.

### 5. Configure OAuth (optional)

For Google and GitHub sign-in, register these callback URLs in the corresponding provider settings and fill in its credentials in `backend/.env`:

| Provider | Local callback URL                               |
| -------- | ------------------------------------------------ |
| Google   | `http://localhost:3000/api/auth/callback/google` |
| GitHub   | `http://localhost:3000/api/auth/callback/github` |

Successful social sign-in redirects to `${VITE_FRONTEND_URL}/dashboard`. Without provider credentials, use email/password or guest sign-in.

### 6. Install dependencies and apply migrations

```sh
npm --prefix backend ci
npm --prefix frontend ci
```

The backend's `postinstall` script generates Prisma Client in `backend/generated/prisma`.

With your PostgreSQL database created and `DATABASE_URL` configured, apply the committed migrations:

```sh
cd backend
npx prisma migrate deploy
cd ..
```

There is no seed script. Register an account and create posts to populate a fresh database.

### 7. Start both applications

In one terminal:

```sh
npm --prefix backend start
```

In a second terminal:

```sh
npm --prefix frontend run dev -- --port 5173 --strictPort
```

Open **http://localhost:5173**. The API listens on **http://localhost:3000**.

The backend currently fixes its listening port at `3000` in `backend/src/app.ts`. If you change the frontend origin or backend port, update the matching environment values and OAuth callbacks. Restart the relevant server after changing an environment file. The backend start script has no watch mode, so restart it after backend source changes as well.

## Development commands

Run these from the repository root:

| Command                              | Purpose                                                |
| ------------------------------------ | ------------------------------------------------------ |
| `npm --prefix frontend run dev`      | Start the Vite development server                      |
| `npm --prefix backend start`         | Start the Express API                                  |
| `npm --prefix frontend run build`    | Type-check and build the frontend into `frontend/dist` |
| `npm --prefix frontend run lint`     | Run frontend ESLint checks                             |
| `npm --prefix frontend run preview`  | Preview the frontend production build locally          |
| `npm --prefix backend run typecheck` | Type-check the backend without emitting files          |

After changing the Prisma schema, run `npx prisma migrate dev --name your_change` and `npx prisma generate` from `backend/` against a development database.

Automated tests are not configured yet; the backend's `npm test` is a placeholder that exits with an error. Build, lint, and type checks do not exercise authentication, database persistence, or storage integrations.

## API overview

Application routes are defined in [`backend/src/routes/router.ts`](backend/src/routes/router.ts). All paths below include the `/api` prefix.

| Method             | Endpoint                                      | Purpose                                                                        |
| ------------------ | --------------------------------------------- | ------------------------------------------------------------------------------ |
| GET                | `/api/posts/dashboard?pageParam=0`            | Feed, with zero-based pages of ten posts                                       |
| GET                | `/api/posts`                                  | All posts                                                                      |
| GET                | `/api/posts/index`                            | Post directory                                                                 |
| POST               | `/api/posts`                                  | Create a post using multipart fields `title`, `content`, and optional `images` |
| GET / DELETE       | `/api/posts/:postId`                          | Read a post / delete your own post                                             |
| GET / PUT / DELETE | `/api/posts/:postId/likes/me`                 | Read like status and count / like / unlike                                     |
| GET / POST         | `/api/posts/:postId/comments`                 | Read comments / add a comment using `{ "comment": "..." }`                     |
| DELETE             | `/api/comments/:commentId`                    | Delete your own comment                                                        |
| GET                | `/api/users/index`                            | User directory                                                                 |
| GET                | `/api/users/profile/:userId`                  | Public user profile                                                            |
| GET                | `/api/users/me/profile`                       | Your registered account's profile                                              |
| GET / PUT          | `/api/users/me/avatar`                        | Read your avatar URL / upload an avatar using the multipart field `avatar`     |
| PUT                | `/api/users/me/name`                          | Update your display name using `{ "newName": "..." }`                          |
| PUT                | `/api/users/me/intro`                         | Update your introduction using `{ "intro": "..." }` (up to 1,000 characters)   |
| PUT / DELETE       | `/api/users/me/following/:followingId`        | Follow / unfollow a user                                                       |
| GET                | `/api/users/me/following/:followingId/status` | Read your follow status                                                        |

Better Auth handles authentication routes under `/api/auth/*`. Requests that need a session must include the session cookie; the frontend uses `credentials: "include"` for authenticated API calls.

## Deployment notes

[`frontend/Caddyfile`](frontend/Caddyfile) serves the built frontend from `/app/dist`, falls back to `index.html` for client routes, and proxies `/api` requests to the backend. It currently contains a deployment-specific Railway backend hostname; update both the proxy target and `Host` header for your deployment.

For this proxy setup, set `VITE_BACKEND_URL`, `VITE_FRONTEND_URL`, `BETTER_AUTH_URL`, and `FRONTEND_URL` to the public frontend origin. Configure provider callback URLs as `https://your-domain/api/auth/callback/google` and `https://your-domain/api/auth/callback/github`. Set the frontend variables before building, and set `NODE_ENV=production` on the backend so session cookies use HTTPS.

The backend listens on port `3000`; Caddy uses `PORT`, defaulting to `8080`. This Caddyfile disables automatic HTTPS, so the hosting platform or an upstream proxy must terminate HTTPS for the public site. Configure your hosting services accordingly and apply the database migrations during deployment.
