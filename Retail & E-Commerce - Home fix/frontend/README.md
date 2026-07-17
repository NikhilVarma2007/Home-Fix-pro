# Frontend

React + Vite UI for the retail and e-commerce app.

Run it from this folder with `npm run dev` after setting `VITE_API_URL` in `.env`.

The default `VITE_API_URL=http://localhost:4000` works with both backends:

- Node API: `npm run dev:backend`
- Spring Boot API: `npm run dev:spring`

On login, the frontend calls `/api/auth/login`, stores the JWT token in local storage, and sends it as `Authorization: Bearer <token>` on protected backend requests.
