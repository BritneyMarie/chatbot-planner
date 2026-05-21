# Authentication API Documentation

## Base URL
```
http://localhost:5000/api/auth
```

## Endpoints

### 1. Register User

**Endpoint:** `POST /api/auth/register`

**Description:** Create a new user account

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Success Response (201):**
```json
{
  "message": "User registered successfully.",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Missing fields or validation error
  ```json
  { "error": "All fields are required." }
  ```
- `409` - Email or username already exists
  ```json
  { "error": "Email already registered." }
  ```
- `500` - Server error
  ```json
  { "error": "Failed to register user." }
  ```

**Validation Rules:**
- Username: minimum 3 characters
- Password: minimum 6 characters
- Passwords must match
- Email must be valid format

---

### 2. Login User

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user and receive JWT token

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful.",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Missing email or password
  ```json
  { "error": "Email and password are required." }
  ```
- `401` - Invalid credentials
  ```json
  { "error": "Invalid email or password." }
  ```
- `500` - Server error
  ```json
  { "error": "Failed to login." }
  ```

---

### 3. Logout User

**Endpoint:** `POST /api/auth/logout`

**Description:** Logout user (mostly client-side, clears token)

**Request Body:**
```json
{}
```

**Success Response (200):**
```json
{
  "message": "Logout successful."
}
```

---

### 4. Refresh Token

**Endpoint:** `POST /api/auth/refresh`

**Description:** Generate a new JWT token (extends session)

**Headers:**
```
Authorization: Bearer <existing_token>
```

**Request Body:**
```json
{}
```

**Success Response (200):**
```json
{
  "message": "Token refreshed successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `401` - No token or invalid token
  ```json
  { "error": "Access denied. No token provided." }
  ```
- `401` - Token expired
  ```json
  { "error": "Token has expired." }
  ```
- `401` - User not found
  ```json
  { "error": "User not found." }
  ```

---

## JWT Token Format

Tokens are valid for **7 days** by default (configurable via `JWT_EXPIRE` in `.env`)

**Token payload:**
```json
{
  "userId": 1,
  "iat": 1621234567,
  "exp": 1621839367
}
```

## Using the Token

For protected endpoints, include the token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Testing the API

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Refresh Token:**
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman

1. Open Postman
2. Create a new POST request
3. Set URL: `http://localhost:5000/api/auth/register`
4. Go to Body tab → Raw → JSON
5. Paste the request body
6. Click Send

---

## Error Handling

All errors return appropriate HTTP status codes:

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created (registration) |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (auth error) |
| 409 | Conflict (user already exists) |
| 500 | Server error |

---

## Flow Example

1. **User registers:**
   ```
   POST /register → Receives token
   ```

2. **User logs in again:**
   ```
   POST /login → Receives new token
   ```

3. **Token expires, user needs refresh:**
   ```
   POST /refresh with old token → Receives new token
   ```

4. **User logs out:**
   ```
   POST /logout → Clear token on client
   ```

---

## Database Requirements

Authentication endpoints require PostgreSQL database to be running. See [SETUP.md](../SETUP.md) for database setup instructions.

**Tables created automatically:**
- `users` - Stores user credentials (bcrypt hashed)
- `user_preferences` - Stores theme customization

---

## Security Notes

- Passwords are hashed using bcrypt (10 rounds)
- Tokens are signed with `JWT_SECRET` (change in production!)
- Tokens are httpOnly recommended (client-side handling in frontend phase)
- CORS is configured to only allow requests from `http://localhost:5173`
