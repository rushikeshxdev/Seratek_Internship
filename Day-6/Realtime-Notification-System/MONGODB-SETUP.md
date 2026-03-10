# MongoDB Integration Setup Guide

This guide will help you set up MongoDB for the Real-time Notification System.

## 📦 What Changed?

The notification system has been upgraded from in-memory storage to MongoDB with Mongoose ODM:

### New Dependencies
- `@nestjs/mongoose` - NestJS integration for Mongoose
- `@nestjs/config` - Environment variable management
- `mongoose` - MongoDB object modeling

### New Files
- `src/notification/schemas/notification.schema.ts` - Mongoose schema definition
- `.env` - Environment configuration
- `.env.example` - Environment template

### Modified Files
- `package.json` - Added MongoDB dependencies
- `src/app.module.ts` - Added ConfigModule and MongooseModule
- `src/notification/notification.module.ts` - Added Mongoose feature module
- `src/notification/notification.service.ts` - Replaced in-memory Map with MongoDB operations
- `src/notification/notification.gateway.ts` - Updated to handle async operations
- `src/notification/notification.controller.ts` - Updated to handle async operations
- `src/main.ts` - Added environment variable support
- `README.md` - Added MongoDB setup instructions

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

This will install:
- `@nestjs/mongoose@^10.0.0`
- `@nestjs/config@^3.0.0`
- `mongoose@^7.3.1`

### Step 2: Setup MongoDB

Choose one of the following options:

#### Option A: Local MongoDB

1. **Install MongoDB**:
   ```bash
   # macOS
   brew install mongodb-community
   
   # Ubuntu
   sudo apt-get install mongodb
   
   # Windows - Download from mongodb.com
   ```

2. **Start MongoDB**:
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Ubuntu
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

3. **Verify it's running**:
   ```bash
   mongosh
   # Should connect to mongodb://localhost:27017
   ```

#### Option B: MongoDB Atlas (Cloud - Free Tier Available)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database user password

### Step 3: Configure Environment

The `.env` file has already been created with default values:

```env
MONGODB_URI=mongodb://localhost:27017/notification-system
PORT=3000
```

**For MongoDB Atlas**, update the `.env` file:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/notification-system?retryWrites=true&w=majority
PORT=3000
```

### Step 4: Run the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

You should see:
```
🚀 Server is running on http://localhost:3000
🔌 WebSocket server is ready on ws://localhost:3000
📦 MongoDB connected to mongodb://localhost:27017/notification-system
```

## 🔍 Verify MongoDB Integration

### Check Database Connection

1. Open MongoDB shell:
   ```bash
   mongosh
   ```

2. Switch to the notification database:
   ```javascript
   use notification-system
   ```

3. Check collections:
   ```javascript
   show collections
   // Should show: notifications
   ```

### Test Notification Storage

1. Send a test notification:
   ```bash
   curl -X POST http://localhost:3000/notifications \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "test123",
       "title": "Test",
       "message": "Testing MongoDB storage",
       "type": "info"
     }'
   ```

2. Verify in MongoDB:
   ```javascript
   db.notifications.find().pretty()
   ```

## 📊 MongoDB Schema

The notification schema includes:

```typescript
{
  userId: String (required, indexed)
  title: String (required)
  message: String (required)
  type: String (enum: info, success, warning, error)
  read: Boolean (default: false, indexed)
  createdAt: Date (default: now, indexed)
}
```

### Indexes
- `{ userId: 1, read: 1 }` - For fetching unread notifications
- `{ userId: 1, createdAt: -1 }` - For sorting by date

## 🔄 Migration from In-Memory Storage

### What's Preserved
✅ All WebSocket functionality
✅ Real-time notifications
✅ Broadcast notifications
✅ User connection tracking (still in-memory)
✅ All REST API endpoints
✅ Same API contracts

### What's Changed
✅ Notifications persist across server restarts
✅ Better query performance with indexes
✅ Scalable storage solution
✅ All service methods are now async

### Breaking Changes
⚠️ Notification IDs are now MongoDB ObjectIds (instead of custom generated IDs)
⚠️ All service methods return Promises

## 🐛 Troubleshooting

### Error: "MongooseServerSelectionError"

**Cause**: Cannot connect to MongoDB

**Solutions**:
1. Check if MongoDB is running: `mongosh`
2. Verify connection string in `.env`
3. Check firewall settings
4. For Atlas: verify IP whitelist

### Error: "Cannot find module '@nestjs/mongoose'"

**Cause**: Dependencies not installed

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Authentication failed"

**Cause**: Wrong MongoDB credentials

**Solutions**:
1. Verify username/password in connection string
2. For Atlas: check database user permissions
3. Ensure special characters in password are URL-encoded

### Notifications not persisting

**Cause**: MongoDB not connected

**Solutions**:
1. Check server logs for connection errors
2. Verify `.env` file exists and is loaded
3. Test MongoDB connection manually with `mongosh`

## 📈 Performance Tips

1. **Indexes**: Already configured for optimal queries
2. **Connection Pooling**: Mongoose handles this automatically
3. **Query Optimization**: Use `.lean()` for read-only queries
4. **Pagination**: Add limit/skip for large result sets

## 🔐 Security Best Practices

1. **Never commit `.env`**: Already in `.gitignore`
2. **Use strong passwords**: For MongoDB users
3. **Enable authentication**: In production MongoDB
4. **Use SSL/TLS**: For MongoDB connections
5. **Whitelist IPs**: In MongoDB Atlas
6. **Rotate credentials**: Regularly update passwords

## 📚 Additional Resources

- [NestJS Mongoose Documentation](https://docs.nestjs.com/techniques/mongodb)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)

## ✅ Verification Checklist

- [ ] MongoDB installed and running
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured
- [ ] Server starts without errors
- [ ] Can create notifications via API
- [ ] Notifications persist in MongoDB
- [ ] WebSocket connections work
- [ ] Real-time notifications delivered

---

**Need Help?** Check the main README.md for more examples and API documentation.
