# Troubleshooting Guide

## Common Issues and Solutions

This guide covers common problems you might encounter and how to resolve them.

---

## Connection Issues

### Issue 1: Cannot Connect to Server

**Symptoms**:
- Client shows "Disconnected" status
- Console error: "Connection failed"
- No response from server

**Possible Causes**:
1. Server not running
2. Wrong server URL
3. Firewall blocking connection
4. CORS issues

**Solutions**:

#### Check if Server is Running
```bash
# Check if server is running
curl http://localhost:3000

# Expected response: HTML page or API response
```

#### Verify Server URL
```javascript
// Make sure URL is correct
const socket = io('http://localhost:3000'); // ✅ Correct
const socket = io('localhost:3000');        // ❌ Wrong (missing protocol)
const socket = io('http://localhost:3001'); // ❌ Wrong port
```

#### Check Firewall
```bash
# Windows: Allow port 3000
netsh advfirewall firewall add rule name="Node Server" dir=in action=allow protocol=TCP localport=3000

# Linux: Allow port 3000
sudo ufw allow 3000
```

#### Fix CORS Issues
```typescript
// src/main.ts
app.enableCors({
  origin: '*', // Allow all origins (development only)
  credentials: true
});

// For production, specify allowed origins:
app.enableCors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  credentials: true
});
```

---

### Issue 2: Connection Timeout

**Symptoms**:
- Connection takes too long
- Eventually fails with timeout error

**Possible Causes**:
1. Network latency
2. Server overloaded
3. DNS resolution issues

**Solutions**:

#### Increase Timeout
```javascript
const socket = io('http://localhost:3000', {
  timeout: 20000 // Increase to 20 seconds
});
```

#### Use IP Address Instead of Hostname
```javascript
// Instead of
const socket = io('http://myserver.com:3000');

// Try
const socket = io('http://192.168.1.100:3000');
```

#### Check Server Load
```bash
# Check CPU and memory usage
top

# Check Node.js process
ps aux | grep node
```

---

### Issue 3: Frequent Disconnections

**Symptoms**:
- Connection drops repeatedly
- Constant reconnection attempts

**Possible Causes**:
1. Unstable network
2. Server restarts
3. Load balancer issues
4. Proxy timeout

**Solutions**:

#### Adjust Reconnection Settings
```javascript
const socket = io('http://localhost:3000', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity // Keep trying
});
```

#### Implement Heartbeat
```javascript
// Client-side: Send periodic ping
setInterval(() => {
  if (socket.connected) {
    socket.emit('ping');
  }
}, 25000); // Every 25 seconds

// Server-side: Respond to ping
@SubscribeMessage('ping')
handlePing() {
  return { pong: true };
}
```

#### Check Proxy Settings
```nginx
# Nginx configuration for WebSocket
location /socket.io/ {
  proxy_pass http://localhost:3000;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_set_header Host $host;
  proxy_cache_bypass $http_upgrade;
  proxy_read_timeout 86400; # 24 hours
}
```

---

## MongoDB Connection Issues

### Issue 4: Cannot Connect to MongoDB

**Symptoms**:
- Server fails to start
- Error: "MongooseServerSelectionError"
- Error: "connect ECONNREFUSED"

**Possible Causes**:
1. MongoDB not running
2. Wrong connection string
3. Network issues
4. Authentication failure

**Solutions**:

#### Check if MongoDB is Running
```bash
# Local MongoDB
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# MongoDB Atlas: Check cluster status in dashboard
```

#### Verify Connection String
```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/notification-system

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/notification-system

# Common mistakes:
# ❌ Missing database name
# ❌ Wrong username/password
# ❌ Special characters not URL-encoded
```

#### URL-Encode Special Characters
```javascript
// If password contains special characters
const password = 'p@ssw0rd!';
const encoded = encodeURIComponent(password); // p%40ssw0rd%21

const uri = `mongodb+srv://user:${encoded}@cluster.mongodb.net/dbname`;
```

#### Check Network Access (MongoDB Atlas)
1. Go to MongoDB Atlas dashboard
2. Click "Network Access"
3. Add your IP address or use `0.0.0.0/0` (allow all)

#### Test Connection
```bash
# Test MongoDB connection
mongosh "mongodb://localhost:27017/notification-system"

