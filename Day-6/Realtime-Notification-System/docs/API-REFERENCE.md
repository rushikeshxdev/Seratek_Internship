# API Reference

## Overview

The Real-time Notification System provides two APIs:
1. **REST API** - HTTP endpoints for creating and managing notifications
2. **WebSocket API** - Real-time bidirectional communication

## Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

## REST API

### Authentication

Currently, the API does not require authentication. For production, implement JWT or API key authentication.

### Content Type

All requests should use `Content-Type: application/json`

### Response Format

All responses follow this structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

---

## REST API Endpoints

### 1. Create Notification

Send a notification to a specific user or broadcast to all users.

**Endpoint**: `POST /notifications`

**Request Body**:
```json
{
  "userId": "user123",
  "title": "Hello",
  "message": "Welcome to our platform!",
  "type": "info",
  "broadcast": false
}
```

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | No* | Target user ID (*required if broadcast is false) |
| title | string | Yes | Notification title |
| message | string | Yes | Notification message |
| type | string | No | Notification type: `info`, `success`, `warning`, `error` (default: `info`) |
| broadcast | boolean | No | Send to all users (default: `false`) |

**Response** (User Online):
```json
{
  "success": true,
  "message": "Notification sent to user",
  "notification": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "user123",
    "title": "Hello",
    "message": "Welcome to our platform!",
    "type": "info",
    "read": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "delivered": true
}
```

**Response** (User Offline):
```json
{
  "success": true,
  "message": "Notification stored for offline user",
  "notification": { ... },
  "delivered": false
}
```

**Response** (Broadcast):
```json
{
  "success": true,
  "message": "Notification broadcasted to all users",
  "notification": { ... }
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "title": "Order Shipped",
    "message": "Your order #12345 has been shipped",
    "type": "success"
  }'
```

---

### 2. Get User Notifications

Retrieve all notifications for a specific user.

**Endpoint**: `GET /notifications/user/:userId`

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User ID (path parameter) |

**Response**:
```json
{
  "success": true,
  "userId": "user123",
  "count": 5,
  "notifications": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "user123",
      "title": "Order Shipped",
      "message": "Your order #12345 has been shipped",
      "type": "success",
      "read": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    ...
  ]
}
```

**Example**:
```bash
curl http://localhost:3000/notifications/user/user123
```

---

### 3. Get Pending Notifications

Retrieve unread notifications for a specific user.

**Endpoint**: `GET /notifications/user/:userId/pending`

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User ID (path parameter) |

**Response**:
```json
{
  "success": true,
  "userId": "user123",
  "count": 2,
  "notifications": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "user123",
      "title": "New Message",
      "message": "You have a new message",
      "type": "info",
      "read": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    ...
  ]
}
```

**Example**:
```bash
curl http://localhost:3000/notifications/user/user123/pending
```

---

### 4. Mark Notification as Read

Mark a specific notification as read.

**Endpoint**: `PATCH /notifications/user/:userId/:notificationId/read`

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User ID (path parameter) |
| notificationId | string | Yes | Notification ID (path parameter) |

**Response** (Success):
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

**Response** (Not Found):
```json
{
  "success": false,
  "message": "Notification not found"
}
```

**Example**:
```bash
curl -X PATCH http://localhost:3000/notifications/user/user123/507f1f77bcf86cd799439011/read
```

---

### 5. Mark All Notifications as Read

Mark all notifications for a user as read.

**Endpoint**: `PATCH /notifications/user/:userId/read-all`

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User ID (path parameter) |

**Response**:
```json
{
  "success": true,
  "message": "5 notifications marked as read",
  "count": 5
}
```

**Example**:
```bash
curl -X PATCH http://localhost:3000/notifications/user/user123/read-all
```

---

### 6. Clear All Notifications

Delete all notifications for a user.

**Endpoint**: `DELETE /notifications/user/:userId`

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User ID (path parameter) |

**Response**:
```json
{
  "success": true,
  "message": "All notifications cleared"
}
```

**Example**:
```bash
curl -X DELETE http://localhost:3000/notifications/user/user123
```

---

### 7. Get Statistics

Get system statistics (connected users count).

**Endpoint**: `GET /notifications/stats`

**Response**:
```json
{
  "success": true,
  "connectedUsers": 42,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Example**:
```bash
curl http://localhost:3000/notifications/stats
```

---

## WebSocket API

### Connection

**URL**: `ws://localhost:3000` or `wss://your-domain.com`

**Client Library**: Socket.IO Client

**Installation**:
```bash
npm install socket.io-client
```

**Connection Example**:
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});
```

---

## WebSocket Events

### Client → Server Events

#### 1. register

Register a user with their userId.

**Event**: `register`

**Payload**:
```javascript
{
  userId: "user123"
}
```

**Response Event**: `registered`

**Example**:
```javascript
socket.emit('register', { userId: 'user123' });

