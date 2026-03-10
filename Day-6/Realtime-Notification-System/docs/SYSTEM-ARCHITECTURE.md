# System Architecture

## Overview

The Real-time Notification System is a full-stack application built with **NestJS** and **WebSocket** technology, designed to deliver instant notifications to users with offline support and persistent storage using **MongoDB**.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Browser    │  │ Mobile App   │  │  Desktop App │          │
│  │ (Socket.IO)  │  │ (Socket.IO)  │  │ (Socket.IO)  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │ WebSocket/HTTP
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    NestJS Server                          │  │
│  │  ┌─────────────────┐         ┌─────────────────┐        │  │
│  │  │  HTTP REST API  │         │  WebSocket API  │        │  │
│  │  │   (Express)     │         │  (Socket.IO)    │        │  │
│  │  └────────┬────────┘         └────────┬────────┘        │  │
│  │           │                           │                  │  │
│  │           └───────────┬───────────────┘                  │  │
│  │                       ▼                                   │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │         Notification Module                     │    │  │
│  │  │  ┌──────────────┐  ┌──────────────────────┐    │    │  │
│  │  │  │   Gateway    │  │      Service         │    │    │  │
│  │  │  │ (WebSocket)  │◄─┤  (Business Logic)    │    │    │  │
│  │  │  └──────────────┘  └──────────────────────┘    │    │  │
│  │  │  ┌──────────────┐  ┌──────────────────────┐    │    │  │
│  │  │  │  Controller  │  │   DTOs & Schemas     │    │    │  │
│  │  │  │  (REST API)  │  │   (Validation)       │    │    │  │
│  │  │  └──────────────┘  └──────────────────────┘    │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Mongoose ODM
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    MongoDB Database                       │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │         Notifications Collection                    │ │  │
│  │  │  • userId (indexed)                                 │ │  │
│  │  │  • title                                            │ │  │
│  │  │  • message                                          │ │  │
│  │  │  • type (info/success/warning/error)               │ │  │
│  │  │  • read (boolean, indexed)                         │ │  │
│  │  │  • createdAt (indexed)                             │ │  │
│  │  │  • updatedAt                                       │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      IN-MEMORY STORAGE                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Connected Users Map (userId → socketId)                 │  │
│  │  • Fast user lookup for real-time delivery               │  │
│  │  • Cleared on disconnect                                 │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend Framework
- **NestJS 10.x** - Progressive Node.js framework
  - Built on Express.js
  - TypeScript-first approach
  - Modular architecture
  - Dependency injection
  - Decorator-based routing

### Real-time Communication
- **Socket.IO 4.6.x** - WebSocket library
  - Automatic reconnection
  - Binary support
  - Room/namespace support
  - Fallback to HTTP long-polling
  - Cross-browser compatibility

- **@nestjs/websockets** - NestJS WebSocket adapter
  - Seamless Socket.IO integration
  - Decorator-based event handling
  - Gateway lifecycle hooks

### Database
- **MongoDB 7.x** - NoSQL document database
  - Flexible schema
  - High performance
  - Horizontal scalability
  - Rich query language

- **Mongoose 7.3.x** - MongoDB ODM
  - Schema validation
  - Middleware hooks
  - Query building
  - Type safety with TypeScript

### Additional Libraries
- **@nestjs/config** - Configuration management
- **RxJS 7.8.x** - Reactive programming
- **TypeScript 5.1.x** - Type safety

## System Layers

### 1. Presentation Layer
**Responsibility**: Handle client interactions and data presentation

**Components**:
- HTML/CSS/JavaScript client
- Socket.IO client library
- REST API consumers

**Features**:
- Real-time UI updates
- Connection status indicators
- Notification display
- User registration
- Event emission

### 2. Application Layer
**Responsibility**: Business logic and request orchestration

**Components**:

#### a) Notification Gateway (`notification.gateway.ts`)
- WebSocket connection management
- Event handling (register, sendNotification, markAsRead)
- Client lifecycle management
- Real-time message broadcasting

