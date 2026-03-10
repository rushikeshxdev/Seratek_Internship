# Project Structure

## Complete Directory Tree

```
Realtime-Notification-System/
├── src/                                    # Source code directory
│   ├── notification/                       # Notification feature module
│   │   ├── dto/                           # Data Transfer Objects
│   │   │   └── create-notification.dto.ts # Notification creation DTO
│   │   ├── entities/                      # Entity definitions
│   │   │   └── notification.entity.ts     # Notification entity
│   │   ├── schemas/                       # MongoDB schemas
│   │   │   └── notification.schema.ts     # Mongoose schema
│   │   ├── notification.controller.ts     # REST API controller
│   │   ├── notification.gateway.ts        # WebSocket gateway
│   │   ├── notification.module.ts         # Feature module
│   │   └── notification.service.ts        # Business logic service
│   ├── app.controller.ts                  # Root controller
│   ├── app.module.ts                      # Root module
│   ├── app.service.ts                     # Root service
│   └── main.ts                            # Application entry point
├── public/                                 # Static files
│   └── index.html                         # Demo client interface
├── docs/                                   # Documentation
│   ├── SYSTEM-ARCHITECTURE.md             # Architecture overview
│   ├── DESIGN-PHILOSOPHY.md               # Design decisions
│   ├── CONNECTION-WORKFLOW.md             # Connection lifecycle
│   ├── PROJECT-STRUCTURE.md               # This file
│   ├── DEPLOYMENT-GUIDE.md                # Deployment instructions
│   ├── INTEGRATION-GUIDE.md               # Integration examples
│   ├── HOW-IT-WORKS.md                    # Technical deep dive
│   ├── USE-CASES.md                       # Real-world examples
│   ├── API-REFERENCE.md                   # API documentation
│   └── TROUBLESHOOTING.md                 # Common issues
├── .env                                    # Environment variables
├── .gitignore                             # Git ignore rules
├── nest-cli.json                          # NestJS CLI configuration
├── package.json                           # Dependencies and scripts
├── tsconfig.json                          # TypeScript configuration
├── tsconfig.build.json                    # Build-specific TS config
├── README.md                              # Project overview
├── INSTALLATION.md                        # Setup instructions
├── QUICKSTART.md                          # Quick start guide
├── MONGODB-SETUP.md                       # MongoDB setup guide
└── postman-collection.json                # API testing collection
```

## File-by-File Explanation

### Root Directory Files

#### `package.json`
**Purpose**: Project metadata, dependencies, and scripts

**Key Dependencies**:
```json
{
  "@nestjs/core": "^10.0.0",           // NestJS framework
  "@nestjs/websockets": "^10.0.0",     // WebSocket support
  "@nestjs/mongoose": "^10.0.0",       // MongoDB integration
  "socket.io": "^4.6.0",               // WebSocket library
  "mongoose": "^7.3.1"                 // MongoDB ODM
}
```

**Scripts**:
- `npm start` - Start production server
- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

#### `.env`
**Purpose**: Environment configuration

