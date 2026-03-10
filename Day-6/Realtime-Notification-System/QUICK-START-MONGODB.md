# 🚀 Quick Start with MongoDB

Get the Real-time Notification System running with MongoDB in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js v16+ installed
- [ ] npm or yarn installed
- [ ] MongoDB installed OR MongoDB Atlas account

## Step-by-Step Setup

### 1️⃣ Install Dependencies

```bash
cd Day-6/Realtime-Notification-System
npm install
```

**Expected packages to be installed:**
- `@nestjs/mongoose@^10.0.0`
- `@nestjs/config@^3.0.0`
- `mongoose@^7.3.1`
- Plus all existing dependencies

### 2️⃣ Setup MongoDB

**Choose ONE option:**

#### Option A: Local MongoDB (Recommended for Development)

**macOS:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Debian:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongod
```

**Windows:**
1. Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Install and start MongoDB service

**Verify MongoDB is running:**
```bash
mongosh
# You should see: "Connected to: mongodb://localhost:27017"
```

#### Option B: MongoDB Atlas (Cloud - Free Tier)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create a new cluster (M0 Free tier)
4. Create database user (username + password)
5. Whitelist your IP address (or use 0.0.0.0/0 for testing)
6. Get connection string: Click "Connect" → "Connect your application"
7. Copy the connection string

### 3️⃣ Configure Environment

The `.env` file is already created with default values for local MongoDB:

```env
MONGODB_URI=mongodb://localhost:27017/notification-system
PORT=3000
```

**If using MongoDB Atlas**, update `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/notification-system?retryWrites=true&w=majority
PORT=3000
```

Replace:
- `username` with your database username
- `password` with your database password
- `cluster` with your cluster name

### 4️⃣ Start the Server

```bash
npm run start:dev
```

**Expected output:**
```
🚀 Server is running on http://localhost:3000
🔌 WebSocket server is ready on ws://localhost:3000
📦 MongoDB connected to mongodb://localhost:27017/notification-system
```

### 5️⃣ Test the System

#### Test 1: Open the Web Client

Open your browser and go to:
```
http://localhost:3000
```

You should see the notification system interface.

#### Test 2: Send a Test Notification

**Using curl:**
```bash
curl -X POST http://localhost:3000/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "title": "Welcome!",
    "message": "Your first notification with MongoDB",
    "type": "success"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Notification stored for offline user",
  "notification": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "user123",
    "title": "Welcome!",
    "message": "Your first notification with MongoDB",
    "type": "success",
    "read": false,
    "createdAt": "2024-01-01T12:00:00.000Z"
  },
  "delivered": false
}
```

#### Test 3: Verify in MongoDB

**Open MongoDB shell:**
```bash
mongosh
```

**Check the data:**
```javascript
use notification-system
db.notifications.find().pretty()
```

You should see your notification stored in the database!

## 🎉 Success!

If you see the notification in MongoDB, you're all set! The system is now:
- ✅ Connected to MongoDB
- ✅ Storing notifications persistently
- ✅ Ready for real-time WebSocket connections
- ✅ Serving the web client

## 🔧 Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"

**Solution for Local MongoDB:**
```bash
# Check if MongoDB is running
mongosh

# If not running, start it:
# macOS:
brew services start mongodb-community

# Ubuntu:
sudo systemctl start mongod

# Windows:
net start MongoDB
```

**Solution for MongoDB Atlas:**
1. Check your connection string in `.env`
2. Verify IP whitelist includes your IP
3. Confirm username/password are correct
4. Ensure special characters in password are URL-encoded

### Issue: "Module not found: @nestjs/mongoose"

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Change port in .env file
PORT=3001
```

### Issue: "Authentication failed"

**Solution for MongoDB Atlas:**
1. Go to Database Access in Atlas
2. Verify user exists and has correct permissions
3. Reset password if needed
4. Update `.env` with new password

## 📚 Next Steps

1. **Explore the API**: Check `README.md` for all endpoints
2. **Test WebSocket**: Use the web client to test real-time notifications
3. **Read Documentation**: See `MONGODB-SETUP.md` for detailed info
4. **Check Migration**: See `MIGRATION-SUMMARY.md` for what changed

## 🆘 Need Help?

- **Full Documentation**: See `README.md`
- **MongoDB Setup**: See `MONGODB-SETUP.md`
- **Migration Details**: See `MIGRATION-SUMMARY.md`
- **API Examples**: See `README.md` API Documentation section

## 🎯 Quick Test Commands

**Create notification:**
```bash
curl -X POST http://localhost:3000/notifications \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","title":"Test","message":"Hello","type":"info"}'
```

**Get user notifications:**
```bash
curl http://localhost:3000/notifications/user/test
```

**Get pending notifications:**
```bash
curl http://localhost:3000/notifications/user/test/pending
```

**Check server stats:**
```bash
curl http://localhost:3000/notifications/stats
```

**Health check:**
```bash
curl http://localhost:3000/health
```

---

**Happy Coding! 🚀**
