# 🔔 Real-time Notification System

A complete real-time notification system built with NestJS and WebSocket (Socket.IO) that enables instant push notifications to users with offline message storage and delivery.

## 📋 Features

- ✅ Real-time bidirectional communication using WebSocket
- ✅ User-specific notifications
- ✅ Broadcast notifications to all connected users
- ✅ Offline notification storage and delivery
- ✅ Mark notifications as read (individual or all)
- ✅ REST API endpoints for notification management
- ✅ MongoDB database with Mongoose ODM
- ✅ Indexed queries for optimal performance
- ✅ Connection status tracking
- ✅ Interactive HTML client with beautiful UI
- ✅ Browser notification support
- ✅ CORS enabled for cross-origin requests

## 🏗️ Architecture

### Project Structure

```
src/
├── main.ts                          # Application entry point
├── app.module.ts                    # Root module with MongoDB config
├── app.controller.ts                # Root controller
├── app.service.ts                   # Root service
└── notification/
    ├── notification.module.ts       # Notification module
    ├── notification.gateway.ts      # WebSocket gateway
    ├── notification.service.ts      # Business logic with MongoDB
    ├── notification.controller.ts   # REST API endpoints
    ├── dto/
    │   └── create-notification.dto.ts  # Data transfer objects
    ├── entities/
    │   └── notification.entity.ts   # Notification model (legacy)
    └── schemas/
        └── notification.schema.ts   # Mongoose schema

public/
└── index.html                       # HTML client interface
```

### Architecture Components

1. **WebSocket Gateway**: Handles real-time connections and events
2. **Notification Service**: Manages notification storage with MongoDB and user sessions
3. **REST Controller**: Provides HTTP endpoints for notification operations
4. **MongoDB Database**: Persistent storage with indexed queries
5. **Mongoose ODM**: Object modeling and schema validation
6. **HTML Client**: Interactive web interface for testing

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

### MongoDB Setup

#### Option 1: Local MongoDB Installation

1. **Install MongoDB Community Edition**:
   - **macOS**: `brew install mongodb-community`
   - **Ubuntu**: Follow [official guide](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)
   - **Windows**: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

2. **Start MongoDB**:
   ```bash
   # macOS/Linux
   brew services start mongodb-community
   # or
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

3. **Verify MongoDB is running**:
   ```bash
   mongosh
   # Should connect to mongodb://localhost:27017
   ```

#### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/notification-system`)
4. Update `.env` file with your connection string

### Installation

1. Navigate to the project directory:
```bash
cd Day-6/Realtime-Notification-System
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (or copy from `.env.example`):
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/notification-system
PORT=3000
```

For MongoDB Atlas, use:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/notification-system?retryWrites=true&w=majority
PORT=3000
```

### Running the Application

#### Development Mode
```bash
npm run start:dev
```

#### Production Mode
```bash
npm run build
npm run start:prod
```

The server will start on:
- HTTP Server: `http://localhost:3000`
- WebSocket Server: `ws://localhost:3000`

### Access the Client

Open your browser and navigate to:
```
http://localhost:3000
```

## 📡 API Documentation

### REST API Endpoints

#### 1. Create Notification
```http
POST /notifications
Content-Type: application/json

{
  "userId": "user123",
  "title": "New Message",
  "message": "You have a new message",
  "type": "info",
  "broadcast": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent to user",
  "notification": {
    "id": "notif_1234567890_abc123",
    "userId": "user123",
    "title": "New Message",
    "message": "You have a new message",
    "type": "info",
    "read": false,
    "createdAt": "2024-01-01T12:00:00.000Z"
  },
  "delivered": true
}
```

#### 2. Get User Notifications
```http
GET /notifications/user/:userId
```

**Response:**
```json
{
  "success": true,
  "userId": "user123",
  "count": 5,
  "notifications": [...]
}
```

#### 3. Get Pending Notifications
```http
GET /notifications/user/:userId/pending
```

#### 4. Mark Notification as Read
```http
PATCH /notifications/user/:userId/:notificationId/read
```

#### 5. Mark All as Read
```http
PATCH /notifications/user/:userId/read-all
```

#### 6. Clear All Notifications
```http
DELETE /notifications/user/:userId
```

#### 7. Get Statistics
```http
GET /notifications/stats
```

