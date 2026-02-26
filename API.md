# Canvas GPA Tracker - API Documentation

Complete API reference for the Canvas GPA Tracker backend.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All requests (except `/health`) require the Canvas API to be initialized first via the `/init` endpoint.

---

## Endpoints

### System

#### Health Check
Check if the server is running.

```
GET /api/health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2024-02-26T10:30:00.000Z"
}
```

---

### Setup

#### Initialize Canvas Connection
Set up the connection to your Canvas instance.

```
POST /api/init
Content-Type: application/json

{
  "baseURL": "https://your-institution.instructure.com",
  "apiToken": "your_canvas_api_token_here"
}
```

**Response (200 OK):**
```json
{
  "status": "initialized",
  "message": "Canvas API initialized successfully"
}
```

**Error (400 Bad Request):**
```json
{
  "error": "Missing baseURL or apiToken"
}
```

**Error (500 Server Error):**
```json
{
  "error": "Connection failed - check credentials"
}
```

---

### GPA Data

#### Get Current GPA
Fetch the latest GPA calculation from Canvas.

```
GET /api/gpa/current
```

**Response (200 OK):**
```json
{
  "currentGPA": 3.75,
  "weightedGPA": 3.78,
  "courseCount": 4,
  "lastUpdated": "2024-02-26T10:30:00.000Z",
  "courses": [
    {
      "id": 123456,
      "name": "Introduction to Computer Science",
      "grade": 92.5,
      "gradePoint": 4.0,
      "letterGrade": "A+",
      "credits": 3
    },
    {
      "id": 123457,
      "name": "Calculus II",
      "grade": 87.3,
      "gradePoint": 3.8,
      "letterGrade": "A-",
      "credits": 4
    }
  ]
}
```

**Error (400 Bad Request):**
```json
{
  "error": "Canvas API not initialized. Please call /api/init first."
}
```

---

#### Get GPA History
Retrieve historical GPA data from the last N days.

```
GET /api/gpa/history?days=30
```

**Query Parameters:**
- `days` (integer, optional): Number of days to retrieve. Default: 30

**Response (200 OK):**
```json
{
  "days": 30,
  "entries": [
    {
      "timestamp": "2024-01-27T10:30:00.000Z",
      "gpa": 3.72,
      "weightedGPA": 3.75,
      "courseCount": 4,
      "courses": [...]
    },
    {
      "timestamp": "2024-02-26T10:30:00.000Z",
      "gpa": 3.75,
      "weightedGPA": 3.78,
      "courseCount": 4,
      "courses": [...]
    }
  ]
}
```

---

#### Get All GPA History
Retrieve all GPA history records (up to 100 snapshots).

```
GET /api/gpa/history/all
```

**Response (200 OK):**
```json
{
  "entries": [
    {
      "timestamp": "2024-02-26T10:30:00.000Z",
      "gpa": 3.75,
      "weightedGPA": 3.78,
      "courseCount": 4,
      "courses": [...]
    }
  ]
}
```

---

### Updates

#### Start Periodic Updates
Enable automatic GPA updates at the interval specified in `.env`.

```
POST /api/updates/start
```

**Response (200 OK):**
```json
{
  "status": "running",
  "message": "Periodic updates started"
}
```

**Error (400 Bad Request):**
```json
{
  "error": "Canvas API not initialized"
}
```

**Error (400 Bad Request if already running):**
```json
{
  "message": "Updates already running"
}
```

---

#### Stop Periodic Updates
Stop automatic GPA updates.

```
POST /api/updates/stop
```

**Response (200 OK):**
```json
{
  "status": "stopped",
  "message": "Periodic updates stopped"
}
```

---

#### Get Update Status
Check if periodic updates are running and when the last update occurred.

```
GET /api/updates/status
```

**Response (200 OK):**
```json
{
  "running": true,
  "lastUpdate": "2024-02-26T10:35:00.000Z"
}
```

---

### User

#### Get User Profile
Retrieve information about the authenticated Canvas user.

```
GET /api/user/profile
```

**Response (200 OK):**
```json
{
  "id": 12345,
  "name": "John Doe",
  "email": "john.doe@university.edu",
  "created_at": "2022-09-01T00:00:00Z",
  "locale": "en",
  "time_zone": "America/New_York",
  "avatar_url": "https://..."
}
```

