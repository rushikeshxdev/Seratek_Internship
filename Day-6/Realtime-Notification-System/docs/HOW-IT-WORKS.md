# How It Works

## Technical Deep Dive

This document explains the internal workings of the Real-time Notification System, from low-level protocols to high-level architecture.

## WebSocket Protocol Explained

### What is WebSocket?

WebSocket is a communication protocol that provides full-duplex (bidirectional) communication channels over a single TCP connection.

### HTTP vs WebSocket

#### Traditional HTTP Request-Response
```
Client                          Server
  │                               │
  ├─── GET /api/data ────────────►│
  │                               │
  │◄─── 200 OK + data ────────────┤
  │                               │
  │    [Connection Closed]        │
```

**Characteristics**:
- One-way: Client initiates
- Short-lived: Connection closes after response
- Overhead: New handshake for each request
- Stateless: No persistent connection

#### WebSocket Communication
```
Client                          Server
  │                               │
  ├─── HTTP Upgrade Request ─────►│
  │                               │
  │◄─── 101 Switching Protocols ──┤
  │                               │
  │◄────── Persistent Connection ─►│
  │                               │
  ├─── Message 1 ────────────────►│
  │◄─── Message 2 ─────────────────┤
  ├─── Message 3 ────────────────►│
  │◄─── Message 4 ─────────────────┤
  │                               │
  │    [Connection Stays Open]    │
```

**Characteristics**:
- Bidirectional: Both can initiate
- Long-lived: Connection stays open
- Low overhead: Single handshake
- Stateful: Persistent connection

### WebSocket Handshake Process

#### Step 1: Client Sends Upgrade Request
```http
GET /socket.io/?EIO=4&transport=websocket HTTP/1.1
Host: localhost:3000
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Origin: http://localhost:3000
```

**Key Headers**:
- `Upgrade: websocket` - Request protocol upgrade
- `Connection: Upgrade` - Connection should be upgraded
- `Sec-WebSocket-Key` - Random base64-encoded value
- `Sec-WebSocket-Version` - WebSocket protocol version (13)

#### Step 2: Server Responds with Upgrade
```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

**Key Headers**:
- `101 Switching Protocols` - Upgrade accepted
- `Sec-WebSocket-Accept` - Hash of client's key (for verification)

#### Step 3: WebSocket Connection Established
```
┌─────────────────────────────────────┐
│   WebSocket Connection Active       │
│   • Full-duplex communication       │
│   • Low latency (<100ms)            │
│   • Minimal overhead                │
└─────────────────────────────────────┘
```

### WebSocket Frame Structure

WebSocket messages are sent as frames:

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-------+-+-------------+-------------------------------+
|F|R|R|R| opcode|M| Payload len |    Extended payload length    |
|I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
|N|V|V|V|       |S|             |   (if payload len==126/127)   |
| |1|2|3|       |K|             |                               |
+-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
|     Extended payload length continued, if payload len == 127  |
+ - - - - - - - - - - - - - - - +-------------------------------+
|                               |Masking-key, if MASK set to 1  |
+-------------------------------+-------------------------------+
| Masking-key (continued)       |          Payload Data         |
+-------------------------------- - - - - - - - - - - - - - - - +
:                     Payload Data continued ...                :
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
|                     Payload Data continued ...                |
+---------------------------------------------------------------+
```

**Key Fields**:
- **FIN**: Final fragment (1 = complete message)
- **Opcode**: Frame type (1 = text, 2 = binary, 8 = close)
- **MASK**: Payload is masked (always 1 for client→server)
- **Payload len**: Length of payload data

## Socket.IO Internals

### What is Socket.IO?

Socket.IO is a library that provides:
1. WebSocket connection with fallback to HTTP long-polling
2. Automatic reconnection
3. Event-based API
4. Room and namespace support
5. Binary support

### Socket.IO Protocol Layers

```
┌─────────────────────────────────────┐
│   Application Layer                 │
│   (Your Code)                       │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│   Socket.IO Layer                   │
│   • Events                          │
│   • Rooms                           │
│   • Acknowledgments                 │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│   Engine.IO Layer                   │
│   • Transport management            │
│   • Heartbeat                       │
│   • Upgrade mechanism               │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│   Transport Layer                   │
│   • WebSocket                       │
│   • HTTP Long-Polling (fallback)    │
└─────────────────────────────────────┘
```

### Socket.IO Connection Process

#### 1. Initial HTTP Polling
```
Client                          Server
  │                               │
  ├─── GET /socket.io/?EIO=4 ────►│
  │     &transport=polling        │
  │                               │
  │◄─── 200 OK ────────────────────┤
  │     { sid: "abc123", ... }    │
  │                               │
```

