# Connection Workflow

## WebSocket Connection Lifecycle

The WebSocket connection goes through several distinct phases from initial connection to disconnection. Understanding this lifecycle is crucial for building reliable real-time applications.

```
┌─────────────┐
│   INITIAL   │
│   STATE     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  PHASE 1: CONNECTION ESTABLISHMENT                      │
│  • TCP handshake                                        │
│  • HTTP upgrade request                                 │
│  • WebSocket handshake                                  │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  PHASE 2: REGISTRATION                                  │
│  • Client sends userId                                  │
│  • Server maps userId → socketId                        │
│  • Server fetches pending notifications                 │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  PHASE 3: ACTIVE COMMUNICATION                          │
│  • Bidirectional message exchange                       │
│  • Real-time notification delivery                      │
│  • Event handling                                       │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  PHASE 4: DISCONNECTION                                 │
│  • Connection closed (intentional or network issue)     │
│  • Server cleanup                                       │
│  • Client reconnection attempt                          │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────┐
│   ENDED     │
└─────────────┘
```

## Phase 1: Connection Establishment

### Step-by-Step Process

#### Step 1: Client Initiates Connection

```javascript
// Client-side code
const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling'], // Try WebSocket first
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

console.log('Attempting to connect...');
```

#### Step 2: TCP Handshake

```
Client                                    Server
  │                                         │
  ├─── SYN ──────────────────────────────►│
  │                                         │
  │◄─── SYN-ACK ───────────────────────────┤
  │                                         │
  ├─── ACK ──────────────────────────────►│
  │                                         │
  │         TCP Connection Established      │
```

#### Step 3: HTTP Upgrade Request

```http
GET /socket.io/?EIO=4&transport=websocket HTTP/1.1
Host: localhost:3000
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Origin: http://localhost:3000
```

#### Step 4: Server Upgrade Response

```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

#### Step 5: WebSocket Connection Established

```javascript
// Server-side: NestJS Gateway
@WebSocketGateway({
  cors: { origin: '*' }
})
export class NotificationGateway implements OnGatewayConnection {
  
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    
    // Emit connection count to all clients
    this.server.emit('connectedUsers', {
      count: this.notificationService.getConnectedUsersCount()
    });
  }
}
```

```javascript
// Client-side: Connection event
socket.on('connect', () => {
  console.log('Connected to server!');
  console.log('Socket ID:', socket.id);
  connectionStatus.textContent = 'Connected';
  connectionStatus.className = 'status connected';
});
```

### Connection Sequence Diagram

```
Client                          Server                      Service
  │                               │                           │
  ├─── io.connect() ─────────────►│                           │
  │                               │                           │
  │                               ├─── handleConnection() ───►│
  │                               │                           │
  │                               │◄─── getConnectedCount() ──┤
  │                               │                           │
  │◄─── 'connect' event ──────────┤                           │
  │                               │                           │
  │◄─── 'connectedUsers' ─────────┤                           │
  │     { count: 1 }              │                           │
  │                               │                           │
  │     [Connection Established]  │                           │
```

## Phase 2: Registration Flow

### Why Registration is Needed

WebSocket connections are identified by `socketId` (e.g., `abc123xyz`), but our application needs to know which user (e.g., `user@example.com`) is connected. Registration creates this mapping.

### Registration Process

#### Step 1: Client Sends Registration

```javascript
// Client-side
const userId = document.getElementById('userId').value;

socket.emit('register', { userId });

console.log(`Registering as: ${userId}`);
```

#### Step 2: Server Processes Registration

```typescript
// Server-side: notification.gateway.ts
@SubscribeMessage('register')
async handleRegister(
  @MessageBody() data: { userId: string },
  @ConnectedSocket() client: Socket,
) {
  const { userId } = data;
  
  // 1. Store userId in socket data
  client.data.userId = userId;
  
  // 2. Register in service (userId → socketId mapping)
  this.notificationService.registerUser(userId, client.id);
  
  // 3. Fetch pending notifications
  const pendingNotifications = 
    await this.notificationService.getPendingNotifications(userId);
  
  // 4. Send confirmation with pending notifications
  client.emit('registered', {
    userId,
    message: 'Successfully registered',
    pendingNotifications
  });
  
  console.log(`User registered: ${userId} with socket ${client.id}`);
  
  return { 
    success: true, 
    pendingCount: pendingNotifications.length 
  };
}
```

#### Step 3: Service Updates Mapping

```typescript
// notification.service.ts
private connectedUsers: Map<string, string> = new Map();