**Contents**:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/notification-system
NODE_ENV=development
```

**Usage**: Loaded by `@nestjs/config` module

#### `tsconfig.json`
**Purpose**: TypeScript compiler configuration

**Key Settings**:
- Target: ES2021
- Module: CommonJS
- Decorators: Enabled (required for NestJS)
- Strict mode: Enabled

#### `nest-cli.json`
**Purpose**: NestJS CLI configuration

**Settings**:
- Source root: `src`
- Compiler: `tsc`
- Delete output path: `true`

### Source Directory (`src/`)

#### `main.ts`
**Purpose**: Application bootstrap and entry point

**Responsibilities**:
1. Create NestJS application
2. Enable CORS
3. Serve static files
4. Start HTTP and WebSocket servers

**Code Structure**:
```typescript
async function bootstrap() {
  // 1. Create app
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // 2. Configure CORS
  app.enableCors({ origin: '*', credentials: true });
  
  // 3. Serve static files
  app.useStaticAssets(join(__dirname, '..', 'public'));
  
  // 4. Start server
  await app.listen(process.env.PORT || 3000);
}
```

**When to Modify**:
- Add global middleware
- Configure global pipes/guards
- Change server port
- Add Swagger documentation

#### `app.module.ts`
**Purpose**: Root application module

**Responsibilities**:
1. Import feature modules
2. Configure global modules (Config, Mongoose)
3. Wire up application

**Code Structure**:
```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    NotificationModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
```

**When to Modify**:
- Add new feature modules
- Configure global modules
- Add global providers

#### `app.controller.ts`
**Purpose**: Root HTTP controller

**Endpoints**:
- `GET /` - Health check

**When to Modify**:
- Add global endpoints
- Add health check logic

#### `app.service.ts`
**Purpose**: Root application service

**Methods**:
- `getHello()` - Returns welcome message

**When to Modify**:
- Add global business logic

### Notification Module (`src/notification/`)

#### `notification.module.ts`
**Purpose**: Notification feature module

**Responsibilities**:
1. Import Mongoose models
2. Register controllers and gateways
3. Export services for other modules

**Code Structure**:
```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema }
    ])
  ],
  controllers: [NotificationController],
  providers: [NotificationGateway, NotificationService],
  exports: [NotificationService]
})
export class NotificationModule {}
```

**When to Modify**:
- Add new schemas
- Add new controllers/gateways
- Export additional services

#### `notification.gateway.ts`
**Purpose**: WebSocket event handler

**Responsibilities**:
1. Handle WebSocket connections
2. Process WebSocket events
3. Emit events to clients
4. Manage connection lifecycle

**Key Methods**:
```typescript
handleConnection(client: Socket)           // New connection
handleDisconnect(client: Socket)           // Connection closed
handleRegister(data, client)               // User registration
handleSendNotification(dto)                // Send notification
handleMarkAsRead(data, client)             // Mark as read
handleMarkAllAsRead(client)                // Mark all as read
handleGetNotifications(client)             // Get all notifications
sendNotificationToUser(userId, notification) // Send to specific user
broadcastNotification(notification)        // Broadcast to all
```

**WebSocket Events**:
- `register` - Register user
- `sendNotification` - Send notification
- `markAsRead` - Mark notification as read
- `markAllAsRead` - Mark all as read
- `getNotifications` - Get all notifications

**Emitted Events**:
- `notification` - New notification
- `registered` - Registration confirmation
- `connectedUsers` - User count update

**When to Modify**:
- Add new WebSocket events
- Change connection logic
- Add authentication
- Implement rooms/namespaces

#### `notification.controller.ts`
**Purpose**: REST API endpoints

**Responsibilities**:
1. Handle HTTP requests
2. Validate input
3. Call service methods
4. Format responses

**Endpoints**:
```typescript
POST   /notifications                    // Create notification
GET    /notifications/user/:userId       // Get user notifications
GET    /notifications/user/:userId/pending // Get pending notifications
PATCH  /notifications/user/:userId/:notificationId/read // Mark as read
PATCH  /notifications/user/:userId/read-all // Mark all as read
DELETE /notifications/user/:userId       // Clear all notifications
GET    /notifications/stats              // Get statistics
```

**When to Modify**:
- Add new endpoints
- Change request/response format
- Add validation
- Add authentication

#### `notification.service.ts`
**Purpose**: Business logic and data access

**Responsibilities**:
1. Database operations
2. User session management
3. Notification logic
4. Data validation

**Key Methods**:
```typescript
createNotification(dto)                  // Create notification
getPendingNotifications(userId)          // Get unread notifications
getAllNotifications(userId)              // Get all notifications
markAsRead(userId, notificationId)       // Mark single as read
markAllAsRead(userId)                    // Mark all as read
clearNotifications(userId)               // Delete all notifications
registerUser(userId, socketId)           // Register user session
unregisterUser(userId)                   // Unregister user
isUserOnline(userId)                     // Check if user online
getSocketId(userId)                      // Get user's socket ID
getConnectedUsersCount()                 // Get online user count
```

**Data Structures**:
```typescript
private connectedUsers: Map<string, string> = new Map();
// Maps userId → socketId for real-time delivery
```

**When to Modify**:
- Add new business logic
- Change data access patterns
- Add caching
- Implement complex queries

### DTOs (`src/notification/dto/`)

#### `create-notification.dto.ts`
**Purpose**: Data transfer objects for validation

**DTOs Defined**:

```typescript
// For creating notifications
export class CreateNotificationDto {
  userId?: string;              // Target user (optional for broadcast)
  title: string;                // Notification title
  message: string;              // Notification message
  type?: NotificationType;      // info/success/warning/error
  broadcast?: boolean;          // Send to all users
}

