# Java + Spring Boot Backend

This stack matches the requested Spring Initializr setup:

- Maven
- Java 17
- Group `com.backend`
- Artifact `home`
- Package `com.backend.home`
- Spring Boot DevTools
- Spring Web
- Spring Security
- Spring Data JPA
- Flyway Migration
- JWT authentication
- MySQL Connector/J

MySQL is the database. The default local settings are:

- URL: `jdbc:mysql://localhost:3306/homefix`
- User: `root`
- Password: `sriyan`

The JDBC URL uses `createDatabaseIfNotExist=true`, and Flyway creates the `app_state` table.

Run:

```bash
mvn spring-boot:run
```

The app starts on `http://localhost:4000` and exposes the same route shape as the Node API:

- `GET /health`
- `POST /api/auth/login`
- `GET /api/stats`
- `GET /api/bootstrap`
- `POST /api/bookings`
- `PATCH /api/bookings/{id}`
- `POST /api/chat-threads/{id}/messages`

The React app can use it with `VITE_API_URL=http://localhost:4000`.