socket.on('registered', (data) => {
  console.log('Registered:', data.userId);
  console.log('Pending notifications:', data.pendingNotifications);
});
```

**Response Data**:
```javascript
{
  userId: "user123",
  message: "Successfully registered",
  pendingNotifications: [
    {
      _id: "507f1f77bcf86cd799439011",
      userId: "user123",
      title: "Welcome",
      message: "Welcome to our platform!",
      type: "info",
      read: false,
      createdAt: "2024-01-15T10:30:00.000Z"
    },
    ...
  ]
}
```

---

#### 2. sendNotification

Send a notification via WebSocket (alternative to REST API).

**Event**: `sendNotification`

**Payload**:
```javascript
{
  userId: "user456",
  title: "Hello",
  message: "Test notification",
  type: "info",
  broadcast: false
}
```

**Response**:
```javascript
{
  success: true,
  delivered: true
}
```

**Example**:
```javascript
socket.emit('sendNotification', {
  userId: 'user456',
  title: 'Hello',
  message: 'Test notification',
  type: 'info'
}, (response) => {
  console.log('Notification sent:', response);
});
```

---

#### 3. markAsRead

Mark a notification as read.

**Event**: `markAsRead`

**Payload**:
```javascript
{
  notificationId: "507f1f77bcf86cd799439011"
}
```

**Response**:
```javascript
{
  success: true
}
```

**Example**:
```javascript
socket.emit('markAsRead', {
  notificationId: '507f1f77bcf86cd799439011'
}, (response) => {
  console.log('Marked as read:', response.success);
});
```

---

#### 4. markAllAsRead

Mark all notifications as read for the current user.

**Event**: `markAllAsRead`

**Payload**: None

**Response**:
```javascript
{
  success: true,
  count: 5
}
```

**Example**:
```javascript
socket.emit('markAllAsRead', (response) => {
  console.log(`${response.count} notifications marked as read`);
});
```

---

#### 5. getNotifications

Get all notifications for the current user.

**Event**: `getNotifications`

**Payload**: None

**Response**:
```javascript
{
  success: true,
  notifications: [
    {
      _id: "507f1f77bcf86cd799439011",
      userId: "user123",
      title: "Welcome",
      message: "Welcome to our platform!",
      type: "info",
      read: false,
      createdAt: "2024-01-15T10:30:00.000Z"
    },
    ...
  ]
}
```

**Example**:
```javascript
socket.emit('getNotifications', (response) => {
  console.log('Notifications:', response.notifications);
});
```

---

### Server → Client Events

#### 1. notification

Receive a new notification.

**Event**: `notification`

**Payload**:
```javascript
{
  _id: "507f1f77bcf86cd799439011",
  userId: "user123",
  title: "New Message",
  message: "You have a new message",
  type: "info",
  read: false,
  createdAt: "2024-01-15T10:30:00.000Z",
  updatedAt: "2024-01-15T10:30:00.000Z"
}
```

**Example**:
```javascript
socket.on('notification', (notification) => {
  console.log('New notification:', notification.title);
  displayNotification(notification);
});
```

---

#### 2. registered

Confirmation of successful registration.

**Event**: `registered`

**Payload**:
```javascript
{
  userId: "user123",
  message: "Successfully registered",
  pendingNotifications: [ ... ]
}
```

**Example**:
```javascript
socket.on('registered', (data) => {
  console.log('Registration successful');
  data.pendingNotifications.forEach(displayNotification);
});
```

---

#### 3. connectedUsers

Update on the number of connected users.

**Event**: `connectedUsers`

**Payload**:
```javascript
{
  count: 42
}
```

**Example**:
```javascript
socket.on('connectedUsers', (data) => {
  console.log(`${data.count} users online`);
  updateUserCount(data.count);
});
```

---

### Connection Lifecycle Events

#### connect

Fired when connection is established.

**Example**:
```javascript
socket.on('connect', () => {
  console.log('Connected to server');
  console.log('Socket ID:', socket.id);
});
```

---

#### disconnect

Fired when connection is closed.

**Example**:
```javascript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  
  if (reason === 'io server disconnect') {
    // Server disconnected, manual reconnection needed
    socket.connect();
  }
});
```

---

#### reconnect

Fired when successfully reconnected.

**Example**:
```javascript
socket.on('reconnect', (attemptNumber) => {
  console.log(`Reconnected after ${attemptNumber} attempts`);
  
  // Re-register user
  const userId = localStorage.getItem('userId');
  if (userId) {
    socket.emit('register', { userId });
  }
});
```

---

#### reconnect_attempt

Fired on each reconnection attempt.

**Example**:
```javascript
socket.on('reconnect_attempt', (attemptNumber) => {
  console.log(`Reconnection attempt ${attemptNumber}...`);
});
```

---

#### reconnect_failed

Fired when all reconnection attempts fail.

**Example**:
```javascript
socket.on('reconnect_failed', () => {
  console.log('Reconnection failed');
  showError('Unable to connect to server');
});
```

---

#### connect_error

Fired when connection fails.

**Example**:
```javascript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});
```

---

## Error Handling

### REST API Errors

**400 Bad Request**:
```json
{
  "success": false,
  "message": "Invalid request data",
  "error": "userId is required"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "message": "Notification not found"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

### WebSocket Errors

**Registration Error**:
```javascript
socket.on('registered', (data) => {
  if (!data.success) {
    console.error('Registration failed:', data.error);
  }
});
```

**Connection Error**:
```javascript
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error.message);
});
```

---

## Rate Limiting

Currently, there is no rate limiting. For production, implement rate limiting:

**Recommended Limits**:
- REST API: 100 requests per minute per IP
- WebSocket: 10 events per second per connection

**Implementation Example** (using @nestjs/throttler):
```typescript
ThrottlerModule.forRoot({
  ttl: 60,
  limit: 100
})
```

---

## Data Models

### Notification Model

```typescript
interface Notification {
  _id: string;              // MongoDB ObjectId
  userId: string;           // User identifier
  title: string;            // Notification title
  message: string;          // Notification message
  type: NotificationType;   // Notification type
  read: boolean;            // Read status
  createdAt: Date;          // Creation timestamp
  updatedAt: Date;          // Last update timestamp
}

enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}
```

---

## Complete Integration Example

### JavaScript/TypeScript

```javascript
import io from 'socket.io-client';
import axios from 'axios';

const API_URL = 'http://localhost:3000';
const socket = io(API_URL);

// Connect and register
socket.on('connect', () => {
  console.log('Connected');
  socket.emit('register', { userId: 'user123' });
});

// Handle registration
socket.on('registered', (data) => {
  console.log('Registered:', data.userId);
  data.pendingNotifications.forEach(displayNotification);
});

// Listen for new notifications
socket.on('notification', (notification) => {
  displayNotification(notification);
  playSound();
});

// Send notification via REST API
async function sendNotification(userId, title, message, type = 'info') {
  try {
    const response = await axios.post(`${API_URL}/notifications`, {
      userId,
      title,
      message,
      type
    });
    console.log('Notification sent:', response.data);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

// Mark as read via WebSocket
function markAsRead(notificationId) {
  socket.emit('markAsRead', { notificationId }, (response) => {
    if (response.success) {
      console.log('Marked as read');
    }
  });
}

// Display notification
function displayNotification(notification) {
  const div = document.createElement('div');
  div.className = `notification ${notification.type}`;
  div.innerHTML = `
    <h4>${notification.title}</h4>
    <p>${notification.message}</p>
    <button onclick="markAsRead('${notification._id}')">Mark as Read</button>
  `;
  document.getElementById('notifications').appendChild(div);
}
```

---

## Testing with Postman

Import the provided `postman-collection.json` file for pre-configured API requests.

**Collection includes**:
1. Create Notification (User)
2. Create Notification (Broadcast)
3. Get User Notifications
4. Get Pending Notifications
5. Mark as Read
6. Mark All as Read
7. Clear Notifications
8. Get Statistics

---

## Testing with cURL

### Send Notification
```bash
curl -X POST http://localhost:3000/notifications \
  -H "Content-Type: application/json" \
  -d '{"userId":"user123","title":"Test","message":"Hello","type":"info"}'
```

### Get Notifications
```bash
curl http://localhost:3000/notifications/user/user123
```

### Mark as Read
```bash
curl -X PATCH http://localhost:3000/notifications/user/user123/507f1f77bcf86cd799439011/read
```

---

## WebSocket Testing

Use the provided `public/index.html` demo client for WebSocket testing.

**Features**:
- Connect/disconnect
- Register user
- Send notifications
- Display notifications
- Mark as read
- Connection status

---

## Best Practices

1. **Always handle errors**: Implement try-catch blocks
2. **Validate input**: Check userId, title, message before sending
3. **Handle reconnection**: Re-register user on reconnect
4. **Store userId**: Use localStorage for persistence
5. **Debounce requests**: Avoid spamming the server
6. **Show connection status**: Keep users informed
7. **Implement retry logic**: For failed REST API calls
8. **Use acknowledgments**: Confirm WebSocket events
9. **Clean up listeners**: Remove event listeners when done
10. **Test offline scenarios**: Ensure offline handling works

---

## Summary

The API provides:
- **7 REST endpoints** for notification management
- **5 WebSocket events** (client → server)
- **3 WebSocket events** (server → client)
- **6 lifecycle events** for connection management

Both APIs work together to provide a complete real-time notification solution.
