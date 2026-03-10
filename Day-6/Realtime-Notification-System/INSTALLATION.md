# 📦 Installation & Deployment Guide

Complete guide for installing, running, and deploying the Real-time Notification System.

## 📋 Prerequisites

### Required Software
- **Node.js**: v16.x or higher ([Download](https://nodejs.org/))
- **npm**: v8.x or higher (comes with Node.js)
- **Git**: For cloning the repository (optional)

### Verify Installation
```bash
node --version  # Should show v16.x or higher
npm --version   # Should show v8.x or higher
```

## 🚀 Installation Steps

### Step 1: Navigate to Project Directory
```bash
cd Day-6/Realtime-Notification-System
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install:
- @nestjs/common
- @nestjs/core
- @nestjs/platform-express
- @nestjs/platform-socket.io
- @nestjs/websockets
- socket.io
- reflect-metadata
- rxjs
- And all dev dependencies

### Step 3: Verify Installation
```bash
npm list --depth=0
```

You should see all dependencies listed without errors.

## 🏃 Running the Application

### Development Mode (Recommended for Testing)
```bash
npm run start:dev
```

Features:
- Auto-reload on file changes
- Detailed error messages
- Source maps enabled

### Production Mode
```bash
# Build the application
npm run build

# Run the built application
npm run start:prod
```

### Debug Mode
```bash
npm run start:debug
```

Access debugger at: `chrome://inspect`

## 🌐 Accessing the Application

Once the server is running:

### Web Interface
```
http://localhost:3000
```

### API Endpoints
```
http://localhost:3000/notifications
http://localhost:3000/health
```

### WebSocket Connection
```
ws://localhost:3000
```

## 🧪 Testing the Installation

### Test 1: Health Check
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "Real-time Notification System"
}
```

### Test 2: Send Test Notification
```bash
curl -X POST http://localhost:3000/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "testuser",
    "title": "Test",
    "message": "Installation successful!",
    "type": "success"
  }'
```

### Test 3: Open Web Client
1. Open browser to `http://localhost:3000`
2. Enter user ID: `testuser`
3. Click "Connect"
4. Should see "Connected" status

## 🔧 Configuration

### Environment Variables

Create a `.env` file (optional):
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
WS_PORT=3000
```

### Change Port

Edit `src/main.ts`:
```typescript
await app.listen(3001); // Change to desired port
```

### Configure CORS

Edit `src/main.ts`:
```typescript
app.enableCors({
  origin: 'https://yourdomain.com', // Specific domain
  credentials: true,
});
```

## 🐳 Docker Deployment (Optional)

### Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

### Build and Run
```bash
docker build -t notification-system .
docker run -p 3000:3000 notification-system
```

## ☁️ Cloud Deployment

### Deploy to Heroku

1. Install Heroku CLI
2. Login to Heroku:
```bash
heroku login
```

3. Create app:
```bash
heroku create your-app-name
```

4. Add Procfile:
```
web: npm run start:prod
```

5. Deploy:
```bash
git push heroku main
```

### Deploy to AWS EC2

1. Launch EC2 instance (Ubuntu)
2. SSH into instance
3. Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. Clone/upload project
5. Install dependencies:
```bash
npm install
npm run build
```

6. Install PM2:
```bash
sudo npm install -g pm2
```

7. Start application:
```bash
pm2 start dist/main.js --name notification-system
pm2 save
pm2 startup
```

### Deploy to DigitalOcean

1. Create Droplet (Node.js)
2. SSH into droplet
3. Upload project files
4. Install dependencies and build
5. Use PM2 or systemd for process management

### Deploy to Vercel/Netlify

Note: These platforms are optimized for frontend. For full-stack with WebSocket, use:
- Railway
- Render
- Fly.io

## 🔒 Production Checklist

Before deploying to production:

- [ ] Change CORS origin to specific domain
- [ ] Add authentication/authorization
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Set up database (PostgreSQL/MongoDB)
- [ ] Configure Redis for session storage
- [ ] Set up logging (Winston)
- [ ] Add monitoring (Prometheus/Grafana)
- [ ] Configure SSL/TLS certificates
- [ ] Set up backup strategy
- [ ] Implement error tracking (Sentry)
- [ ] Add health check endpoints
- [ ] Configure environment variables
- [ ] Set up CI/CD pipeline
- [ ] Load testing
- [ ] Security audit

## 🛠️ Troubleshooting

### Issue: Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Issue: Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript Errors
```bash
# Rebuild the project
npm run build
```

### Issue: WebSocket Connection Failed
- Check firewall settings
- Verify CORS configuration
- Ensure server is running
- Check browser console for errors

### Issue: Cannot Connect to Server
```bash
# Check if server is running
curl http://localhost:3000/health

# Check server logs
npm run start:dev
```

## 📊 Performance Optimization

### For Production

1. **Enable Compression**
```typescript
import * as compression from 'compression';
app.use(compression());
```

2. **Add Helmet for Security**
```bash
npm install helmet
```

```typescript
import * as helmet from 'helmet';
app.use(helmet());
```

3. **Configure Rate Limiting**
```bash
npm install @nestjs/throttler
```

4. **Use Redis for Scaling**
```bash
npm install @socket.io/redis-adapter redis
```

## 🔄 Updating the Application

### Update Dependencies
```bash
npm update
npm audit fix
```

### Update NestJS
```bash
npm install @nestjs/common@latest @nestjs/core@latest
```

### Update Socket.IO
```bash
npm install socket.io@latest @nestjs/websockets@latest
```

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 💡 Tips

1. **Development**: Use `npm run start:dev` for hot reload
2. **Production**: Always use `npm run build` before deploying
3. **Debugging**: Use Chrome DevTools for WebSocket inspection
4. **Testing**: Test with multiple browser tabs/windows
5. **Monitoring**: Set up logging from day one

## 🆘 Getting Help

If you encounter issues:

1. Check the [README.md](README.md) for documentation
2. Review the [QUICKSTART.md](QUICKSTART.md) guide
3. Check server logs for error messages
4. Verify all prerequisites are installed
5. Ensure ports are not blocked by firewall

## ✅ Verification Checklist

After installation, verify:

- [ ] Server starts without errors
- [ ] Health endpoint responds
- [ ] Web client loads
- [ ] WebSocket connection works
- [ ] Notifications are sent/received
- [ ] REST API endpoints work
- [ ] No console errors in browser

---

**Installation complete! 🎉**

Proceed to [QUICKSTART.md](QUICKSTART.md) for usage guide.