registerUser(userId: string, socketId: string): void {
  this.connectedUsers.set(userId, socketId);
  console.log(`Registered: ${userId} → ${socketId}`);
  console.log(`Total connected users: ${this.connectedUsers.size}`);
}
```

#### Step 4: Fetch Pending Notifications

```typescript
// notification.service.ts
async getPendingNotifications(userId: string): Promise<NotificationDocument[]> {
  return await this.notificationModel
    .find({ 
      userId, 
      read: false 
    })
    .sort({ createdAt: -1 })
    .exec();
}
```

#### Step 5: Client Receives Confirmation

```javascript
// Client-side
socket.on('registered', (data) => {
  console.log('Registration successful!');
  console.log('User ID:', data.userId);
  console.log('Pending notifications:', data.pendingNotifications.length);
  
  // Display pending notifications
  data.pendingNotifications.forEach(notification => {
    displayNotification(notification);
  });
  
  registrationStatus.textContent = `Registered as: ${data.userId}`;
});
```

### Registration Sequence Diagram

```
Client                    Gateway                   Service                 MongoDB
  │                         │                         │                       │
  ├─── register(userId) ───►│                         │                       │
  │                         │                         │                       │
  │                         ├─── client.data.userId = userId                  │
  │                         │                         │                       │
  │                         ├─── registerUser() ─────►│                       │
  │                         │                         ├─── Map.set(userId, socketId)
  │                         │                         │                       │
  │                         ├─── getPending() ───────►│                       │
  │                         │                         ├─── find() ───────────►│
  │                         │                         │◄─── notifications ────┤
  │                         │◄─── notifications ──────┤                       │
  │                         │                         │                       │
  │◄─── registered ─────────┤                         │                       │
  │     + pending[]         │                         │                       │
  │                         │                         │                       │
  │     [Registration Complete]                       │                       │
```

## Phase 3: Active Communication

### Message Flow Patterns

#### Pattern 1: Client-to-Server Event

```javascript
// Client sends event
socket.emit('markAsRead', { 
  notificationId: '507f1f77bcf86cd799439011' 
});
```

```typescript
// Server handles event
@SubscribeMessage('markAsRead')
async handleMarkAsRead(
  @MessageBody() data: { notificationId: string },
  @ConnectedSocket() client: Socket,
) {
  const userId = client.data.userId;
  const success = await this.notificationService.markAsRead(
    userId, 
    data.notificationId
  );
  return { success };
}
```

#### Pattern 2: Server-to-Client Event (Unicast)

```typescript
// Server sends to specific user
const socketId = this.notificationService.getSocketId(userId);
if (socketId) {
  this.server.to(socketId).emit('notification', notification);
}
```

```javascript
// Client receives
socket.on('notification', (data) => {
  displayNotification(data);
});
```

#### Pattern 3: Server-to-All Event (Broadcast)

```typescript
// Server broadcasts to all
this.server.emit('notification', notification);
```

```javascript
// All clients receive
socket.on('notification', (data) => {
  displayNotification(data);
});
```

### Notification Delivery Workflow

#### Scenario 1: User Online

```
REST Client              Controller              Gateway              Service              MongoDB
    │                       │                       │                    │                    │
    ├─── POST /notify ─────►│                       │                    │                    │
    │   { userId, title,    │                       │                    │                    │
    │     message, type }   │                       │                    │                    │
    │                       │                       │                    │                    │
    │                       ├─── createNotification() ──────────────────►│                    │
    │                       │                       │                    ├─── save() ────────►│
    │                       │                       │                    │◄─── doc ───────────┤
    │                       │◄─── notification ─────────────────────────┤                    │
    │                       │                       │                    │                    │
    │                       ├─── sendToUser() ─────►│                    │                    │
    │                       │                       ├─── getSocketId() ─►│                    │
    │                       │                       │◄─── socketId ──────┤                    │
    │                       │                       │                    │                    │
    │                       │                       ├─── emit('notification') ───────────────►│
    │                       │                       │                    │              [WebSocket Client]
    │                       │                       │                    │                    │
    │◄─── 200 OK ───────────┤                       │                    │                    │
    │   { success: true,    │                       │                    │                    │
    │     delivered: true } │                       │                    │                    │
