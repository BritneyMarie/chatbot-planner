# API Documentation

## Authentication API

### Base URL
```
http://localhost:5000/api/auth
```

### Endpoints

#### 1. Register
**POST** `/register`

Register a new user.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123"
}
```

**Validation Rules:**
- Username: minimum 3 characters
- Password: minimum 6 characters
- Email: valid email format
- Passwords must match

**Success Response (201):**
```json
{
  "message": "User registered successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `400`: Validation failed (missing fields, username too short, password too short, passwords don't match)
- `409`: User already exists
- `500`: Server error

---

#### 2. Login
**POST** `/login`

Authenticate a user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `400`: Missing email or password
- `401`: Invalid credentials
- `404`: User not found
- `500`: Server error

---

#### 3. Logout
**POST** `/logout`

Logout a user (token is cleared client-side).

**Success Response (200):**
```json
{
  "message": "Logout successful."
}
```

---

#### 4. Refresh Token
**POST** `/refresh`

Refresh an expired JWT token.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "message": "Token refreshed.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `401`: Invalid or expired token
- `404`: User not found
- `500`: Server error

---

## Events API

### Base URL
```
http://localhost:5000/api/events
```

**All events endpoints require authentication.** Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Endpoints

#### 1. Create Event
**POST** `/`

Create a new event for the authenticated user.

**Request Body:**
```json
{
  "title": "Team Meeting",
  "description": "Quarterly planning meeting",
  "startTime": "2024-01-15T14:00:00Z",
  "endTime": "2024-01-15T15:00:00Z",
  "color": "#667eea"
}
```

**Validation:**
- `title`: required, string
- `startTime`: required, ISO 8601 datetime
- `endTime`: required, ISO 8601 datetime
- `endTime` must be after `startTime`
- `description`: optional, string
- `color`: optional, hex color code (default: #667eea)

**Success Response (201):**
```json
{
  "message": "Event created successfully.",
  "event": {
    "id": 1,
    "user_id": 1,
    "title": "Team Meeting",
    "description": "Quarterly planning meeting",
    "start_time": "2024-01-15T14:00:00.000Z",
    "end_time": "2024-01-15T15:00:00.000Z",
    "color": "#667eea",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Validation failed (missing required fields, invalid times)
- `401`: Unauthorized (invalid or missing token)
- `500`: Server error

---

#### 2. Get All Events
**GET** `/`

Retrieve all events for the authenticated user with optional date range filtering.

**Query Parameters (Optional):**
- `startDate`: ISO 8601 datetime (e.g., `2024-01-01T00:00:00Z`)
- `endDate`: ISO 8601 datetime (e.g., `2024-01-31T23:59:59Z`)

**Examples:**
```
GET /api/events
GET /api/events?startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z
```

**Success Response (200):**
```json
{
  "events": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Team Meeting",
      "description": "Quarterly planning meeting",
      "start_time": "2024-01-15T14:00:00.000Z",
      "end_time": "2024-01-15T15:00:00.000Z",
      "color": "#667eea",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `401`: Unauthorized
- `500`: Server error

---

#### 3. Get Events for a Specific Day
**GET** `/day`

Retrieve all events for a specific day.

**Query Parameters:**
- `date`: ISO 8601 datetime (required, e.g., `2024-01-15`)

**Example:**
```
GET /api/events/day?date=2024-01-15
```

**Success Response (200):**
```json
{
  "events": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Team Meeting",
      "description": "Quarterly planning meeting",
      "start_time": "2024-01-15T14:00:00.000Z",
      "end_time": "2024-01-15T15:00:00.000Z",
      "color": "#667eea",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `400`: Missing date parameter
- `401`: Unauthorized
- `500`: Server error

---

#### 4. Get Events for a Specific Month
**GET** `/month`

Retrieve all events for a specific month.

**Query Parameters:**
- `year`: year (required, e.g., `2024`)
- `month`: month 1-12 (required, e.g., `1` for January)

**Example:**
```
GET /api/events/month?year=2024&month=1
```

**Success Response (200):**
```json
{
  "events": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Team Meeting",
      "start_time": "2024-01-15T14:00:00.000Z",
      "end_time": "2024-01-15T15:00:00.000Z",
      "color": "#667eea",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `400`: Missing year or month parameter
- `401`: Unauthorized
- `500`: Server error

---

#### 5. Update Event
**PUT** `/:id`

Update an existing event (user must own the event).

**Request Body:**
```json
{
  "title": "Updated Team Meeting",
  "description": "Updated description",
  "startTime": "2024-01-15T15:00:00Z",
  "endTime": "2024-01-15T16:00:00Z",
  "color": "#764ba2"
}
```

**Note:** All fields are optional. Only provided fields will be updated.

**Success Response (200):**
```json
{
  "message": "Event updated successfully.",
  "event": {
    "id": 1,
    "user_id": 1,
    "title": "Updated Team Meeting",
    "description": "Updated description",
    "start_time": "2024-01-15T15:00:00.000Z",
    "end_time": "2024-01-15T16:00:00.000Z",
    "color": "#764ba2",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T11:00:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Validation failed (invalid time range)
- `401`: Unauthorized
- `404`: Event not found
- `500`: Server error

---

#### 6. Delete Event
**DELETE** `/:id`

Delete an existing event (user must own the event).

**Success Response (200):**
```json
{
  "message": "Event deleted successfully."
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Event not found
- `500`: Server error

---

## JWT Token Format

All tokens follow the JWT standard and include the following payload:

```json
{
  "userId": 1,
  "iat": 1705324200,
  "exp": 1705929000
}
```

**Token Expiration:** 7 days from creation

---

## Error Status Codes

| Status | Meaning | Common Causes |
|--------|---------|---------------|
| 200 | OK | Successful request |
| 201 | Created | Resource successfully created |
| 400 | Bad Request | Missing/invalid parameters, validation failed |
| 401 | Unauthorized | Missing/invalid token, credentials invalid |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., user already exists) |
| 500 | Server Error | Database error, unexpected exception |

---

## Using Tokens in Requests

Once authenticated, include the token in all subsequent requests:

```
Authorization: Bearer <token>
```

### Example with cURL:
```bash
curl -X GET http://localhost:5000/api/events \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Example with JavaScript/Fetch:
```javascript
fetch('http://localhost:5000/api/events', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

---

## Full Authentication & Events Flow Example

1. **Register**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","email":"user@example.com","password":"Pass123","confirmPassword":"Pass123"}'
```

2. **Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Pass123"}'
```

3. **Create Event**
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token_from_login>" \
  -d '{
    "title":"Meeting",
    "startTime":"2024-01-15T14:00:00Z",
    "endTime":"2024-01-15T15:00:00Z"
  }'
```

4. **Get All Events**
```bash
curl -X GET http://localhost:5000/api/events \
  -H "Authorization: Bearer <token>"
```

5. **Get Events for Month**
```bash
curl -X GET "http://localhost:5000/api/events/month?year=2024&month=1" \
  -H "Authorization: Bearer <token>"
```

6. **Update Event**
```bash
curl -X PUT http://localhost:5000/api/events/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Updated Meeting"}'
```

7. **Delete Event**
```bash
curl -X DELETE http://localhost:5000/api/events/1 \
  -H "Authorization: Bearer <token>"
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User Preferences Table
```sql
CREATE TABLE user_preferences (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  theme_color VARCHAR(50),
  font_family VARCHAR(100),
  chatbot_icon VARCHAR(100),
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Events Table
```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  color VARCHAR(50),
  recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_start_time (start_time)
);
```

### Chatbot Conversations Table
```sql
CREATE TABLE chatbot_conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  user_message TEXT NOT NULL,
  bot_response TEXT,
  intent VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);
```

---

## Security Notes

- **Password Security:** All passwords are hashed using bcrypt with 10 salt rounds
- **JWT Secret:** Never expose your `JWT_SECRET` in the frontend or version control
- **CORS:** API is configured to accept requests only from `http://localhost:5173` (frontend)
- **Token Storage:** Tokens are stored in localStorage (consider using httpOnly cookies in production)
- **HTTPS:** Always use HTTPS in production

---

## Testing the API

### Using Postman:
1. Create a new request
2. Set method to POST and URL to `http://localhost:5000/api/auth/register`
3. Go to Body tab, select JSON, and paste:
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "TestPassword123",
  "confirmPassword": "TestPassword123"
}
```
4. Click Send
5. Copy the token from the response
6. For authenticated endpoints, add an Authorization header with value: `Bearer <token>`

---

