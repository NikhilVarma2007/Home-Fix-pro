package com.backend.home;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.filter.OncePerRequestFilter;

@SpringBootApplication
public class HomefixBackendApplication {
  public static void main(String[] args) {
    SpringApplication.run(HomefixBackendApplication.class, args);
  }
}

@RestController
class AppController {
  private final AppStateService appStateService;

  AppController(AppStateService appStateService) {
    this.appStateService = appStateService;
  }

  @GetMapping("/health")
  Map<String, Object> health() {
    return appStateService.health();
  }

  @GetMapping("/api/bootstrap")
  Map<String, Object> bootstrap() {
    return appStateService.bootstrap();
  }

  @GetMapping("/api/stats")
  Map<String, Object> stats() {
    return appStateService.stats();
  }

  @PostMapping("/api/bookings")
  @ResponseStatus(HttpStatus.CREATED)
  Map<String, Object> createBooking(@RequestBody BookingPayload payload) {
    return appStateService.createBooking(payload);
  }

  @PatchMapping("/api/bookings/{bookingId}")
  Map<String, Object> updateBooking(@PathVariable String bookingId, @RequestBody BookingPayload payload) {
    return appStateService.updateBooking(bookingId, payload);
  }

  @PostMapping("/api/chat-threads/{threadId}/messages")
  @ResponseStatus(HttpStatus.CREATED)
  Map<String, Object> createMessage(@PathVariable String threadId, @RequestBody MessagePayload payload) {
    return appStateService.createMessage(threadId, payload);
  }
}

@RestController
class AuthController {
  private final JwtService jwtService;

  AuthController(JwtService jwtService) {
    this.jwtService = jwtService;
  }

  @PostMapping("/api/auth/login")
  Map<String, Object> login(@RequestBody LoginPayload payload) {
    LoginPayload safePayload = payload == null ? new LoginPayload(null, null, null, null, null, null, null, null) : payload;
    String role = normalizeRole(safePayload.role());
    String name = safePayload.name() == null || safePayload.name().isBlank() ? "Guest User" : safePayload.name().trim();
    String phone = safePayload.phone() == null || safePayload.phone().isBlank() ? "+91 00000 00000" : safePayload.phone().trim();

    Map<String, Object> claims = new LinkedHashMap<>();
    claims.put("name", name);
    claims.put("phone", phone);
    claims.put("role", role);
    claims.put("businessName", safePayload.businessName());
    claims.put("profession", safePayload.profession());
    claims.put("language", safePayload.language());
    claims.put("experience", safePayload.experience());
    claims.put("serviceArea", safePayload.serviceArea());

    return Map.of(
        "token", jwtService.issueToken(phone, claims),
        "tokenType", "Bearer",
        "expiresInSeconds", jwtService.expirationSeconds(),
        "user", Map.of(
            "name", name,
            "phone", phone,
            "role", role));
  }

  private String normalizeRole(String role) {
    if (List.of("customer", "service", "admin").contains(role)) {
      return role;
    }
    return "customer";
  }
}

@Service
class AppStateService {
  private static final String APP_STATE_ID = "default";
  private static final TypeReference<Map<String, Object>> STATE_TYPE = new TypeReference<>() {};

  private final AppStateRepository repository;
  private final ObjectMapper objectMapper;

  AppStateService(AppStateRepository repository, ObjectMapper objectMapper) {
    this.repository = repository;
    this.objectMapper = objectMapper;
  }

  Map<String, Object> health() {
    return Map.of(
        "ok", true,
        "stack", "java-springboot",
        "source", "jpa-flyway");
  }

  @Transactional
  Map<String, Object> bootstrap() {
    return loadState();
  }

  @Transactional
  Map<String, Object> stats() {
    Map<String, Object> state = loadState();
    List<Map<String, Object>> bookings = listOfMaps(state, "bookings");
    long activeBookings = bookings.stream()
        .filter(booking -> List.of("pending", "confirmed", "in_progress").contains(booking.get("status")))
        .count();

    return Map.of(
        "source", "jpa-flyway",
        "stack", "java-springboot",
        "totalBookings", bookings.size(),
        "activeBookings", activeBookings,
        "totalProfessionals", listOfMaps(state, "professionals").size(),
        "totalCategories", listOfMaps(state, "categories").size(),
        "lastUpdated", Instant.now().toString());
  }

  @Transactional
  Map<String, Object> createBooking(BookingPayload payload) {
    Map<String, Object> booking = requireBooking(payload);
    AppStateEntity entity = getOrCreateState();
    Map<String, Object> state = readState(entity);
    List<Map<String, Object>> bookings = listOfMaps(state, "bookings");

    bookings.removeIf(item -> Objects.equals(booking.get("id"), item.get("id")));
    bookings.add(0, booking);
    persistState(entity, state);

    return Map.of("booking", booking);
  }