```

#### Scenario 2: User Offline

```
REST Client              Controller              Service              MongoDB
    │                       │                       │                    │
    ├─── POST /notify ─────►│                       │                    │
    │   { userId, title,    │                       │                    │
    │     message, type }   │                       │                    │
    │                       │                       │                    │
    │                       ├─── createNotification() ──────────────────►│
    │                       │                       ├─── save() ────────►│
    │                       │                       │◄─── doc ───────────┤
    │                       │◄─── notification ─────┤                    │
    │                       │                       │                    │
    │                       ├─── getSocketId() ────►│                    │
    │                       │◄─── undefined ────────┤                    │
    │                       │                       │                    │
    │◄─── 200 OK ───────────┤                       │                    │
    │   { success: true,    │                       │                    │
    │     delivered: false, │                       │                    │
    │     stored: true }    │                       │                    │
    │                       │                       │                    │
    │     [Notification stored, will be delivered when user connects]    │
```

#### Scenario 3: Broadcast to All Users

```
REST Client              Controller              Gateway              All Clients
    │                       │                       │                    │
    ├─── POST /notify ─────►│                       │                    │
    │   { broadcast: true,  │                       │                    │
    │     title, message }  │                       │                    │
    │                       │                       │                    │
    │                       ├─── createNotification() ──────────────────►│
    │                       │◄─── notification ─────────────────────────┤
    │                       │                       │                    │
    │                       ├─── broadcast() ───────►│                    │
    │                       │                       ├─── emit('notification') ──►│
    │                       │                       │                    │
    │◄─── 200 OK ───────────┤                       │                    │
    │   { success: true,    │                       │                    │
    │     broadcast: true } │                       │                    │
```

### Mark as Read Workflow

```
Client                    Gateway                   Service                 MongoDB
  │                         │                         │                       │
  ├─── markAsRead() ───────►│                         │                       │
  │   { notificationId }    │                         │                       │
  │                         │                         │                       │
  │                         ├─── client.data.userId   │                       │
  │                         │                         │                       │
  │                         ├─── markAsRead() ───────►│                       │
  │                         │                         ├─── updateOne() ──────►│
  │                         │                         │   { _id, userId },    │
  │                         │                         │   { read: true }      │
  │                         │                         │◄─── result ───────────┤
  │                         │◄─── success ────────────┤                       │
  │                         │                         │                       │
  │◄─── { success: true } ──┤                         │                       │
  │                         │                         │                       │
  │     [Notification marked as read]                 │                       │
```

### Get All Notifications Workflow

```
Client                    Gateway                   Service                 MongoDB
  │                         │                         │                       │
  ├─── getNotifications() ─►│                         │                       │
  │                         │                         │                       │
  │                         ├─── client.data.userId   │                       │
  │                         │                         │                       │
  │                         ├─── getAllNotifications()►│                       │
  │                         │                         ├─── find() ───────────►│
  │                         │                         │   { userId }          │
  │                         │                         │   .sort({ createdAt: -1 })
  │                         │                         │◄─── notifications ────┤
  │                         │◄─── notifications ──────┤                       │
  │                         │                         │                       │
  │◄─── { success: true, ───┤                         │                       │
  │      notifications[] }  │                         │                       │
  │                         │                         │                       │
  │     [All notifications retrieved]                 │                       │
```

## Phase 4: Disconnection Handling

### Disconnect Scenarios

#### Scenario 1: Intentional Disconnect

```javascript
// Client-side
socket.disconnect();
```

#### Scenario 2: Network Failure

```
Client ─────X─────► Server
      (connection lost)