// For marking as read
export class MarkAsReadDto {
  notificationId: string;       // Notification ID
  userId: string;               // User ID
}
```

**When to Modify**:
- Add validation decorators (class-validator)
- Add new fields
- Change field types
- Add transformation logic

**Example with Validation**:
```typescript
import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export class CreateNotificationDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsBoolean()
  broadcast?: boolean;
}
```

### Entities (`src/notification/entities/`)

#### `notification.entity.ts`
**Purpose**: TypeScript interface for notifications

**Definition**:
```typescript
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}

export class Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**When to Modify**:
- Add new notification types
- Add new fields
- Change field types

### Schemas (`src/notification/schemas/`)

#### `notification.schema.ts`
**Purpose**: MongoDB schema definition

**Schema Definition**:
```typescript
@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ 
    type: String, 
    enum: NotificationType, 
    default: NotificationType.INFO 
  })
  type: NotificationType;

  @Prop({ default: false })
  read: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;
}
```

**Indexes**:
```typescript
// Compound index for fast queries
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
```

**When to Modify**:
- Add new fields
- Add indexes
- Add validation
- Add middleware (pre/post hooks)

**Example with Middleware**:
```typescript
NotificationSchema.pre('save', function(next) {
  // Run before saving
  console.log('Saving notification:', this.title);
  next();
});

NotificationSchema.post('save', function(doc) {
  // Run after saving
  console.log('Notification saved:', doc._id);
});
```

### Public Directory (`public/`)

#### `index.html`
**Purpose**: Demo client interface

**Features**:
- WebSocket connection
- User registration
- Send notifications
- Display notifications
- Mark as read
- Connection status

**When to Modify**:
- Improve UI/UX
- Add new features
- Change styling
- Add client-side validation

## Module Organization

### NestJS Module Pattern

```
NotificationModule
├── Imports
│   └── MongooseModule.forFeature([Notification])
├── Controllers
│   └── NotificationController (REST API)
├── Providers
│   ├── NotificationGateway (WebSocket)
│   └── NotificationService (Business Logic)
└── Exports
    └── NotificationService (for other modules)
```

### Dependency Flow

```
Controller/Gateway
       ↓
    Service
       ↓
  Mongoose Model
       ↓
    MongoDB
```

### Separation of Concerns

1. **Gateway**: WebSocket communication only
2. **Controller**: HTTP communication only
3. **Service**: Business logic and data access
4. **Schema**: Data structure and validation
5. **DTO**: Input validation and transformation

## Naming Conventions

### Files
- **Controllers**: `*.controller.ts`
- **Services**: `*.service.ts`
- **Gateways**: `*.gateway.ts`
- **Modules**: `*.module.ts`
- **DTOs**: `*.dto.ts`
- **Entities**: `*.entity.ts`
- **Schemas**: `*.schema.ts`

### Classes
- **Controllers**: `NotificationController`
- **Services**: `NotificationService`
- **Gateways**: `NotificationGateway`
- **Modules**: `NotificationModule`
- **DTOs**: `CreateNotificationDto`
- **Entities**: `Notification`

### Methods
- **camelCase**: `createNotification()`, `markAsRead()`
- **Descriptive**: `getPendingNotifications()` not `getPending()`
- **Async**: Prefix with `async` keyword

### Variables
- **camelCase**: `userId`, `socketId`, `connectedUsers`
- **Constants**: `UPPER_SNAKE_CASE`
- **Private**: Prefix with `private`

## Code Organization Principles