**Why start with polling?**
- Some networks block WebSocket
- Ensures connection works before upgrade
- Provides session ID (sid)

#### 2. Upgrade to WebSocket
```
Client                          Server
  │                               │
  ├─── GET /socket.io/?EIO=4 ────►│
  │     &transport=websocket      │
  │     &sid=abc123               │
  │                               │
  │◄─── 101 Switching Protocols ──┤
  │                               │
  │◄────── WebSocket Active ──────►│
```

#### 3. Send Upgrade Confirmation
```
Client                          Server
  │                               │
  ├─── "2probe" ─────────────────►│
  │                               │
  │◄─── "3probe" ──────────────────┤
  │                               │
  ├─── "5" (upgrade) ────────────►│
  │                               │
  │    [Polling connection closed]│
  │    [WebSocket now primary]    │
```

### Socket.IO Packet Types

```
0 - CONNECT      // Connection established
1 - DISCONNECT   // Connection closed
2 - EVENT        // Custom event
3 - ACK          // Acknowledgment
4 - CONNECT_ERROR // Connection error
5 - BINARY_EVENT // Binary event
6 - BINARY_ACK   // Binary acknowledgment
```

### Event Emission

#### Client to Server
```javascript
// Client
socket.emit('register', { userId: 'user123' });

// Packet sent: 2["register",{"userId":"user123"}]
// 2 = EVENT packet type
// ["register", {...}] = event name and data
```

#### Server to Client
```typescript
// Server
client.emit('notification', { title: 'Hello', message: 'World' });

// Packet sent: 2["notification",{"title":"Hello","message":"World"}]
```

#### Broadcast to All
```typescript
// Server
this.server.emit('connectedUsers', { count: 10 });

// Sent to all connected clients
```

#### Send to Specific Client
```typescript
// Server
this.server.to(socketId).emit('notification', data);

// Sent only to client with matching socketId
```

## MongoDB Operations

### Document Storage

#### Creating a Notification
```typescript
// Service method
async createNotification(dto: CreateNotificationDto) {
  const notification = new this.notificationModel({
    userId: dto.userId,
    title: dto.title,
    message: dto.message,
    type: dto.type || NotificationType.INFO,
    read: false,
    createdAt: new Date()
  });

  return await notification.save();
}
```

**MongoDB Operation**:
```javascript
db.notifications.insertOne({
  userId: "user123",
  title: "Hello",
  message: "Welcome!",
  type: "info",
  read: false,
  createdAt: ISODate("2024-01-15T10:30:00Z")
})
```

**Result**:
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  userId: "user123",
  title: "Hello",
  message: "Welcome!",
  type: "info",
  read: false,
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z")
}
```

#### Querying Notifications

**Get Pending (Unread) Notifications**:
```typescript
async getPendingNotifications(userId: string) {
  return await this.notificationModel
    .find({ userId, read: false })
    .sort({ createdAt: -1 })
    .exec();
}
```

**MongoDB Query**:
```javascript
db.notifications.find({
  userId: "user123",
  read: false
}).sort({ createdAt: -1 })
```

**Query Execution**:
1. Use index: `{ userId: 1, read: 1 }`
2. Filter documents matching criteria
3. Sort by createdAt descending
4. Return results

**Performance**: O(log n) due to index

#### Updating Notifications

**Mark as Read**:
```typescript
async markAsRead(userId: string, notificationId: string) {
  const result = await this.notificationModel
    .updateOne(
      { _id: notificationId, userId },
      { read: true }
    )
    .exec();
  
  return result.modifiedCount > 0;
}
```

**MongoDB Operation**:
```javascript
db.notifications.updateOne(
  { _id: ObjectId("507f1f77bcf86cd799439011"), userId: "user123" },
  { $set: { read: true, updatedAt: new Date() } }
)
```

### Indexing Strategy

#### Compound Index: userId + read
```javascript
NotificationSchema.index({ userId: 1, read: 1 });
```

**Purpose**: Fast queries for pending notifications

**Query Optimization**:
```
Without Index: O(n) - Scan all documents
With Index: O(log n) - Binary search in index
```

**Example**:
- 1 million notifications
- Without index: ~1,000,000 comparisons
- With index: ~20 comparisons

#### Compound Index: userId + createdAt
```javascript
NotificationSchema.index({ userId: 1, createdAt: -1 });
```

**Purpose**: Fast queries for user's notification history

**Supports Queries**:
```javascript
// Get all notifications for user, sorted by date
db.notifications.find({ userId: "user123" }).sort({ createdAt: -1 })