# Test MongoDB Atlas connection
mongosh "mongodb+srv://username:password@cluster.mongodb.net/notification-system"
```

---

### Issue 5: Slow Database Queries

**Symptoms**:
- Notifications take long to load
- High database CPU usage
- Timeout errors

**Possible Causes**:
1. Missing indexes
2. Large dataset
3. Inefficient queries

**Solutions**:

#### Add Indexes
```typescript
// notification.schema.ts
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });

// Verify indexes in MongoDB
db.notifications.getIndexes()
```

#### Limit Query Results
```typescript
// Get only recent notifications
async getPendingNotifications(userId: string) {
  return await this.notificationModel
    .find({ userId, read: false })
    .sort({ createdAt: -1 })
    .limit(100) // Limit to 100 most recent
    .exec();
}
```

#### Use Pagination
```typescript
async getNotifications(userId: string, page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;
  
  return await this.notificationModel
    .find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
}
```

#### Clean Up Old Notifications
```typescript
// Add TTL index to auto-delete old notifications
NotificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 2592000 } // 30 days
);
```

---

## Registration Issues

### Issue 6: User Not Receiving Notifications

**Symptoms**:
- User is online but doesn't receive notifications
- Other users receive notifications fine

**Possible Causes**:
1. User not registered
2. Wrong userId
3. Socket disconnected

**Solutions**:

#### Verify Registration
```javascript
// Client-side: Check registration status
let isRegistered = false;

socket.on('registered', (data) => {
  isRegistered = true;
  console.log('Registered as:', data.userId);
});

// Before sending notification, check registration
if (!isRegistered) {
  console.error('User not registered');
  socket.emit('register', { userId: 'user123' });
}
```

#### Check userId Consistency
```javascript
// Make sure userId is consistent
const userId = 'user123'; // ✅ Consistent

// ❌ Inconsistent
socket.emit('register', { userId: 'user123' });
// Later...
sendNotification('User123'); // Different case!
```

#### Debug Server-Side
```typescript
// notification.service.ts
registerUser(userId: string, socketId: string): void {
  console.log(`Registering: ${userId} → ${socketId}`);
  this.connectedUsers.set(userId, socketId);
  console.log('Connected users:', Array.from(this.connectedUsers.keys()));
}

getSocketId(userId: string): string | undefined {
  const socketId = this.connectedUsers.get(userId);
  console.log(`Looking up ${userId}: ${socketId || 'NOT FOUND'}`);
  return socketId;
}
```

---

### Issue 7: Duplicate Registrations

**Symptoms**:
- User receives notifications multiple times
- Multiple socket connections for same user

**Possible Causes**:
1. Multiple tabs open
2. Not cleaning up on disconnect
3. Reconnection without cleanup

**Solutions**:

#### Handle Multiple Connections
```typescript
// notification.service.ts
private connectedUsers: Map<string, Set<string>> = new Map();

registerUser(userId: string, socketId: string): void {
  if (!this.connectedUsers.has(userId)) {
    this.connectedUsers.set(userId, new Set());
  }
  this.connectedUsers.get(userId).add(socketId);
}

unregisterUser(userId: string, socketId: string): void {
  const sockets = this.connectedUsers.get(userId);
  if (sockets) {
    sockets.delete(socketId);
    if (sockets.size === 0) {
      this.connectedUsers.delete(userId);
    }
  }
}

sendToUser(userId: string, event: string, data: any): void {
  const sockets = this.connectedUsers.get(userId);
  if (sockets) {
    sockets.forEach(socketId => {
      this.server.to(socketId).emit(event, data);
    });
  }
}
```

#### Prevent Multiple Registrations
```javascript
// Client-side: Register only once
let hasRegistered = false;

socket.on('connect', () => {
  if (!hasRegistered) {
    socket.emit('register', { userId: 'user123' });
  }
});

socket.on('registered', () => {
  hasRegistered = true;
});

