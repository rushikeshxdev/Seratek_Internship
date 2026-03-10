# 🚀 Quick Start Guide

Get the Real-time Notification System up and running in 3 minutes!

## Step 1: Install Dependencies

```bash
cd Day-6/Realtime-Notification-System
npm install
```

## Step 2: Start the Server

```bash
npm run start:dev
```

You should see:
```
🚀 Server is running on http://localhost:3000
🔌 WebSocket server is ready on ws://localhost:3000
```

## Step 3: Open the Client

Open your browser and go to:
```
http://localhost:3000
```

## Step 4: Test the System

### Test 1: Connect a User

1. In the browser, enter a User ID (e.g., "alice")
2. Click "Connect"
3. You should see "Connected" status

### Test 2: Send a Notification

1. Open a second browser tab/window
2. Connect with a different User ID (e.g., "bob")
3. In the first tab (alice), enter:
   - Target User ID: `bob`
   - Title: `Hello Bob!`
   - Message: `This is a test notification`
   - Type: `info`
4. Click "Send"
5. Bob's tab should receive the notification instantly!

### Test 3: Broadcast to All

1. In any connected tab, enter:
   - Title: `System Announcement`
   - Message: `Server maintenance in 10 minutes`
   - Type: `warning`
2. Click "Broadcast to All"
3. All connected users receive the notification!

### Test 4: Offline Notifications

1. Close Bob's browser tab (disconnect)
2. From Alice's tab, send a notification to Bob
3. Reconnect Bob
4. Bob receives all pending notifications!

## Step 5: Test via REST API

### Send a notification using curl:

```bash
curl -X POST http://localhost:3000/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "alice",
    "title": "API Test",
    "message": "Notification sent via REST API",
    "type": "success"
  }'
```

### Get user notifications:

```bash
curl http://localhost:3000/notifications/user/alice
```

### Check server stats:

```bash
curl http://localhost:3000/notifications/stats
```

## 🎉 That's It!

You now have a fully functional real-time notification system!

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the API endpoints
- Customize the notification types
- Add authentication
- Integrate with your application

## Troubleshooting

### Port already in use?

Change the port in `src/main.ts`:
```typescript
await app.listen(3001); // Use a different port
```

### Can't connect to WebSocket?

Make sure:
1. Server is running (`npm run start:dev`)
2. No firewall blocking port 3000
3. Browser supports WebSocket (all modern browsers do)

### Notifications not appearing?

1. Check browser console for errors (F12)
2. Verify user is connected (green status indicator)
3. Check server logs for errors

## Need Help?

Check the [README.md](README.md) for comprehensive documentation!