**Response:**
```json
{
  "success": true,
  "connectedUsers": 3,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### 8. Health Check
```http
GET /health
```

### WebSocket Events

#### Client → Server Events

##### 1. Register User
```javascript
socket.emit('register', { userId: 'user123' });
```

**Response:**
```javascript
socket.on('registered', (data) => {
  // data: { userId, message, pendingNotifications }
});
```

##### 2. Send Notification
```javascript
socket.emit('sendNotification', {
  userId: 'user456',
  title: 'Hello',
  message: 'Test notification',
  type: 'info',
  broadcast: false
});
```

##### 3. Mark as Read
```javascript
socket.emit('markAsRead', { notificationId: 'notif_123' });
```

##### 4. Mark All as Read
```javascript
socket.emit('markAllAsRead');
```

##### 5. Get Notifications
```javascript
socket.emit('getNotifications');
```

#### Server → Client Events

##### 1. Notification Received
```javascript
socket.on('notification', (notification) => {
  console.log('New notification:', notification);
});
```

##### 2. Registration Confirmation
```javascript
socket.on('registered', (data) => {
  console.log('Registered:', data);
});
```

##### 3. Connected Users Update
```javascript
socket.on('connectedUsers', (data) => {
  console.log('Connected users:', data.count);
});
```

## 🎯 Usage Examples

### Example 1: Send Notification via REST API

```bash
curl -X POST http://localhost:3000/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "title": "Welcome",
    "message": "Welcome to our platform!",
    "type": "success"
  }'
```

### Example 2: Broadcast Notification

```bash
curl -X POST http://localhost:3000/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "title": "System Maintenance",
    "message": "System will be down for maintenance",
    "type": "warning",
    "broadcast": true
  }'
```

### Example 3: WebSocket Client (JavaScript)

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

// Register user
socket.on('connect', () => {
  socket.emit('register', { userId: 'user123' });
});

// Listen for notifications
socket.on('notification', (notification) => {
  console.log('Received:', notification);
});

// Send notification
socket.emit('sendNotification', {
  userId: 'user456',
  title: 'Hello',
  message: 'Test message',
  type: 'info'
});
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/notification-system

# Server port
PORT=3000
```

### MongoDB Indexes

The system automatically creates indexes for optimal query performance:

- `userId + read`: For fetching unread notifications
- `userId + createdAt`: For sorting notifications by date

### CORS Configuration

CORS is enabled by default in `main.ts`:

```typescript
app.enableCors({
  origin: '*',
  credentials: true,
});
```

### WebSocket Configuration

WebSocket gateway configuration in `notification.gateway.ts`:

```typescript
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
```

## 📊 Notification Types

The system supports four notification types:

- `info` - Informational messages (blue)
- `success` - Success messages (green)
- `warning` - Warning messages (orange)
- `error` - Error messages (red)

## 🔐 Security Considerations

For production deployment, consider:

1. **Authentication**: Add JWT or session-based authentication
2. **Authorization**: Verify users can only access their notifications
3. **Rate Limiting**: Prevent notification spam
4. **CORS**: Restrict origins to trusted domains
5. **Input Validation**: Add validation pipes for DTOs
6. **MongoDB Security**: 
   - Use authentication (username/password)
   - Enable SSL/TLS for connections
   - Whitelist IP addresses
   - Use MongoDB Atlas for managed security

## 🧪 Testing the System

### Test Scenario 1: Single User Notifications

1. Open the HTML client in browser
2. Enter user ID (e.g., "user123") and click "Connect"
3. In another tab, send a notification via REST API to "user123"
4. Notification appears in real-time

### Test Scenario 2: Broadcast Notifications

1. Open multiple browser tabs with different user IDs
2. Send a broadcast notification
3. All connected users receive the notification

### Test Scenario 3: Offline Notifications

1. Send notification to offline user via REST API
2. User connects later
3. Pending notifications are delivered automatically

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Problem**: Cannot connect to MongoDB

**Solutions**:
1. Verify MongoDB is running: `mongosh` or `mongo`
2. Check connection string in `.env` file
3. For MongoDB Atlas:
   - Verify IP whitelist includes your IP
   - Check username/password are correct
   - Ensure network access is configured

**Problem**: "MongooseServerSelectionError"

**Solutions**:
1. Check if MongoDB service is running
2. Verify port 27017 is not blocked by firewall
3. Try connecting with `mongosh mongodb://localhost:27017`

### WebSocket Connection Issues

**Problem**: WebSocket not connecting

**Solutions**:
1. Check if server is running on correct port
2. Verify CORS settings allow your origin
3. Check browser console for errors

### Installation Issues

**Problem**: npm install fails

**Solutions**:
1. Clear npm cache: `npm cache clean --force`
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install` again
4. Ensure Node.js version is 16 or higher

## 🛠️ Technology Stack

- **NestJS** - Progressive Node.js framework
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB** - NoSQL database for persistent storage
- **Mongoose** - Elegant MongoDB object modeling
- **TypeScript** - Type-safe JavaScript
- **Express** - HTTP server
- **HTML/CSS/JavaScript** - Client interface

## 📝 Future Enhancements

- [ ] User authentication and authorization
- [ ] Notification templates
- [ ] Email/SMS fallback for offline users
- [ ] Notification preferences and filtering
- [ ] Push notifications for mobile devices
- [ ] Notification history and analytics
- [ ] Multi-channel delivery (email, SMS, push)
- [ ] Notification scheduling
- [ ] Read receipts and delivery status
- [ ] Notification expiration and cleanup
- [ ] Advanced query filters and pagination

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT License

## 👨‍💻 Author

Built with ❤️ using NestJS and Socket.IO

---

**Happy Coding! 🚀**