socket.on('disconnect', () => {
  hasRegistered = false;
});
```

---

## Notification Delivery Issues

### Issue 8: Notifications Not Stored for Offline Users

**Symptoms**:
- Offline users don't receive notifications when they come online
- Pending notifications array is empty

**Possible Causes**:
1. Database write failure
2. Wrong userId
3. Query error

**Solutions**:

#### Verify Database Write
```typescript
// notification.service.ts
async createNotification(dto: CreateNotificationDto) {
  try {
    const notification = new this.notificationModel({
      userId: dto.userId,
      title: dto.title,
      message: dto.message,
      type: dto.type || NotificationType.INFO,
      read: false,
      createdAt: new Date()
    });

    const saved = await notification.save();
    console.log('Notification saved:', saved._id);
    return saved;
  } catch (error) {
    console.error('Failed to save notification:', error);
    throw error;
  }
}
```

#### Check Pending Query
```typescript
async getPendingNotifications(userId: string) {
  console.log('Fetching pending for:', userId);
  
  const notifications = await this.notificationModel
    .find({ userId, read: false })
    .sort({ createdAt: -1 })
    .exec();
  
  console.log(`Found ${notifications.length} pending notifications`);
  return notifications;
}
```

#### Verify in MongoDB
```bash
# Connect to MongoDB
mongosh

# Use database
use notification-system

# Check notifications
db.notifications.find({ userId: "user123", read: false })
```

---

### Issue 9: Broadcast Not Working

**Symptoms**:
- Broadcast notifications not received by all users
- Only some users receive broadcast

**Possible Causes**:
1. Users not connected
2. Wrong emit method
3. Room/namespace issues

**Solutions**:

#### Use Correct Broadcast Method
```typescript
// ❌ Wrong: Sends to all except sender
socket.broadcast.emit('notification', data);

// ✅ Correct: Sends to all including sender
this.server.emit('notification', data);
```

#### Check Connected Users
```typescript
// Get all connected socket IDs
const sockets = await this.server.fetchSockets();
console.log(`Broadcasting to ${sockets.length} connected clients`);

this.server.emit('notification', data);
```

#### Debug Broadcast
```typescript
// Server-side
broadcastNotification(notification: any) {
  console.log('Broadcasting notification:', notification.title);
  
  const sockets = this.server.sockets.sockets;
  console.log(`Connected sockets: ${sockets.size}`);
  
  this.server.emit('notification', notification);
}