  @Transactional
  Map<String, Object> updateBooking(String bookingId, BookingPayload payload) {
    Map<String, Object> booking = requireBooking(payload);
    AppStateEntity entity = getOrCreateState();
    Map<String, Object> state = readState(entity);
    List<Map<String, Object>> bookings = listOfMaps(state, "bookings");

    for (int index = 0; index < bookings.size(); index++) {
      if (Objects.equals(bookingId, bookings.get(index).get("id"))) {
        bookings.set(index, booking);
        persistState(entity, state);
        return Map.of("booking", booking);
      }
    }

    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found");
  }

  @Transactional
  Map<String, Object> createMessage(String threadId, MessagePayload payload) {
    Map<String, Object> message = requireMessage(payload);
    AppStateEntity entity = getOrCreateState();
    Map<String, Object> state = readState(entity);
    List<Map<String, Object>> threads = listOfMaps(state, "chatThreads");
    String userId = userId(state);

    for (Map<String, Object> thread : threads) {
      if (Objects.equals(threadId, thread.get("id"))) {
        List<Map<String, Object>> messages = listValue(thread, "messages");
        messages.add(message);
        thread.put("messages", messages);
        thread.put("lastMessage", message.getOrDefault("text", ""));
        thread.put("lastMessageTime", message.getOrDefault("timestamp", Instant.now().toString()));

        if (!Objects.equals(message.get("senderId"), userId)) {
          thread.put("unread", intValue(thread.get("unread")) + 1);
        }

        persistState(entity, state);
        return Map.of("message", message);
      }
    }

    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Thread not found");
  }

  private Map<String, Object> loadState() {
    return readState(getOrCreateState());
  }

  private AppStateEntity getOrCreateState() {
    return repository.findById(APP_STATE_ID)
        .orElseGet(() -> repository.save(new AppStateEntity(APP_STATE_ID, toJson(seedState()))));
  }

  private Map<String, Object> readState(AppStateEntity entity) {
    try {
      return normalizeState(objectMapper.readValue(entity.getData(), STATE_TYPE));
    } catch (IOException error) {
      Map<String, Object> seed = seedState();
      entity.setData(toJson(seed));
      repository.save(entity);
      return seed;
    }
  }

  private void persistState(AppStateEntity entity, Map<String, Object> state) {
    entity.setData(toJson(normalizeState(state)));
    repository.save(entity);
  }

  private Map<String, Object> seedState() {
    try (InputStream input = new ClassPathResource("seed-data.json").getInputStream()) {
      return normalizeState(objectMapper.readValue(input, STATE_TYPE), minimalSeedState());
    } catch (IOException error) {
      return minimalSeedState();
    }
  }

  private String toJson(Map<String, Object> state) {
    try {
      return objectMapper.writeValueAsString(state);
    } catch (JsonProcessingException error) {
      throw new IllegalStateException("Unable to serialize app state", error);
    }
  }

  private Map<String, Object> normalizeState(Map<String, Object> state) {
    return normalizeState(state, minimalSeedState());
  }

  private Map<String, Object> normalizeState(Map<String, Object> state, Map<String, Object> fallback) {
    Map<String, Object> safeState = state == null ? Map.of() : state;
    Map<String, Object> normalized = new LinkedHashMap<>();
    normalized.put("user", safeState.get("user") instanceof Map<?, ?> ? safeState.get("user") : fallback.get("user"));
    normalized.put("categories", safeState.get("categories") instanceof List<?> ? safeState.get("categories") : fallback.get("categories"));
    normalized.put("professionals", safeState.get("professionals") instanceof List<?> ? safeState.get("professionals") : fallback.get("professionals"));
    normalized.put("bookings", safeState.get("bookings") instanceof List<?> ? safeState.get("bookings") : fallback.get("bookings"));
    normalized.put("chatThreads", safeState.get("chatThreads") instanceof List<?> ? safeState.get("chatThreads") : fallback.get("chatThreads"));
    return normalized;
  }