```

#### Scenario 3: Server Shutdown

```
Server shutting down...
All connections closed
```

### Server-Side Disconnect Handling

```typescript
// notification.gateway.ts
handleDisconnect(client: Socket) {
  console.log(`Client disconnected: ${client.id}`);
  
  // 1. Get userId from socket data
  const userId = client.data.userId;
  
  // 2. Unregister user if registered
  if (userId) {
    this.notificationService.unregisterUser(userId);
    console.log(`Unregistered user: ${userId}`);
  }
  
  // 3. Broadcast updated user count
  this.server.emit('connectedUsers', {
    count: this.notificationService.getConnectedUsersCount()
  });
}
```

```typescript
// notification.service.ts
unregisterUser(userId: string): void {
  this.connectedUsers.delete(userId);
  console.log(`Unregistered: ${userId}`);
  console.log(`Remaining users: ${this.connectedUsers.size}`);
}
```

### Client-Side Disconnect Handling

```javascript
// Client-side
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  connectionStatus.textContent = 'Disconnected';
  connectionStatus.className = 'status disconnected';
  
  if (reason === 'io server disconnect') {
    // Server disconnected, manual reconnection needed
    socket.connect();
  }
  // Otherwise, Socket.IO will auto-reconnect
});
```

### Disconnect Sequence Diagram

```
Client                    Gateway                   Service
  │                         │                         │
  │─────X Connection Lost   │                         │
  │                         │                         │
  │                         ├─── handleDisconnect() ─►│
  │                         │                         │
  │                         │   userId = client.data.userId
  │                         │                         │
  │                         ├─── unregisterUser() ───►│
  │                         │                         ├─── Map.delete(userId)
  │                         │                         │
  │                         ├─── getConnectedCount() ►│
  │                         │◄─── count ──────────────┤
  │                         │                         │
  │                         ├─── emit('connectedUsers')
  │                         │     to all clients      │
  │                         │                         │
  │     [User unregistered, cleanup complete]         │
```

## Reconnection Mechanism

### Automatic Reconnection

Socket.IO automatically attempts to reconnect when connection is lost.

```javascript
// Client configuration
const socket = io('http://localhost:3000', {
  reconnection: true,              // Enable auto-reconnection
  reconnectionDelay: 1000,         // Wait 1s before first attempt
  reconnectionDelayMax: 5000,      // Max wait 5s between attempts
  reconnectionAttempts: 5,         // Try 5 times
  timeout: 20000                   // Connection timeout
});
```

### Reconnection Events

```javascript
// Reconnection attempt
socket.on('reconnect_attempt', (attemptNumber) => {
  console.log(`Reconnection attempt ${attemptNumber}...`);
  connectionStatus.textContent = `Reconnecting (${attemptNumber})...`;
});

// Reconnection failed
socket.on('reconnect_failed', () => {
  console.log('Reconnection failed after all attempts');
  connectionStatus.textContent = 'Connection failed';
  connectionStatus.className = 'status error';
});

// Successfully reconnected
socket.on('reconnect', (attemptNumber) => {
  console.log(`Reconnected after ${attemptNumber} attempts`);
  connectionStatus.textContent = 'Reconnected';
  connectionStatus.className = 'status connected';
  
  // Re-register user
  const userId = localStorage.getItem('userId');
  if (userId) {
    socket.emit('register', { userId });
  }
});
```

### Reconnection Flow

```
┌─────────────────────────────────────────────────────────┐
│  Connection Lost                                        │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Wait reconnectionDelay (1s)                            │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Attempt 1: Try to reconnect                            │
└──────┬──────────────────────────────────────────────────┘
       │
       ├─── Success ───► Connected ───► Re-register
       │
       ▼ Failure
┌─────────────────────────────────────────────────────────┐
│  Wait (delay × 2, max 5s)                               │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Attempt 2: Try to reconnect                            │
└──────┬──────────────────────────────────────────────────┘
       │
       ├─── Success ───► Connected ───► Re-register
       │
       ▼ Failure
       │
       ... (repeat up to 5 attempts)
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  All attempts failed                                    │
│  Emit 'reconnect_failed' event                          │
└─────────────────────────────────────────────────────────┘
```

### Re-registration After Reconnection

```javascript
// Client-side: Auto re-register after reconnection
socket.on('reconnect', () => {
  const userId = localStorage.getItem('userId');
  if (userId) {
    console.log('Re-registering after reconnection...');
    socket.emit('register', { userId });
  }
});