// Client-side
socket.on('notification', (notification) => {
  console.log('Received broadcast:', notification.title);
});
```

---

## Performance Issues

### Issue 10: High Memory Usage

**Symptoms**:
- Server memory keeps increasing
- Eventually crashes with "Out of Memory"

**Possible Causes**:
1. Memory leaks
2. Too many stored connections
3. Large notification payloads

**Solutions**:

#### Monitor Memory
```javascript
// Add memory monitoring
setInterval(() => {
  const used = process.memoryUsage();
  console.log('Memory usage:', {
    rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`
  });
}, 60000); // Every minute
```

#### Clean Up Disconnected Users
```typescript
handleDisconnect(client: Socket) {
  const userId = client.data.userId;
  if (userId) {
    this.notificationService.unregisterUser(userId);
  }
  
  // Force garbage collection (if enabled)
  if (global.gc) {
    global.gc();
  }
}
```

#### Limit Notification Size
```typescript
async createNotification(dto: CreateNotificationDto) {
  // Limit message length
  if (dto.message.length > 1000) {
    dto.message = dto.message.substring(0, 997) + '...';
  }
  
  // Limit title length
  if (dto.title.length > 100) {
    dto.title = dto.title.substring(0, 97) + '...';
  }
  
  return await this.notificationModel.create(dto);
}
```

---

### Issue 11: Slow Notification Delivery

**Symptoms**:
- Notifications take several seconds to arrive
- Lag between send and receive

**Possible Causes**:
1. Network latency
2. Database slow
3. Too many concurrent operations

**Solutions**:

#### Optimize Database Operations
```typescript
// Use lean() for faster queries
async getPendingNotifications(userId: string) {
  return await this.notificationModel
    .find({ userId, read: false })
    .sort({ createdAt: -1 })
    .lean() // Returns plain JavaScript objects
    .exec();
}
```

#### Batch Operations
```typescript
// Instead of multiple updates
for (const id of notificationIds) {
  await markAsRead(id); // Slow
}

// Use bulk update
await this.notificationModel.updateMany(
  { _id: { $in: notificationIds } },
  { read: true }
);
```

#### Add Caching
```typescript
import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getPendingNotifications(userId: string) {
    const cacheKey = `pending:${userId}`;
    
    // Check cache
    let notifications = await this.cacheManager.get(cacheKey);
    
    if (!notifications) {
      // Cache miss: fetch from database
      notifications = await this.notificationModel
        .find({ userId, read: false })
        .exec();
      
      // Store in cache for 5 minutes
      await this.cacheManager.set(cacheKey, notifications, 300);
    }
    
    return notifications;
  }
}
```

---

## CORS Issues

### Issue 12: CORS Policy Blocking Requests

**Symptoms**:
- Browser console error: "CORS policy"
- Requests fail with CORS error
- WebSocket connection blocked

**Possible Causes**:
1. CORS not enabled
2. Wrong origin configuration
3. Missing credentials

**Solutions**:

#### Enable CORS
```typescript
// src/main.ts
app.enableCors({
  origin: '*', // Allow all (development only)
  credentials: true
});
```

#### Configure Specific Origins
```typescript
// Production configuration
app.enableCors({
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'https://app.yourdomain.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
```

#### WebSocket CORS
```typescript
// notification.gateway.ts
@WebSocketGateway({
  cors: {
    origin: '*', // Or specific origins
    credentials: true
  }
})
export class NotificationGateway { ... }
```

---

## Deployment Issues

### Issue 13: WebSocket Not Working in Production

**Symptoms**:
- Works locally but not in production
- Connection fails after deployment
- Falls back to polling

**Possible Causes**:
1. Load balancer not configured for WebSocket
2. Proxy not forwarding WebSocket
3. SSL/TLS issues

**Solutions**:

#### Configure Load Balancer (AWS ALB)
```yaml
# Enable sticky sessions
Stickiness: Enabled
Stickiness Duration: 86400 seconds
```

#### Configure Nginx
```nginx
location /socket.io/ {
  proxy_pass http://localhost:3000;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_set_header Host $host;
  proxy_cache_bypass $http_upgrade;
}
```

#### Use WSS (Secure WebSocket)
```javascript
// Client-side: Use wss:// for HTTPS sites
const socket = io('https://yourdomain.com', {
  transports: ['websocket', 'polling']
});
```

---

### Issue 14: Environment Variables Not Loading

**Symptoms**:
- Server uses default values
- MongoDB connection fails
- Port conflicts

**Possible Causes**:
1. .env file not loaded
2. Wrong file location
3. Deployment platform not configured

**Solutions**:

#### Verify .env File
```bash
# Check if .env exists
ls -la .env

# Check contents
cat .env
```

#### Load Environment Variables
```typescript
// app.module.ts
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env' // Specify path
})
```

#### Platform-Specific Configuration

**Heroku**:
```bash
heroku config:set MONGODB_URI="mongodb+srv://..."
heroku config:set NODE_ENV=production
```

**Railway**:
Add variables in dashboard → Variables tab

**Vercel**:
Add variables in dashboard → Settings → Environment Variables

---

## Debugging Tips

### Enable Debug Logging

#### Server-Side
```typescript
// main.ts
if (process.env.NODE_ENV === 'development') {
  app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);
}
```

#### Client-Side
```javascript
// Enable Socket.IO debug logs
localStorage.debug = 'socket.io-client:*';

// Reload page to see logs
```

### Use Browser DevTools

1. **Network Tab**: Check WebSocket connection
2. **Console Tab**: View errors and logs
3. **Application Tab**: Check localStorage

### Monitor Server Logs

```bash
# Development
npm run start:dev

# Production
pm2 logs

# Heroku
heroku logs --tail

# Railway
railway logs
```

### Test with Postman

Use the provided Postman collection to test REST API endpoints independently.

---

## Getting Help

### Before Asking for Help

1. Check this troubleshooting guide
2. Review error messages carefully
3. Check server and client logs
4. Test with the demo client
5. Verify environment variables
6. Try with a fresh database

### Where to Get Help

1. **GitHub Issues**: Report bugs and request features
2. **Stack Overflow**: Tag with `nestjs`, `socket.io`, `mongodb`
3. **NestJS Discord**: Community support
4. **MongoDB Forums**: Database-specific issues

### Information to Provide

When asking for help, include:
1. Error messages (full stack trace)
2. Server logs
3. Client console logs
4. Environment (OS, Node version, npm version)
5. Steps to reproduce
6. What you've already tried

---

## Summary

Most issues fall into these categories:
1. **Connection**: Check server, URL, CORS, firewall
2. **MongoDB**: Verify connection string, indexes, queries
3. **Registration**: Ensure consistent userId, proper cleanup
4. **Delivery**: Check online status, database writes
5. **Performance**: Optimize queries, add caching, limit data
6. **Deployment**: Configure load balancer, environment variables

Always check logs first, test locally, and verify configuration before deploying to production.