  private Map<String, Object> minimalSeedState() {
    Map<String, Object> address = new LinkedHashMap<>();
    address.put("id", "addr-1");
    address.put("label", "Home");
    address.put("full", "42, 4th Cross, Jayanagar 4th Block, Bangalore - 560011");
    address.put("lat", 12.9279);
    address.put("lng", 77.5831);

    Map<String, Object> user = new LinkedHashMap<>();
    user.put("id", "user-1");
    user.put("name", "Priya Menon");
    user.put("phone", "+91 98765 43210");
    user.put("avatar", "/images/user-avatar.jpg");
    user.put("addresses", List.of(address));

    Map<String, Object> state = new LinkedHashMap<>();
    state.put("user", user);
    state.put("categories", new ArrayList<Map<String, Object>>());
    state.put("professionals", new ArrayList<Map<String, Object>>());
    state.put("bookings", new ArrayList<Map<String, Object>>());
    state.put("chatThreads", new ArrayList<Map<String, Object>>());
    return state;
  }

  private Map<String, Object> requireBooking(BookingPayload payload) {
    if (payload == null || payload.booking() == null || payload.booking().get("id") == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "booking is required");
    }

    return new LinkedHashMap<>(payload.booking());
  }

  private Map<String, Object> requireMessage(MessagePayload payload) {
    if (payload == null || payload.message() == null || payload.message().get("id") == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "message is required");
    }

    return new LinkedHashMap<>(payload.message());
  }

  private String userId(Map<String, Object> state) {
    Object user = state.get("user");
    if (user instanceof Map<?, ?> userMap) {
      Object id = userMap.get("id");
      return id == null ? null : id.toString();
    }
    return null;
  }

  private int intValue(Object value) {
    return value instanceof Number number ? number.intValue() : 0;
  }

  @SuppressWarnings("unchecked")
  private List<Map<String, Object>> listOfMaps(Map<String, Object> state, String key) {
    Object value = state.get(key);
    if (value instanceof List<?>) {
      return (List<Map<String, Object>>) value;
    }

    List<Map<String, Object>> fallback = new ArrayList<>();
    state.put(key, fallback);
    return fallback;
  }

  @SuppressWarnings("unchecked")
  private List<Map<String, Object>> listValue(Map<String, Object> parent, String key) {
    Object value = parent.get(key);
    if (value instanceof List<?>) {
      return (List<Map<String, Object>>) value;
    }

    List<Map<String, Object>> fallback = new ArrayList<>();
    parent.put(key, fallback);
    return fallback;
  }
}

@Configuration
class SecurityConfig {
  @Bean
  SecurityFilterChain apiSecurity(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
    return http
        .csrf(AbstractHttpConfigurer::disable)
        .cors(Customizer.withDefaults())
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            .requestMatchers("/health", "/api/auth/login", "/api/bootstrap").permitAll()
            .anyRequest().authenticated())
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
        .httpBasic(AbstractHttpConfigurer::disable)
        .formLogin(AbstractHttpConfigurer::disable)
        .build();
  }

  @Bean
  JwtAuthenticationFilter jwtAuthenticationFilter(JwtService jwtService) {
    return new JwtAuthenticationFilter(jwtService);
  }

  @Bean
  CorsConfigurationSource corsConfigurationSource(
      @Value("${app.cors.allowed-origins:*}") String allowedOrigins) {
    CorsConfiguration configuration = new CorsConfiguration();
    for (String origin : allowedOrigins.split(",")) {
      configuration.addAllowedOriginPattern(origin.trim());
    }
    configuration.setAllowedMethods(List.of("GET", "POST", "PATCH", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("Content-Type", "Authorization"));
    configuration.setAllowCredentials(false);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }
}

interface AppStateRepository extends JpaRepository<AppStateEntity, String> {}

@Service
class JwtService {
  private static final Base64.Encoder BASE64_URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
  private static final Base64.Decoder BASE64_URL_DECODER = Base64.getUrlDecoder();
  private static final String HMAC_SHA256 = "HmacSHA256";

  private final ObjectMapper objectMapper;
  private final String issuer;
  private final byte[] secret;
  private final long expirationSeconds;

  JwtService(
      ObjectMapper objectMapper,
      @Value("${app.jwt.issuer:homefix-pro}") String issuer,
      @Value("${app.jwt.secret}") String secret,
      @Value("${app.jwt.expiration-seconds:86400}") long expirationSeconds) {
    this.objectMapper = objectMapper;
    this.issuer = issuer;
    this.secret = secret.getBytes(StandardCharsets.UTF_8);
    this.expirationSeconds = expirationSeconds;
  }

  long expirationSeconds() {
    return expirationSeconds;
  }

  String issueToken(String subject, Map<String, Object> claims) {
    Instant now = Instant.now();
    Map<String, Object> header = Map.of("alg", "HS256", "typ", "JWT");
    Map<String, Object> payload = new LinkedHashMap<>(claims);
    payload.put("sub", subject);
    payload.put("iss", issuer);
    payload.put("iat", now.getEpochSecond());
    payload.put("exp", now.plusSeconds(expirationSeconds).getEpochSecond());

    String unsignedToken = base64Json(header) + "." + base64Json(payload);
    return unsignedToken + "." + sign(unsignedToken);
  }

