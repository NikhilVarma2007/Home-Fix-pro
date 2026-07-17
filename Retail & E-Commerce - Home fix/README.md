# Retail & E-Commerce

## Structure
- `frontend/` React + Vite app
- `backend/` Node API that serves the app state and syncs to Supabase
- `backend/stacks/` optional backend implementations in Node.js/Express.js, Python/FastAPI, and Java/Spring Boot
- `database/mysql-schema.sql` MySQL schema for the app state table
- `database/schema.sql` optional Supabase table for the app state JSON

## Run locally
1. Open MySQL Workbench and connect to `Local instance MySQL80`.
2. Run `database/mysql-schema.sql`, or let the backend create the `homefix` database/table automatically.
3. In `backend/`, copy `.env.example` to `.env`. The local MySQL defaults are `root` / `sriyan` / `homefix`.
4. In `frontend/`, copy `.env.example` to `.env` and keep `VITE_API_URL=http://localhost:4000`.
5. Start the backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
6. Start the frontend in a second terminal:
   ```bash
   cd frontend
   npm run dev
   ```
7. Open the Vite URL shown in the frontend terminal, usually `http://localhost:5173`.
8. Sign in on the login page and pick a role:
   - Customer opens `Explore Services` first.
   - Service Provider opens the service dashboard.
   - Admin opens the control panel.

## Notes
- The Node backend uses MySQL by default and stores the app state in the `homefix.app_state` table.
- If MySQL is not reachable, the backend falls back to bundled demo data so the app still runs.
- Booking creation, booking cancellation, and chat messages are persisted through the backend API.
- Offers rotate every 20 seconds, and the provider roster now includes more than 20 people across all sectors.
- The default backend is still `backend/src/server.js`. Use the stack examples only when you want to test another backend technology on the same API route shape.
- The Spring Boot backend is configured with Maven, Java 17, Spring Web, Spring Security, Spring Data JPA, Flyway, DevTools, JWT, and MySQL.

## Project explanation

This project is a HomeFix service-booking app. The frontend is a React + Vite + TypeScript single-page app where customers can explore services, book workers, chat, and track bookings. Service providers get a work dashboard, and admins get a monitoring panel.

The backend exposes REST APIs on `http://localhost:4000`. The main backend is the Node.js server in `backend/src/server.js`. It uses the built-in Node HTTP server, returns JSON, handles CORS, issues JWT tokens from `POST /api/auth/login`, validates `Authorization: Bearer <token>` for protected routes, and stores the app data in MySQL.

The database is MySQL. In Workbench, the schema is `homefix`, and the main table is `app_state`. Instead of creating many tables for this demo, the backend stores one JSON app state document containing users, service categories, professionals, bookings, and chat threads. This keeps the API simple while still showing real database persistence.

The integration flow is:

1. The React app starts and calls `GET /api/bootstrap`.
2. The backend loads the latest JSON state from MySQL and sends it to React.
3. When a user logs in, React calls `POST /api/auth/login`.
4. The backend returns a JWT token.
5. React stores the token in browser local storage.
6. For protected actions like stats, booking updates, and chat messages, React sends `Authorization: Bearer <token>`.
7. The backend verifies the JWT, updates MySQL, and returns JSON responses.

The optional Spring Boot backend in `backend/stacks/java-springboot/` exposes the same API shape. It uses Maven, Java 17, Spring Web for REST APIs, Spring Security for JWT-protected routes, Spring Data JPA for persistence, Flyway for migrations, MySQL Connector/J for the database driver, and DevTools for development reloads.

## Run with Spring Boot instead

Install Maven first if it is not already available, make sure MySQL is running, then run only the Spring backend on port 4000:

```bash
npm run dev:spring
```

In a second terminal, run React:

```bash
npm run dev:frontend
```

Keep `frontend/.env` set to `VITE_API_URL=http://localhost:4000`.

## Supabase connection
The backend already connects to Supabase through the REST API in `backend/src/server.js`, so this project does not require the Supabase npm client. If you do need the official client later, the correct package name is:

```bash
npm install @supabase/supabase-js
```

Your failed commands used misspelled package names: `@supabasen-js` and `@supabas/supabase-js`.

To connect this app:

1. Open Supabase Dashboard, create a project, then open SQL Editor.
2. Run the SQL from `database/schema.sql`.
3. Copy `backend/.env.example` to `backend/.env`.
4. Put your project URL in `SUPABASE_URL`.
5. Put your service role key in `SUPABASE_SERVICE_ROLE_KEY`.
6. Copy `frontend/.env.example` to `frontend/.env`.
7. Run the app with `npm run dev`.

Use the service role key only in `backend/.env`. Never put it in frontend files or commit it to GitHub.

## GitHub connection
This folder should be a Git repo before connecting it to GitHub:

```bash
git init
git status
git add .
git commit -m "Initial retail ecommerce app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

If your remote already exists, replace it with:

```bash
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```
