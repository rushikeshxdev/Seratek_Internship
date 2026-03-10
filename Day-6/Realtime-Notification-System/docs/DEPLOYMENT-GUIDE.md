# Deployment Guide

## Overview

This guide covers deploying the Real-time Notification System to various cloud platforms. The application requires:
- Node.js runtime (v18+)
- MongoDB database
- WebSocket support
- Environment variables

## Pre-Deployment Checklist

### 1. Build the Application
```bash
npm run build
```

### 2. Test Production Build Locally
```bash
npm run start:prod
```

### 3. Prepare Environment Variables
```env
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/notifications
NODE_ENV=production
```

### 4. Update CORS Settings
```typescript
// src/main.ts
app.enableCors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  credentials: true
});
```

### 5. Set Up MongoDB Atlas
See "MongoDB Atlas Setup" section below

## MongoDB Atlas Setup (Production Database)

### Step 1: Create Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Verify email

### Step 2: Create Cluster
1. Click "Build a Cluster"
2. Choose **FREE** tier (M0 Sandbox)
3. Select cloud provider (AWS/GCP/Azure)
4. Choose region closest to your users
5. Cluster name: `notification-cluster`
6. Click "Create Cluster" (takes 3-5 minutes)

### Step 3: Create Database User
1. Click "Database Access" in left sidebar
2. Click "Add New Database User"
3. Authentication Method: **Password**
4. Username: `notificationUser`
5. Password: Generate secure password (save it!)
6. Database User Privileges: **Read and write to any database**
7. Click "Add User"

### Step 4: Whitelist IP Addresses
1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add your server's IP address
5. Click "Confirm"

### Step 5: Get Connection String
1. Click "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: **Node.js**, Version: **4.1 or later**
5. Copy connection string:
```
mongodb+srv://notificationUser:<password>@notification-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
6. Replace `<password>` with your actual password
7. Add database name: `/notification-system`

**Final Connection String**:
```
mongodb+srv://notificationUser:yourPassword@notification-cluster.xxxxx.mongodb.net/notification-system?retryWrites=true&w=majority
```

## Deployment Platforms

## 1. Heroku Deployment

### Prerequisites
- Heroku account
- Heroku CLI installed

### Step 1: Install Heroku CLI
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

### Step 2: Login to Heroku
```bash
heroku login
```

### Step 3: Create Heroku App
```bash
heroku create your-notification-app
```

### Step 4: Add Buildpack
```bash
heroku buildpacks:set heroku/nodejs
```

### Step 5: Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/notifications"
```

### Step 6: Create Procfile
```bash
echo "web: npm run start:prod" > Procfile
```

### Step 7: Deploy
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### Step 8: Scale Dynos
```bash
heroku ps:scale web=1
```

### Step 9: Open App
```bash
heroku open
```

### Step 10: View Logs
```bash
heroku logs --tail
```

### WebSocket Configuration
Heroku supports WebSocket by default. No additional configuration needed.

### Custom Domain
```bash
heroku domains:add www.yourdomain.com
```

### SSL Certificate
Heroku provides free SSL for all apps automatically.

### Scaling
```bash
# Scale to 2 dynos
heroku ps:scale web=2

# Upgrade to hobby dyno ($7/month)
heroku dyno:type hobby
```

## 2. Railway Deployment

### Prerequisites
- Railway account
- GitHub repository

### Step 1: Sign Up
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub

### Step 2: Create New Project
1. Click "New Project"
2. Choose "Deploy from GitHub repo"
3. Select your repository

### Step 3: Add Environment Variables
1. Click on your service
2. Go to "Variables" tab
3. Add variables:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
PORT=3000
```

### Step 4: Configure Build
Railway auto-detects Node.js and runs:
```bash
npm install
npm run build
npm run start:prod
```

### Step 5: Deploy
- Push to GitHub
- Railway automatically deploys
- Get URL: `https://your-app.up.railway.app`

### Step 6: Custom Domain
1. Go to "Settings" tab
2. Click "Generate Domain" or add custom domain
3. Add CNAME record to your DNS