// Get recent notifications
db.notifications.find({ 
  userId: "user123", 
  createdAt: { $gte: lastWeek } 
})
```

## Real-time Notification Delivery

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  1. REST API Request                                            │
│     POST /notifications                                         │
│     { userId, title, message, type }                            │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. Controller receives request                                 │
│     NotificationController.createNotification()                 │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. Service creates notification                                │
│     NotificationService.createNotification()                    │
│     • Validate data                                             │
│     • Create Mongoose document                                  │
│     • Save to MongoDB                                           │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. MongoDB stores notification                                 │
│     db.notifications.insertOne(...)                             │
│     • Assign _id                                                │
│     • Add timestamps                                            │
│     • Return document                                           │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. Check if user is online                                     │
│     NotificationService.getSocketId(userId)                     │
│     • Lookup in connectedUsers Map                              │
│     • Returns socketId or undefined                             │
└─────────────┬───────────────────────────────────────────────────┘
              │
        ┌─────┴─────┐
        │           │
        ▼           ▼
    [Online]    [Offline]
        │           │
        │           └──► Notification stored, will be delivered on connect
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. Gateway sends to user                                       │
│     NotificationGateway.sendNotificationToUser()                │
│     • Get socketId from service                                 │
│     • Emit 'notification' event to socket                       │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│  7. Socket.IO delivers message                                  │
│     server.to(socketId).emit('notification', data)              │
│     • Serialize data to JSON                                    │
│     • Create Socket.IO packet                                   │
│     • Send via WebSocket                                        │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│  8. Client receives notification                                │
│     socket.on('notification', callback)                         │
│     • Parse JSON data                                           │
│     • Trigger callback                                          │
│     • Update UI                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Timing Analysis

**Total Latency Breakdown**:
```
1. HTTP Request:           ~10ms
2. Controller Processing:  ~1ms
3. Service Logic:          ~2ms
4. MongoDB Write:          ~5-10ms
5. User Lookup:            ~0.1ms (in-memory Map)
6. Socket.IO Emit:         ~1ms
7. WebSocket Delivery:     ~5-20ms (network)
8. Client Processing:      ~1ms
─────────────────────────────────
Total:                     ~25-45ms
```

**Comparison**:
- HTTP Polling (5s interval): 2500ms average latency
- WebSocket: 25-45ms latency
- **Improvement**: 50-100x faster

## Offline Notification Storage

### The Problem

User is offline when notification is sent. How do we ensure they receive it?

### The Solution: Store and Forward

```
┌─────────────────────────────────────────────────────────────────┐
│  Notification Created                                           │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Always Save to MongoDB First                                   │
│  • Ensures durability                                           │
│  • No data loss                                                 │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Check if User Online                                           │
│  connectedUsers.has(userId)                                     │
└─────────────┬───────────────────────────────────────────────────┘
              │
        ┌─────┴─────┐
        │           │
        ▼           ▼
    [Online]    [Offline]
        │           │
        │           └──► Done (notification stored)
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  Deliver via WebSocket                                          │
│  server.to(socketId).emit('notification', data)                 │
└─────────────────────────────────────────────────────────────────┘
```

### Retrieval on Connection

```
┌─────────────────────────────────────────────────────────────────┐
│  User Connects                                                  │
│  socket.on('connect')                                           │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│  User Registers                                                 │
│  socket.emit('register', { userId })                            │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Server Fetches Pending                                         │
│  getPendingNotifications(userId)                                │
│  • Query: { userId, read: false }                               │
│  • Sort: { createdAt: -1 }                                      │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Send All Pending at Once                                       │
│  socket.emit('registered', { pendingNotifications })            │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Client Displays All                                            │
│  data.pendingNotifications.forEach(display)                     │
└─────────────────────────────────────────────────────────────────┘
```

## Auto-Reconnection Mechanism

### Socket.IO Reconnection Logic

```javascript
const socket = io('http://localhost:3000', {
  reconnection: true,              // Enable
  reconnectionDelay: 1000,         // Start with 1s
  reconnectionDelayMax: 5000,      // Max 5s
  reconnectionAttempts: 5          // Try 5 times
});
```

### Reconnection Algorithm

```
Connection Lost
      │
      ▼
Wait reconnectionDelay (1s)
      │
      ▼
Attempt 1
      │
  ┌───┴───┐
  │       │