#### b) Notification Controller (`notification.controller.ts`)
- REST API endpoints
- HTTP request handling
- Response formatting
- Integration with Gateway and Service

#### c) Notification Service (`notification.service.ts`)
- Core business logic
- User session management
- Database operations
- Notification delivery logic

### 3. Data Layer
**Responsibility**: Data persistence and retrieval

**Components**:
- MongoDB database
- Mongoose schemas
- Indexes for performance
- Data validation

**Schema Design**:
```typescript
{
  userId: String (indexed),
  title: String,
  message: String,
  type: Enum ['info', 'success', 'warning', 'error'],
  read: Boolean (indexed),
  createdAt: Date (indexed),
  updatedAt: Date
}
```

## Design Patterns Used

### 1. Module Pattern
NestJS uses modules to organize code into cohesive blocks:
```
AppModule (Root)
  └── NotificationModule
       ├── NotificationGateway
       ├── NotificationController
       ├── NotificationService
       └── Mongoose Models
```

### 2. Dependency Injection
Services are injected into controllers and gateways:
```typescript
constructor(
  private readonly notificationService: NotificationService,
  private readonly notificationGateway: NotificationGateway
) {}
```

### 3. Repository Pattern
Mongoose models act as repositories for data access:
```typescript
@InjectModel(Notification.name)
private notificationModel: Model<NotificationDocument>
```

### 4. Observer Pattern
Socket.IO implements pub/sub for real-time events:
- Clients subscribe to events
- Server publishes notifications
- Automatic event propagation

### 5. Singleton Pattern
Services are singleton instances managed by NestJS:
- Single instance per application
- Shared state (connectedUsers Map)
- Efficient resource usage

### 6. Decorator Pattern
NestJS uses decorators for metadata:
```typescript
@WebSocketGateway()
@SubscribeMessage('register')
@Controller('notifications')
```

## Technology Selection Rationale

### Why NestJS?
1. **Enterprise-ready**: Production-grade architecture
2. **TypeScript**: Type safety and better IDE support
3. **Modular**: Easy to scale and maintain
4. **Built-in WebSocket support**: Native Socket.IO integration
5. **Dependency Injection**: Testable and maintainable code
6. **Express.js foundation**: Familiar and battle-tested

### Why Socket.IO?
1. **Reliability**: Automatic reconnection and fallback
2. **Cross-platform**: Works on all browsers and devices
3. **Event-based**: Clean API for real-time communication
4. **Room support**: Easy broadcasting to groups
5. **Binary support**: Efficient data transfer
6. **Production-ready**: Used by major companies

### Why MongoDB?
1. **Flexible schema**: Easy to evolve notification structure
2. **JSON-native**: Perfect for JavaScript/TypeScript
3. **Horizontal scaling**: Sharding support for growth
4. **Performance**: Fast reads/writes for real-time data
5. **Indexing**: Efficient queries on userId and timestamps
6. **Cloud-ready**: MongoDB Atlas for easy deployment

### Why Mongoose?
1. **Schema validation**: Data integrity
2. **Middleware**: Pre/post hooks for business logic
3. **Type safety**: TypeScript definitions
4. **Query builder**: Elegant API for complex queries
5. **Population**: Easy relationship handling
6. **Community**: Large ecosystem and support

## Communication Flow

### 1. Client Connection Flow
```
Client                    Gateway                   Service
  │                         │                         │
  ├─── Connect ────────────►│                         │
  │                         ├─── handleConnection ───►│
  │                         │                         │
  │◄─── Connected ──────────┤                         │
  │                         │                         │
  ├─── register(userId) ───►│                         │
  │                         ├─── registerUser ───────►│
  │                         │                         │
  │                         ├─── getPending ─────────►│
  │                         │◄─── notifications ──────┤
  │◄─── registered ─────────┤                         │
  │     + pending           │                         │
```