### WebSocket Support
Railway supports WebSocket out of the box.

### Advantages
- Free tier with $5 credit/month
- Automatic deployments from GitHub
- Built-in monitoring
- Easy scaling

## 3. DigitalOcean App Platform

### Prerequisites
- DigitalOcean account
- GitHub repository

### Step 1: Create App
1. Go to [DigitalOcean](https://www.digitalocean.com)
2. Click "Create" → "Apps"
3. Connect GitHub repository

### Step 2: Configure App
1. **Name**: notification-system
2. **Branch**: main
3. **Source Directory**: /
4. **Build Command**: `npm run build`
5. **Run Command**: `npm run start:prod`

### Step 3: Environment Variables
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
PORT=8080
```

### Step 4: Choose Plan
- Basic: $5/month
- Professional: $12/month (recommended)

### Step 5: Deploy
Click "Create Resources" and wait for deployment

### Step 6: Custom Domain
1. Go to "Settings" → "Domains"
2. Add your domain
3. Update DNS records

### WebSocket Configuration
DigitalOcean App Platform supports WebSocket by default.

### Scaling
1. Go to "Settings" → "Scaling"
2. Increase instance count or size

## 4. AWS Elastic Beanstalk

### Prerequisites
- AWS account
- AWS CLI installed
- EB CLI installed

### Step 1: Install EB CLI
```bash
pip install awsebcli
```

### Step 2: Initialize EB
```bash
eb init -p node.js-18 notification-system --region us-east-1
```

### Step 3: Create Environment
```bash
eb create notification-prod
```

### Step 4: Set Environment Variables
```bash
eb setenv NODE_ENV=production
eb setenv MONGODB_URI="mongodb+srv://..."
```

### Step 5: Configure WebSocket
Create `.ebextensions/websocket.config`:
```yaml
option_settings:
  aws:elasticbeanstalk:environment:proxy:
    ProxyServer: nginx
  aws:elasticbeanstalk:environment:proxy:staticfiles:
    /public: public
```

### Step 6: Deploy
```bash
eb deploy
```

### Step 7: Open App
```bash
eb open
```

### Step 8: View Logs
```bash
eb logs
```

### Scaling
```bash
eb scale 2
```

### Load Balancer for WebSocket
1. Go to EC2 → Load Balancers
2. Select your load balancer
3. Edit attributes
4. Enable "Sticky Sessions" (required for WebSocket)

## 5. Google Cloud Platform (Cloud Run)

### Prerequisites
- GCP account
- gcloud CLI installed

### Step 1: Install gcloud CLI
```bash
# macOS
brew install google-cloud-sdk

# Windows/Linux
# Download from https://cloud.google.com/sdk/docs/install
```

### Step 2: Login
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### Step 3: Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start:prod"]
```

### Step 4: Build Container
```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/notification-system
```

### Step 5: Deploy to Cloud Run
```bash
gcloud run deploy notification-system \
  --image gcr.io/YOUR_PROJECT_ID/notification-system \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,MONGODB_URI="mongodb+srv://..."
```

### Step 6: Get URL
```bash
gcloud run services describe notification-system --region us-central1
```

### WebSocket Support
Cloud Run supports WebSocket with HTTP/2.

### Custom Domain
```bash
gcloud run domain-mappings create \
  --service notification-system \
  --domain www.yourdomain.com \
  --region us-central1
```

## 6. Azure App Service

### Prerequisites
- Azure account
- Azure CLI installed

### Step 1: Install Azure CLI
```bash
# macOS
brew install azure-cli

# Windows
# Download from https://aka.ms/installazurecliwindows
```

### Step 2: Login
```bash
az login
```

### Step 3: Create Resource Group
```bash
az group create --name notification-rg --location eastus
```

### Step 4: Create App Service Plan
```bash
az appservice plan create \
  --name notification-plan \
  --resource-group notification-rg \
  --sku B1 \
  --is-linux
```

### Step 5: Create Web App
```bash
az webapp create \
  --resource-group notification-rg \
  --plan notification-plan \
  --name your-notification-app \
  --runtime "NODE|18-lts"
```

### Step 6: Configure Environment Variables
```bash
az webapp config appsettings set \
  --resource-group notification-rg \
  --name your-notification-app \
  --settings NODE_ENV=production MONGODB_URI="mongodb+srv://..."
```

### Step 7: Deploy
```bash
az webapp deployment source config-local-git \
  --name your-notification-app \
  --resource-group notification-rg

git remote add azure <deployment-url>
git push azure main
```

### WebSocket Configuration
```bash
az webapp config set \
  --resource-group notification-rg \
  --name your-notification-app \
  --web-sockets-enabled true
```

## 7. Vercel (Limited WebSocket Support)

**⚠️ Warning**: Vercel has limited WebSocket support. Not recommended for production WebSocket apps.

### Alternative: Use Vercel for Frontend + Separate Backend

1. Deploy frontend to Vercel
2. Deploy backend to Railway/Heroku
3. Configure CORS to allow Vercel domain

## Environment Variables Configuration

### Required Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
PORT=3000
```

### Optional Variables
```env
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
MAX_CONNECTIONS=1000
```

### Setting Variables by Platform

| Platform | Method |
|----------|--------|
| Heroku | `heroku config:set KEY=value` |
| Railway | Dashboard → Variables tab |
| DigitalOcean | Dashboard → Environment Variables |
| AWS EB | `eb setenv KEY=value` |
| GCP | `--set-env-vars KEY=value` |
| Azure | `az webapp config appsettings set` |

## SSL/TLS Certificate Setup

### Free SSL with Let's Encrypt

Most platforms provide free SSL automatically:
- ✅ Heroku: Automatic
- ✅ Railway: Automatic
- ✅ DigitalOcean: Automatic
- ✅ Vercel: Automatic

### Custom SSL Certificate

#### Heroku
```bash
heroku certs:add server.crt server.key
```

#### DigitalOcean
1. Go to "Settings" → "Domains"
2. Click "Add Certificate"
3. Upload certificate files

## Domain Configuration

### DNS Records

#### For Heroku
```
Type: CNAME
Name: www
Value: your-app.herokuapp.com
```

#### For Railway
```
Type: CNAME
Name: www
Value: your-app.up.railway.app
```

#### For Custom Domain
```
Type: A
Name: @
Value: <server-ip>

Type: CNAME
Name: www
Value: yourdomain.com
```

## Load Balancing for WebSocket

### Why Load Balancing is Tricky

WebSocket requires persistent connections, which complicates load balancing.

### Solution: Sticky Sessions

Configure load balancer to route user to same server:

#### AWS Application Load Balancer
```yaml
Stickiness: Enabled
Stickiness Duration: 86400 seconds (24 hours)
```

#### Nginx
```nginx
upstream backend {
    ip_hash;  # Sticky sessions
    server server1.example.com:3000;
    server server2.example.com:3000;
}
```

### Alternative: Redis Adapter

Share WebSocket state across servers:

```bash
npm install @socket.io/redis-adapter redis
```

```typescript
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

## Scaling Considerations

### Vertical Scaling (Scale Up)
Increase server resources:
- More CPU cores
- More RAM
- Faster disk

**Pros**: Simple, no code changes
**Cons**: Expensive, limited

### Horizontal Scaling (Scale Out)
Add more servers:
- Multiple instances
- Load balancer
- Shared state (Redis)

**Pros**: Cost-effective, unlimited
**Cons**: Requires architecture changes

### Database Scaling

#### Read Replicas
```
Primary (Write) ──┐
                  ├─► Application
Replica (Read) ───┘
```

#### Sharding
```
Shard 1: Users A-M
Shard 2: Users N-Z
```

## Monitoring and Logging

### Application Monitoring

#### Heroku
```bash
heroku addons:create papertrail
heroku logs --tail
```

#### Railway
Built-in logs in dashboard

#### DigitalOcean
Built-in monitoring and alerts

### Custom Monitoring

#### Install Winston Logger
```bash
npm install winston
```

```typescript
import * as winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Health Check Endpoint

```typescript
@Get('health')
healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: 'connected'
  };
}
```

## Performance Optimization

### 1. Enable Compression
```bash
npm install compression
```

```typescript
import * as compression from 'compression';
app.use(compression());
```

### 2. Enable Caching
```typescript
@CacheInterceptor()
@Get('notifications')
getNotifications() {
  // Cached response
}
```

### 3. Database Indexing
```typescript
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
```

### 4. Connection Pooling
```typescript
MongooseModule.forRoot(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 5
})
```

## Security Best Practices

### 1. Use Environment Variables
Never commit secrets to Git

### 2. Enable HTTPS Only
```typescript
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### 3. Rate Limiting
```bash
npm install @nestjs/throttler
```