Success  Fail
  │       │
  │       ▼
  │   Wait (delay × 2, max 5s)
  │       │
  │       ▼
  │   Attempt 2
  │       │
  │   ┌───┴───┐
  │   │       │
  │ Success  Fail
  │   │       │
  │   │       ... (repeat)
  │   │       │
  │   │       ▼
  │   │   Attempt 5
  │   │       │
  │   │   ┌───┴───┐
  │   │   │       │
  │   │ Success  Fail
  │   │   │       │
  │   │   │       ▼
  │   │   │   Give Up
  │   │   │   emit('reconnect_failed')
  │   │   │
  └───┴───┴───► Connected
              emit('reconnect')
```

### Exponential Backoff

```
Attempt 1: Wait 1s
Attempt 2: Wait 2s (1s × 2)
Attempt 3: Wait 4s (2s × 2)
Attempt 4: Wait 5s (4s × 2, capped at max)
Attempt 5: Wait 5s (capped at max)
```

**Why exponential backoff?**
- Reduces server load during outage
- Gives network time to recover
- Prevents thundering herd problem

## Browser localStorage Usage

### Storing User ID

```javascript
// On registration
const userId = document.getElementById('userId').value;
localStorage.setItem('userId', userId);

// On page load
const userId = localStorage.getItem('userId');
if (userId) {
  socket.emit('register', { userId });
}
```

### Storing Notifications (Optional)

```javascript
// Cache notifications for offline access
socket.on('notification', (notification) => {
  // Display notification
  displayNotification(notification);
  
  // Store in localStorage
  const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
  stored.unshift(notification);
  localStorage.setItem('notifications', JSON.stringify(stored.slice(0, 100)));
});

// Load on page load
const cachedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
cachedNotifications.forEach(displayNotification);
```

**Benefits**:
- Instant display on page load
- Works offline
- Reduces server queries

**Limitations**:
- 5-10MB storage limit
- Not synchronized across devices
- Can become stale

## Event-Driven Architecture

### Event Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  Event Emitter (Client/Server)                                  │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Socket.IO Event System                                         │
│  • Event name                                                   │
│  • Event data                                                   │
│  • Callback (optional)                                          │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Event Listener (Server/Client)                                 │
│  socket.on('eventName', callback)                               │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Callback Execution                                             │
│  • Process data                                                 │
│  • Update state                                                 │
│  • Emit response (optional)                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Event Types in Our System

#### Client → Server Events
```javascript
'register'           // Register user
'sendNotification'   // Send notification
'markAsRead'         // Mark as read
'markAllAsRead'      // Mark all as read
'getNotifications'   // Get all notifications
```

#### Server → Client Events
```javascript
'notification'       // New notification
'registered'         // Registration confirmation
'connectedUsers'     // User count update
```

#### Lifecycle Events
```javascript
'connect'            // Connection established
'disconnect'         // Connection closed
'reconnect'          // Reconnected
'reconnect_attempt'  // Reconnection attempt
'reconnect_failed'   // Reconnection failed
'connect_error'      // Connection error
```

## Performance Characteristics

### Memory Usage

**Per Connection**:
- Socket object: ~10KB
- User mapping: ~100 bytes
- Event listeners: ~1KB
- Total: ~11KB per connection

**1000 Concurrent Users**:
- Memory: ~11MB
- CPU: Minimal (event-driven)
- Network: ~1KB/s per user (heartbeat)

### Database Performance

**Write Operations**:
- Create notification: ~5-10ms
- Update notification: ~3-5ms

**Read Operations**:
- Get pending (indexed): ~2-5ms
- Get all (indexed): ~5-10ms

**Scalability**:
- 1000 notifications/second: Easy
- 10,000 notifications/second: Requires optimization
- 100,000 notifications/second: Requires sharding

### Network Performance

**WebSocket Overhead**:
- Frame header: 2-14 bytes
- Payload: Variable
- Total: Minimal compared to HTTP

**HTTP vs WebSocket**:
```
HTTP Request:
  Headers: ~500 bytes
  Body: ~100 bytes
  Total: ~600 bytes per request

WebSocket Message:
  Frame: ~10 bytes
  Payload: ~100 bytes
  Total: ~110 bytes per message

Savings: 82% less bandwidth
```

## Summary

The Real-time Notification System works by:

1. **WebSocket Protocol**: Persistent bidirectional connection
2. **Socket.IO**: Event-based API with automatic reconnection
3. **MongoDB**: Persistent storage with indexing
4. **Store and Forward**: Offline notification handling
5. **Event-Driven**: Decoupled, scalable architecture

This combination provides:
- **Low latency**: <50ms notification delivery
- **Reliability**: No lost notifications
- **Scalability**: Thousands of concurrent users
- **Simplicity**: Clean, maintainable code