socket.on('registered', (data) => {
  console.log('Re-registration successful!');
  
  // Display any notifications received while offline
  if (data.pendingNotifications.length > 0) {
    console.log(`Received ${data.pendingNotifications.length} notifications while offline`);
    data.pendingNotifications.forEach(displayNotification);
  }
});
```

## Complete Connection Lifecycle Example

```javascript
// Complete client implementation
const socket = io('http://localhost:3000', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

// Phase 1: Connection
socket.on('connect', () => {
  console.log('✓ Connected');
  updateStatus('connected');
  
  // Phase 2: Registration
  const userId = localStorage.getItem('userId') || prompt('Enter your user ID:');
  localStorage.setItem('userId', userId);
  socket.emit('register', { userId });
});

socket.on('registered', (data) => {
  console.log('✓ Registered as:', data.userId);
  console.log('✓ Pending notifications:', data.pendingNotifications.length);
  
  // Display pending notifications
  data.pendingNotifications.forEach(displayNotification);
});

// Phase 3: Active Communication
socket.on('notification', (notification) => {
  console.log('✓ New notification:', notification.title);
  displayNotification(notification);
  playSound();
});

socket.on('connectedUsers', (data) => {
  console.log('✓ Connected users:', data.count);
  updateUserCount(data.count);
});

// Phase 4: Disconnection
socket.on('disconnect', (reason) => {
  console.log('✗ Disconnected:', reason);
  updateStatus('disconnected');
});

socket.on('reconnect_attempt', (attempt) => {
  console.log(`↻ Reconnecting (attempt ${attempt})...`);
  updateStatus('reconnecting');
});

socket.on('reconnect', (attempt) => {
  console.log(`✓ Reconnected after ${attempt} attempts`);
  updateStatus('connected');
});

socket.on('reconnect_failed', () => {
  console.log('✗ Reconnection failed');
  updateStatus('failed');
});

// Error handling
socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

## Best Practices

### 1. Always Handle Reconnection
```javascript
// Store userId for re-registration
localStorage.setItem('userId', userId);

// Re-register on reconnect
socket.on('reconnect', () => {
  const userId = localStorage.getItem('userId');
  if (userId) socket.emit('register', { userId });
});
```

### 2. Provide User Feedback
```javascript
// Show connection status
socket.on('connect', () => showStatus('Connected', 'green'));
socket.on('disconnect', () => showStatus('Disconnected', 'red'));
socket.on('reconnect_attempt', (n) => showStatus(`Reconnecting (${n})`, 'orange'));
```

### 3. Handle Errors Gracefully
```javascript
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error.message);
  showError('Unable to connect to server');
});
```

### 4. Clean Up on Page Unload
```javascript
window.addEventListener('beforeunload', () => {
  socket.disconnect();
});
```

### 5. Validate User Input
```typescript
// Server-side validation
@SubscribeMessage('register')
async handleRegister(@MessageBody() data: { userId: string }) {
  if (!data.userId || data.userId.trim() === '') {
    return { success: false, error: 'Invalid userId' };
  }
  // ... rest of logic
}
```

## Troubleshooting Connection Issues

### Issue 1: Connection Timeout
**Symptom**: Client can't connect
**Solution**: Check firewall, CORS settings, server running

### Issue 2: Frequent Disconnections
**Symptom**: Connection drops repeatedly
**Solution**: Check network stability, increase timeout

### Issue 3: Registration Fails
**Symptom**: User not receiving notifications
**Solution**: Verify userId is sent, check server logs

### Issue 4: Notifications Not Delivered
**Symptom**: User online but no notifications
**Solution**: Verify registration, check socketId mapping

### Issue 5: Reconnection Fails
**Symptom**: Can't reconnect after disconnect
**Solution**: Check reconnection settings, server availability

## Summary

The connection workflow consists of four main phases:

1. **Connection Establishment**: TCP handshake, HTTP upgrade, WebSocket handshake
2. **Registration**: Map userId to socketId, fetch pending notifications
3. **Active Communication**: Bidirectional message exchange, real-time delivery
4. **Disconnection**: Cleanup, automatic reconnection attempts

Understanding this workflow is essential for building reliable real-time applications and debugging connection issues.