```typescript
ThrottlerModule.forRoot({
  ttl: 60,
  limit: 10
})
```

### 4. Helmet for Security Headers
```bash
npm install helmet
```

```typescript
import * as helmet from 'helmet';
app.use(helmet());
```

### 5. CORS Configuration
```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'https://yourdomain.com',
  credentials: true
});
```

## Troubleshooting Deployment Issues

### Issue 1: Build Fails
**Solution**: Check Node.js version, run `npm install` locally

### Issue 2: MongoDB Connection Fails
**Solution**: Check connection string, whitelist IP, verify credentials

### Issue 3: WebSocket Not Working
**Solution**: Enable WebSocket support, check sticky sessions

### Issue 4: Port Already in Use
**Solution**: Use `process.env.PORT` instead of hardcoded port

### Issue 5: CORS Errors
**Solution**: Update CORS origin to match your domain

## Cost Comparison

| Platform | Free Tier | Paid Plans | WebSocket Support |
|----------|-----------|------------|-------------------|
| Heroku | 550 hours/month | $7-$500/month | ✅ Yes |
| Railway | $5 credit/month | $5-$50/month | ✅ Yes |
| DigitalOcean | None | $5-$100/month | ✅ Yes |
| AWS EB | 750 hours/month | $10-$500/month | ✅ Yes (with config) |
| GCP Cloud Run | 2M requests/month | Pay per use | ✅ Yes |
| Azure | 12 months free | $10-$500/month | ✅ Yes (with config) |
| Vercel | Unlimited | $20-$40/month | ⚠️ Limited |