  JwtPrincipal validate(String token) {
    String[] parts = token == null ? new String[0] : token.split("\\.");
    if (parts.length != 3) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid JWT");
    }

    String unsignedToken = parts[0] + "." + parts[1];
    if (!constantTimeEquals(sign(unsignedToken), parts[2])) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid JWT signature");
    }

    Map<String, Object> claims = decodeClaims(parts[1]);
    if (!Objects.equals(issuer, stringClaim(claims, "iss"))) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid JWT issuer");
    }

    long expiresAt = longClaim(claims, "exp");
    if (expiresAt <= Instant.now().getEpochSecond()) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "JWT expired");
    }

    return new JwtPrincipal(
        stringClaim(claims, "sub"),
        stringClaim(claims, "role"),
        claims);
  }

  private String base64Json(Map<String, Object> value) {
    try {
      return BASE64_URL_ENCODER.encodeToString(objectMapper.writeValueAsBytes(value));
    } catch (JsonProcessingException error) {
      throw new IllegalStateException("Unable to serialize JWT", error);
    }
  }

  private Map<String, Object> decodeClaims(String encodedClaims) {
    try {
      byte[] decoded = BASE64_URL_DECODER.decode(encodedClaims);
      return objectMapper.readValue(decoded, new TypeReference<>() {});
    } catch (IOException | IllegalArgumentException error) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid JWT claims");
    }
  }

  private String sign(String unsignedToken) {
    try {
      Mac mac = Mac.getInstance(HMAC_SHA256);
      mac.init(new SecretKeySpec(secret, HMAC_SHA256));
      return BASE64_URL_ENCODER.encodeToString(mac.doFinal(unsignedToken.getBytes(StandardCharsets.UTF_8)));
    } catch (Exception error) {
      throw new IllegalStateException("Unable to sign JWT", error);
    }
  }

  private boolean constantTimeEquals(String left, String right) {
    return MessageDigest.isEqual(
        left.getBytes(StandardCharsets.UTF_8),
        right.getBytes(StandardCharsets.UTF_8));
  }

  private String stringClaim(Map<String, Object> claims, String key) {
    Object value = claims.get(key);
    return value == null ? "" : value.toString();
  }

  private long longClaim(Map<String, Object> claims, String key) {
    Object value = claims.get(key);
    if (value instanceof Number number) {
      return number.longValue();
    }
    try {
      return Long.parseLong(stringClaim(claims, key));
    } catch (NumberFormatException error) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid JWT timestamp");
    }
  }
}

class JwtAuthenticationFilter extends OncePerRequestFilter {
  private final JwtService jwtService;

  JwtAuthenticationFilter(JwtService jwtService) {
    this.jwtService = jwtService;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {
    String authorization = request.getHeader("Authorization");

    if (authorization != null && authorization.startsWith("Bearer ")) {
      try {
        JwtPrincipal principal = jwtService.validate(authorization.substring("Bearer ".length()).trim());
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
            principal,
            null,
            List.of(new SimpleGrantedAuthority("ROLE_" + principal.role().toUpperCase())));
        SecurityContextHolder.getContext().setAuthentication(authentication);
      } catch (ResponseStatusException error) {
        SecurityContextHolder.clearContext();
        response.sendError(HttpStatus.UNAUTHORIZED.value(), error.getReason());
        return;
      }
    }

    filterChain.doFilter(request, response);
  }
}

@Entity
@Table(name = "app_state")
class AppStateEntity {
  @Id
  @Column(length = 64, nullable = false)
  private String id;

  @Lob
  @Basic(fetch = FetchType.LAZY)
  @Column(nullable = false, columnDefinition = "longtext")
  private String data;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  protected AppStateEntity() {}

  AppStateEntity(String id, String data) {
    this.id = id;
    this.data = data;
  }

  @PrePersist
  void onCreate() {
    Instant now = Instant.now();
    if (createdAt == null) {
      createdAt = now;
    }
    updatedAt = now;
  }

  @PreUpdate
  void onUpdate() {
    updatedAt = Instant.now();
  }

  public String getId() {
    return id;
  }

  public String getData() {
    return data;
  }

  public void setData(String data) {
    this.data = data;
  }
}

record BookingPayload(Map<String, Object> booking) {}

record MessagePayload(Map<String, Object> message) {}

record LoginPayload(
    String role,
    String name,
    String phone,
    String businessName,
    String profession,
    String language,
    String experience,
    String serviceArea) {}

record JwtPrincipal(String subject, String role, Map<String, Object> claims) {}
