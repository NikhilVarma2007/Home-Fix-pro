# Backend

The production demo API currently runs from `src/server.js` with Node.js.

Additional backend stack examples live in `stacks/`:

- `stacks/node-express/` - Node.js + Express.js API
- `stacks/python-fastapi/` - Python + FastAPI API
- `stacks/java-springboot/` - Java + Spring Boot API

Each stack exposes the same simple contract:

- `GET /health`
- `GET /api/stats`
- `GET /api/bootstrap`
- `POST /api/auth/login`
- `POST /api/bookings`
- `PATCH /api/bookings/{id}`
- `POST /api/chat-threads/{id}/messages`

The current frontend still points to `http://localhost:4000` by default. Run only one backend at a time on that port, or change `VITE_API_URL` in the frontend `.env`.

## Node backend database and JWT

`src/server.js` uses MySQL by default with:

- Host: `localhost`
- Port: `3306`
- User: `root`
- Password: `sriyan`
- Database: `homefix`

The backend creates the `homefix` database and `app_state` table automatically when MySQL is reachable. You can also run `../database/mysql-schema.sql` in MySQL Workbench.

JWT flow:

1. React calls `POST /api/auth/login`.
2. The backend signs a JWT with `JWT_SECRET`.
3. React stores the token locally.
4. Protected routes require `Authorization: Bearer <token>`.

## Spring Boot stack

The Spring Boot backend in `stacks/java-springboot/` is configured like the Spring Initializr setup:

- Maven project
- Java 17
- Package `com.backend.home`
- Spring Boot DevTools
- Spring Web
- Spring Security
- Spring Data JPA
- Flyway Migration
- JWT security
- MySQL database

It uses MySQL through Spring Data JPA and Flyway. Start it with:

```bash
npm run dev:spring
```

Run the React frontend separately with `npm run dev:frontend`. The frontend already uses `VITE_API_URL=http://localhost:4000`, so it can talk to either the Node backend or this Spring Boot backend as long as only one backend is running on port 4000.