## Recommended Setup for Production

### Small Scale (< 1000 users)
- **Platform**: Railway or Heroku
- **Database**: MongoDB Atlas M0 (Free)
- **Cost**: $0-$7/month

### Medium Scale (1000-10000 users)
- **Platform**: DigitalOcean App Platform
- **Database**: MongoDB Atlas M10 ($57/month)
- **Cost**: $60-$100/month

### Large Scale (> 10000 users)
- **Platform**: AWS Elastic Beanstalk with Auto Scaling
- **Database**: MongoDB Atlas M30+ with sharding
- **Load Balancer**: AWS ALB with sticky sessions
- **Cache**: Redis for shared state
- **Cost**: $200-$1000+/month

## Deployment Checklist

- [ ] Build application locally
- [ ] Test production build
- [ ] Set up MongoDB Atlas
- [ ] Configure environment variables
- [ ] Update CORS settings
- [ ] Choose deployment platform
- [ ] Deploy application
- [ ] Configure custom domain
- [ ] Enable SSL/TLS
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Test WebSocket connection
- [ ] Load test application
- [ ] Set up alerts
- [ ] Document deployment process

## Next Steps

After deployment:
1. Monitor application logs
2. Set up error tracking (Sentry)
3. Configure automated backups
4. Set up CI/CD pipeline
5. Implement monitoring and alerts
6. Plan for scaling

## Support

For deployment issues:
- Check platform documentation
- Review application logs
- Test locally first
- Verify environment variables
- Check MongoDB connection