### 2. Notification Delivery Flow
```
REST Client              Controller              Gateway              Service              MongoDB
    │                       │                       │                    │                    │
    ├─── POST /notify ─────►│                       │                    │                    │
    │                       ├─── createNotification ────────────────────►│                    │
    │                       │                       │                    ├─── save() ────────►│
    │                       │                       │                    │◄─── notification ──┤
    │                       │                       │                    │                    │
    │                       │◄─── notification ─────────────────────────┤                    │
    │                       │                       │                    │                    │
    │                       ├─── sendToUser(userId, notification) ──────►│                    │
    │                       │                       ├─── emit() ────────►│ (to client)       │
    │                       │                       │                    │                    │
    │◄─── Response ─────────┤                       │                    │                    │
```

### 3. Offline User Flow
```
REST Client              Controller              Service              MongoDB
    │                       │                       │                    │
    ├─── POST /notify ─────►│                       │                    │
    │   (userId: offline)   │                       │                    │
    │                       ├─── createNotification ────────────────────►│
    │                       │                       ├─── save() ────────►│
    │                       │                       │◄─── stored ────────┤
    │                       │                       │                    │
    │                       ├─── isUserOnline? ────►│                    │
    │                       │◄─── false ────────────┤                    │
    │                       │                       │                    │
    │◄─── stored=true ──────┤                       │                    │
    │                       │                       │                    │
    
    [User comes online]
    
WebSocket Client         Gateway                 Service              MongoDB
    │                       │                       │                    │
    ├─── register(userId) ─►│                       │                    │
    │                       ├─── getPending ───────►│                    │
    │                       │                       ├─── find() ────────►│
    │                       │                       │◄─── notifications ─┤
    │◄─── pending[] ────────┤                       │                    │
```

## Scalability Considerations

### Horizontal Scaling
- **Stateless design**: User sessions in MongoDB
- **Load balancer**: Distribute WebSocket connections
- **Sticky sessions**: Route user to same server
- **Redis adapter**: Share Socket.IO events across servers

### Database Scaling
- **Indexes**: Fast queries on userId, read, createdAt
- **Sharding**: Partition by userId for large datasets
- **Replica sets**: High availability and read scaling
- **TTL indexes**: Auto-delete old notifications

### Performance Optimization
- **Connection pooling**: Reuse database connections
- **In-memory cache**: Connected users Map
- **Batch operations**: Mark multiple as read
- **Compression**: Socket.IO message compression

## Security Considerations

### Current Implementation
- CORS enabled for development
- No authentication (demo purposes)
- Input validation via DTOs

### Production Recommendations
- JWT authentication for WebSocket
- Rate limiting on endpoints
- Input sanitization
- HTTPS/WSS only
- Environment-based CORS
- API key for REST endpoints
- User authorization checks

## Monitoring & Observability

### Built-in Features
- Connection logging
- User count tracking
- Error handling

### Recommended Additions
- Application Performance Monitoring (APM)
- Error tracking (Sentry)
- Logging service (Winston, Pino)
- Metrics (Prometheus)
- Health check endpoints

## Deployment Architecture

```
                    ┌─────────────────┐
                    │   Load Balancer │
                    │   (Nginx/ALB)   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
         ┌────▼────┐    ┌────▼────┐   ┌────▼────┐
         │ Server 1│    │ Server 2│   │ Server 3│
         │ (NestJS)│    │ (NestJS)│   │ (NestJS)│
         └────┬────┘    └────┬────┘   └────┬────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
                    ┌────────▼────────┐
                    │  MongoDB Atlas  │
                    │  (Replica Set)  │
                    └─────────────────┘
```

## Future Enhancements

1. **Redis Integration**: Share state across multiple servers
2. **Message Queue**: RabbitMQ/Kafka for reliable delivery
3. **Push Notifications**: FCM/APNS for mobile
4. **Email Fallback**: Send email if user offline too long
5. **Analytics**: Track notification engagement
6. **A/B Testing**: Test notification formats
7. **Scheduling**: Delayed notification delivery
8. **Templates**: Reusable notification templates
9. **Localization**: Multi-language support
10. **Rich Media**: Images, actions, deep links