### 1. Single Responsibility
Each file has one clear purpose:
- Gateway handles WebSocket
- Controller handles HTTP
- Service handles business logic

### 2. Dependency Injection
Services are injected, not instantiated:
```typescript
constructor(
  private readonly notificationService: NotificationService
) {}
```

### 3. Separation of Concerns
- Presentation (Gateway/Controller)
- Business Logic (Service)
- Data Access (Mongoose Model)

### 4. DRY (Don't Repeat Yourself)
Shared logic in service, used by both Gateway and Controller

### 5. Testability
Each component can be tested independently with mocked dependencies

## Where to Add New Features

### Adding a New Notification Type

1. **Update Entity** (`notification.entity.ts`):
```typescript
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  URGENT = 'urgent'  // New type
}
```

2. **Schema automatically updated** (uses same enum)

### Adding a New WebSocket Event

1. **Add handler in Gateway** (`notification.gateway.ts`):
```typescript
@SubscribeMessage('newEvent')
async handleNewEvent(@MessageBody() data: any) {
  // Handle event
  return { success: true };
}
```

2. **Add service method if needed** (`notification.service.ts`)

### Adding a New REST Endpoint

1. **Add method in Controller** (`notification.controller.ts`):
```typescript
@Get('custom-endpoint')
async customEndpoint() {
  return this.notificationService.customMethod();
}
```

2. **Add service method** (`notification.service.ts`):
```typescript
async customMethod() {
  // Business logic
}
```

### Adding a New Field to Notification

1. **Update Schema** (`notification.schema.ts`):
```typescript
@Prop()
newField: string;
```

2. **Update Entity** (`notification.entity.ts`):
```typescript
export class Notification {
  // ... existing fields
  newField: string;
}
```

3. **Update DTO** (`create-notification.dto.ts`):
```typescript
export class CreateNotificationDto {
  // ... existing fields
  newField?: string;
}
```

### Adding a New Module

1. **Create module directory**: `src/new-feature/`
2. **Create files**:
   - `new-feature.module.ts`
   - `new-feature.controller.ts`
   - `new-feature.service.ts`
   - `new-feature.gateway.ts` (if needed)
3. **Import in AppModule** (`app.module.ts`):
```typescript
@Module({
  imports: [
    // ... existing imports
    NewFeatureModule
  ]
})
```

## Build Output

After running `npm run build`, the `dist/` directory contains:

```
dist/
├── notification/
│   ├── dto/
│   ├── entities/
│   ├── schemas/
│   ├── notification.controller.js
│   ├── notification.gateway.js
│   ├── notification.module.js
│   └── notification.service.js
├── app.controller.js
├── app.module.js
├── app.service.js
└── main.js
```

**Note**: TypeScript files are compiled to JavaScript, type information is removed.

## Development Workflow

### 1. Start Development Server
```bash
npm run start:dev
```
- Watches for file changes
- Auto-recompiles
- Auto-restarts server

### 2. Make Changes
- Edit files in `src/`
- Server automatically restarts
- Test changes immediately

### 3. Test API
- Use Postman collection
- Use demo client (`public/index.html`)
- Write unit tests

### 4. Build for Production
```bash
npm run build
npm run start:prod
```

## Best Practices

### 1. Keep Modules Small
Each module should have a single, well-defined purpose

### 2. Use DTOs for Validation
Always validate input with DTOs and class-validator

### 3. Keep Controllers Thin
Move business logic to services

### 4. Use Dependency Injection
Never instantiate services manually

### 5. Write Tests
Test each component independently

### 6. Document Code
Add JSDoc comments for complex logic

### 7. Follow Naming Conventions
Consistent naming makes code readable

### 8. Use Environment Variables
Never hardcode configuration

## Summary

The project follows NestJS best practices with clear separation of concerns:

- **Modular**: Features organized in modules
- **Layered**: Presentation → Business Logic → Data
- **Testable**: Dependency injection enables testing
- **Scalable**: Easy to add new features
- **Maintainable**: Clear structure and naming

Understanding this structure makes it easy to navigate, modify, and extend the application.