**Error (400 Bad Request):**
```json
{
  "error": "Canvas API not initialized"
}
```

---

### Export

#### Export Grades to CSV
Download all grades in CSV format.

```
GET /api/export/csv
```

**Response (200 OK - CSV file):**
```
Course Name,Grade (%),Letter Grade,Grade Point
"Introduction to Computer Science",92.5,A+,4.0
"Calculus II",87.3,A-,3.8

GPA Summary
Current GPA,3.75
Weighted GPA,3.78
Course Count,2
```

**Headers Returned:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="grades.csv"
```

**Error (400 Bad Request):**
```json
{
  "error": "No GPA data available"
}
```

---

## Data Models

### GPA Data Object

```typescript
{
  currentGPA: number,           // Simple average GPA (0-4.0)
  weightedGPA: number,          // Weighted GPA (0-4.0)
  courseCount: number,          // Number of courses with grades
  lastUpdated: string,          // ISO 8601 timestamp
  courses: Course[]             // Array of course objects
}
```

### Course Object

```typescript
{
  id: number,                   // Canvas course ID
  name: string,                 // Course name
  grade: number,                // Percentage grade (0-100)
  gradePoint: number,           // GPA point (0-4.0)
  letterGrade: string,          // Letter grade (A+, A, A-, B+, etc.)
  credits: number               // Course weight/credits
}
```

### GPA Snapshot Object

```typescript
{
  timestamp: string,            // ISO 8601 timestamp
  gpa: number,                  // GPA at this timestamp
  weightedGPA: number,          // Weighted GPA at this timestamp
  courseCount: number,          // Number of courses
  courses: Course[]             // Course data at this timestamp
}
```

### Error Response

```typescript
{
  error: string                 // Human-readable error message
}
```

---

## Error Handling

All errors follow this pattern:

```json
{
  "error": "Description of what went wrong"
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Request successful |
| 400 | Bad request (missing data, not initialized) |
| 500 | Server error (Canvas API error, connection issue) |

---

## Rate Limiting

Canvas API has rate limits. The server uses these to prevent issues:

- **Minimum Update Interval**: 60 seconds recommended
- **Default Update Interval**: 300 seconds (5 minutes)
- **Max History Snapshots**: 100 (older ones are removed)

---

## Example Usage

### Complete Flow

1. **Initialize**
```bash
curl -X POST http://localhost:3000/api/init \
  -H "Content-Type: application/json" \
  -d '{
    "baseURL": "https://canvas.example.edu",
    "apiToken": "token123"
  }'
```

2. **Fetch Current GPA**
```bash
curl http://localhost:3000/api/gpa/current
```

3. **Start Auto-Updates**
```bash
curl -X POST http://localhost:3000/api/updates/start
```

4. **Export Grades**
```bash
curl http://localhost:3000/api/export/csv > grades.csv
```

---

## JavaScript Fetch Examples

### Initialize
```javascript
const response = await fetch('/api/init', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    baseURL: 'https://canvas.example.edu',
    apiToken: 'token123'
  })
});
const data = await response.json();
```

### Get Current GPA
```javascript
const response = await fetch('/api/gpa/current');
const gpaData = await response.json();
console.log(`Your GPA: ${gpaData.currentGPA}`);
```

### Get Recent History
```javascript
const response = await fetch('/api/gpa/history?days=7');
const history = await response.json();
console.log(`Entries: ${history.entries.length}`);
```

---

## Environment Variables

Configure behavior via `.env`:

```
CANVAS_BASE_URL=https://your-institution.instructure.com
CANVAS_API_TOKEN=your_token_here
PORT=3000
UPDATE_INTERVAL=300000
NODE_ENV=development
```

- **UPDATE_INTERVAL**: Milliseconds between automatic updates (minimum 60000)
- **PORT**: Server port (default 3000)
- **NODE_ENV**: Set to 'production' for deployment

---

## Webhook/Event Support

Currently, the application uses polling for updates. Future versions may support:
- Canvas webhooks for instant updates
- WebSocket connections for real-time data
- Email notifications for GPA changes

---

## Version

**API Version**: 1.0  
**Last Updated**: February 2024

For questions or feedback, refer to the main README.md
