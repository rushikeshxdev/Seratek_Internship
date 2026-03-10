# Integration Guide

## Overview

This guide shows how to integrate the Real-time Notification System into various types of applications. The system provides both REST API and WebSocket interfaces for maximum flexibility.

## Integration Methods

1. **WebSocket Client** - Real-time bidirectional communication
2. **REST API** - Traditional HTTP requests
3. **Hybrid** - Combine both for optimal experience

## Quick Integration Example

```javascript
// 1. Connect to WebSocket
const socket = io('http://localhost:3000');

// 2. Register user
socket.emit('register', { userId: 'user123' });

// 3. Listen for notifications
socket.on('notification', (data) => {
  console.log('New notification:', data);
});

// 4. Send notification via REST API
fetch('http://localhost:3000/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    title: 'Hello',
    message: 'Welcome!',
    type: 'info'
  })
});
```

## Frontend Framework Integration

### React Integration

#### Installation
```bash
npm install socket.io-client
```

#### Create Hook: `useNotifications.js`
```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useNotifications = (serverUrl, userId) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to server
    const newSocket = io(serverUrl);
    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('register', { userId });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Registration confirmation
    newSocket.on('registered', (data) => {
      console.log('Registered:', data.userId);
      setNotifications(data.pendingNotifications);
    });

    // New notification
    newSocket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    // Cleanup
    return () => newSocket.close();
  }, [serverUrl, userId]);

  const markAsRead = (notificationId) => {
    if (socket) {
      socket.emit('markAsRead', { notificationId });
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
    }
  };

  const markAllAsRead = () => {
    if (socket) {
      socket.emit('markAllAsRead');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  return {
    notifications,
    isConnected,
    markAsRead,
    markAllAsRead
  };
};
```

#### Component: `NotificationBell.jsx`
```javascript
import React from 'react';
import { useNotifications } from './useNotifications';

export const NotificationBell = ({ userId }) => {
  const { notifications, isConnected, markAsRead, markAllAsRead } = 
    useNotifications('http://localhost:3000', userId);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notification-bell">
      <button className="bell-icon">
        🔔
        {unreadCount > 0 && (
          <span className="badge">{unreadCount}</span>
        )}
      </button>

      <div className="notification-dropdown">
        <div className="header">
          <h3>Notifications</h3>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead}>Mark all as read</button>
          )}
        </div>

        <div className="notification-list">
          {notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            notifications.map(notification => (
              <div
                key={notification._id}
                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                onClick={() => markAsRead(notification._id)}
              >
                <div className={`type-indicator ${notification.type}`} />
                <div className="content">
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                  <span className="time">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
    </div>
  );
};
```

#### Usage in App
```javascript
import { NotificationBell } from './NotificationBell';

function App() {
  const userId = 'user123'; // Get from auth context

  return (
    <div className="app">
      <header>
        <h1>My App</h1>
        <NotificationBell userId={userId} />
      </header>
      {/* Rest of app */}
    </div>
  );
}
```

### Vue.js Integration

#### Installation
```bash
npm install socket.io-client
```

#### Composable: `useNotifications.js`
```javascript
import { ref, onMounted, onUnmounted } from 'vue';
import io from 'socket.io-client';

export function useNotifications(serverUrl, userId) {
  const socket = ref(null);
  const notifications = ref([]);
  const isConnected = ref(false);

  onMounted(() => {
    socket.value = io(serverUrl);

    socket.value.on('connect', () => {
      isConnected.value = true;
      socket.value.emit('register', { userId });
    });

    socket.value.on('disconnect', () => {
      isConnected.value = false;
    });

    socket.value.on('registered', (data) => {
      notifications.value = data.pendingNotifications;
    });

    socket.value.on('notification', (notification) => {
      notifications.value.unshift(notification);
    });
  });

  onUnmounted(() => {
    if (socket.value) {
      socket.value.close();
    }
  });

  const markAsRead = (notificationId) => {
    socket.value.emit('markAsRead', { notificationId });
    notifications.value = notifications.value.map(n =>
      n._id === notificationId ? { ...n, read: true } : n
    );
  };

  const markAllAsRead = () => {
    socket.value.emit('markAllAsRead');
    notifications.value = notifications.value.map(n => ({ ...n, read: true }));
  };

  return {
    notifications,
    isConnected,
    markAsRead,
    markAllAsRead
  };
}
```

#### Component: `NotificationBell.vue`
```vue
<template>
  <div class="notification-bell">
    <button class="bell-icon" @click="toggleDropdown">
      🔔
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
    </button>

    <div v-if="showDropdown" class="notification-dropdown">
      <div class="header">
        <h3>Notifications</h3>
        <button v-if="unreadCount > 0" @click="markAllAsRead">
          Mark all as read
        </button>
      </div>

      <div class="notification-list">
        <p v-if="notifications.length === 0">No notifications</p>
        <div
          v-for="notification in notifications"
          :key="notification._id"
          :class="['notification-item', notification.read ? 'read' : 'unread']"
          @click="markAsRead(notification._id)"
        >
          <div :class="['type-indicator', notification.type]" />
          <div class="content">
            <h4>{{ notification.title }}</h4>
            <p>{{ notification.message }}</p>
            <span class="time">
              {{ formatDate(notification.createdAt) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div :class="['connection-status', isConnected ? 'connected' : 'disconnected']">
      {{ isConnected ? '🟢 Connected' : '🔴 Disconnected' }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useNotifications } from './useNotifications';

const props = defineProps({
  userId: String,
  serverUrl: { type: String, default: 'http://localhost:3000' }
});

const { notifications, isConnected, markAsRead, markAllAsRead } = 
  useNotifications(props.serverUrl, props.userId);

const showDropdown = ref(false);

const unreadCount = computed(() => 
  notifications.value.filter(n => !n.read).length
);

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const formatDate = (date) => {
  return new Date(date).toLocaleString();
};
</script>
```

### Angular Integration

#### Installation
```bash
npm install socket.io-client
```

#### Service: `notification.service.ts`
```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import io, { Socket } from 'socket.io-client';

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private socket: Socket;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private connectedSubject = new BehaviorSubject<boolean>(false);

  public notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();
  public connected$: Observable<boolean> = this.connectedSubject.asObservable();

  constructor() {}

  connect(serverUrl: string, userId: string): void {
    this.socket = io(serverUrl);

    this.socket.on('connect', () => {
      this.connectedSubject.next(true);
      this.socket.emit('register', { userId });
    });

    this.socket.on('disconnect', () => {
      this.connectedSubject.next(false);
    });

    this.socket.on('registered', (data: any) => {
      this.notificationsSubject.next(data.pendingNotifications);
    });

    this.socket.on('notification', (notification: Notification) => {
      const current = this.notificationsSubject.value;
      this.notificationsSubject.next([notification, ...current]);
    });
  }

  markAsRead(notificationId: string): void {
    this.socket.emit('markAsRead', { notificationId });
    const updated = this.notificationsSubject.value.map(n =>
      n._id === notificationId ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(updated);
  }

  markAllAsRead(): void {
    this.socket.emit('markAllAsRead');
    const updated = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(updated);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
    }
  }
}
```

#### Component: `notification-bell.component.ts`
```typescript
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { NotificationService, Notification } from './notification.service';

@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.css']
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  @Input() userId: string;
  @Input() serverUrl: string = 'http://localhost:3000';

  notifications: Notification[] = [];
  isConnected: boolean = false;
  showDropdown: boolean = false;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.connect(this.serverUrl, this.userId);

    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
    });

    this.notificationService.connected$.subscribe(connected => {
      this.isConnected = connected;
    });
  }

  ngOnDestroy(): void {
    this.notificationService.disconnect();
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }
}
```

## Backend Integration

### Express.js Integration

```javascript
const express = require('express');
const axios = require('axios');

const app = express();
const NOTIFICATION_API = 'http://localhost:3000';

// Send notification when user places order
app.post('/orders', async (req, res) => {
  const { userId, items, total } = req.body;

  // Create order
  const order = await createOrder(userId, items, total);

  // Send notification
  await axios.post(`${NOTIFICATION_API}/notifications`, {
    userId,
    title: 'Order Confirmed',
    message: `Your order #${order.id} has been confirmed. Total: $${total}`,
    type: 'success'
  });

  res.json({ success: true, order });
});

// Broadcast notification to all users
app.post('/announcements', async (req, res) => {
  const { title, message } = req.body;

  await axios.post(`${NOTIFICATION_API}/notifications`, {
    broadcast: true,
    title,
    message,
    type: 'info'
  });

  res.json({ success: true });
});
```

### NestJS Integration

```typescript
import { Injectable, HttpService } from '@nestjs/common';

@Injectable()
export class OrderService {
  constructor(private httpService: HttpService) {}

  async createOrder(userId: string, items: any[], total: number) {
    // Create order
    const order = await this.orderRepository.create({ userId, items, total });

    // Send notification
    await this.httpService.post('http://localhost:3000/notifications', {
      userId,
      title: 'Order Confirmed',
      message: `Your order #${order.id} has been confirmed. Total: $${total}`,
      type: 'success'
    }).toPromise();

    return order;
  }
}
```

### Django Integration

```python
import requests

NOTIFICATION_API = 'http://localhost:3000'

def create_order(user_id, items, total):
    # Create order
    order = Order.objects.create(user_id=user_id, items=items, total=total)
    
    # Send notification
    requests.post(f'{NOTIFICATION_API}/notifications', json={
        'userId': user_id,
        'title': 'Order Confirmed',
        'message': f'Your order #{order.id} has been confirmed. Total: ${total}',
        'type': 'success'
    })
    
    return order
```

### Spring Boot Integration

```java
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@Service
public class OrderService {
    private static final String NOTIFICATION_API = "http://localhost:3000";
    private final RestTemplate restTemplate = new RestTemplate();

    public Order createOrder(String userId, List<Item> items, double total) {
        // Create order
        Order order = orderRepository.save(new Order(userId, items, total));

        // Send notification
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> notification = new HashMap<>();
        notification.put("userId", userId);
        notification.put("title", "Order Confirmed");
        notification.put("message", "Your order #" + order.getId() + " has been confirmed. Total: $" + total);
        notification.put("type", "success");

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(notification, headers);
        restTemplate.postForObject(NOTIFICATION_API + "/notifications", request, String.class);

        return order;
    }
}
```

## Mobile App Integration

### React Native

```javascript
import io from 'socket.io-client';
import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';

export const NotificationScreen = ({ userId }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const newSocket = io('http://your-server.com:3000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('register', { userId });
    });

    newSocket.on('registered', (data) => {
      setNotifications(data.pendingNotifications);
    });

    newSocket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      // Show push notification
      showPushNotification(notification);
    });

    return () => newSocket.close();
  }, [userId]);

  const markAsRead = (notificationId) => {
    socket.emit('markAsRead', { notificationId });
    setNotifications(prev =>
      prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
    );
  };

  return (
    <View>
      <FlatList
        data={notifications}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => markAsRead(item._id)}>
            <View style={[styles.item, item.read && styles.read]}>
              <Text style={styles.title}>{item.title}</Text>
              <Text>{item.message}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};
```

### Flutter

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

class NotificationService {
  IO.Socket? socket;
  List<Notification> notifications = [];

  void connect(String serverUrl, String userId) {
    socket = IO.io(serverUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': true,
    });

    socket!.on('connect', (_) {
      print('Connected');
      socket!.emit('register', {'userId': userId});
    });

    socket!.on('registered', (data) {
      notifications = (data['pendingNotifications'] as List)
          .map((n) => Notification.fromJson(n))
          .toList();
    });

    socket!.on('notification', (data) {
      notifications.insert(0, Notification.fromJson(data));
      // Show local notification
      showLocalNotification(data);
    });
  }

  void markAsRead(String notificationId) {
    socket!.emit('markAsRead', {'notificationId': notificationId});
  }

  void disconnect() {
    socket?.disconnect();
  }
}
```

## Real-World Use Cases

### 1. College ERP System

```javascript
// When exam results are published
async function publishResults(examId, results) {
  for (const result of results) {
    await axios.post('http://localhost:3000/notifications', {
      userId: result.studentId,
      title: 'Exam Results Published',
      message: `Your ${result.examName} results are now available. Score: ${result.score}`,
      type: result.passed ? 'success' : 'warning'
    });
  }
}

// Fee reminder
async function sendFeeReminder(studentId, amount, dueDate) {
  await axios.post('http://localhost:3000/notifications', {
    userId: studentId,
    title: 'Fee Payment Reminder',
    message: `Your fee payment of $${amount} is due on ${dueDate}`,
    type: 'warning'
  });
}

// Announcement to all students
async function sendAnnouncement(title, message) {
  await axios.post('http://localhost:3000/notifications', {
    broadcast: true,
    title,
    message,
    type: 'info'
  });
}
```

### 2. E-commerce Platform

```javascript
// Order status updates
const orderStatuses = {
  confirmed: 'Order Confirmed',
  shipped: 'Order Shipped',
  delivered: 'Order Delivered'
};

async function updateOrderStatus(orderId, userId, status) {
  await axios.post('http://localhost:3000/notifications', {
    userId,
    title: orderStatuses[status],
    message: `Your order #${orderId} has been ${status}`,
    type: 'success'
  });
}

// Low stock alert for sellers
async function notifyLowStock(sellerId, productName, quantity) {
  await axios.post('http://localhost:3000/notifications', {
    userId: sellerId,
    title: 'Low Stock Alert',
    message: `${productName} is running low. Only ${quantity} items left.`,
    type: 'warning'
  });
}
```

### 3. Social Media App

```javascript
// New follower
async function notifyNewFollower(userId, followerName) {
  await axios.post('http://localhost:3000/notifications', {
    userId,
    title: 'New Follower',
    message: `${followerName} started following you`,
    type: 'info'
  });
}

// Post liked
async function notifyPostLiked(userId, likerName, postId) {
  await axios.post('http://localhost:3000/notifications', {
    userId,
    title: 'New Like',
    message: `${likerName} liked your post`,
    type: 'success'
  });
}

// Comment on post
async function notifyComment(userId, commenterName, comment) {
  await axios.post('http://localhost:3000/notifications', {
    userId,
    title: 'New Comment',
    message: `${commenterName} commented: "${comment}"`,
    type: 'info'
  });
}
```

## Testing Integration

### Unit Test Example (Jest)

```javascript
import { io } from 'socket.io-client';

describe('Notification Integration', () => {
  let socket;

  beforeAll((done) => {
    socket = io('http://localhost:3000');
    socket.on('connect', done);
  });

  afterAll(() => {
    socket.close();
  });

  test('should register user', (done) => {
    socket.emit('register', { userId: 'test-user' });
    socket.on('registered', (data) => {
      expect(data.userId).toBe('test-user');
      done();
    });
  });

  test('should receive notification', (done) => {
    socket.on('notification', (notification) => {
      expect(notification).toHaveProperty('title');
      expect(notification).toHaveProperty('message');
      done();
    });

    // Trigger notification via REST API
    fetch('http://localhost:3000/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test-user',
        title: 'Test',
        message: 'Test message',
        type: 'info'
      })
    });
  });
});
```

## Best Practices

### 1. Error Handling
```javascript
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error);
  showErrorToUser('Unable to connect to notification server');
});
```

### 2. Reconnection Logic
```javascript
socket.on('reconnect', () => {
  const userId = localStorage.getItem('userId');
  if (userId) {
    socket.emit('register', { userId });
  }
});
```

### 3. Notification Persistence
```javascript
// Store in localStorage for offline access
socket.on('notification', (notification) => {
  const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
  stored.unshift(notification);
  localStorage.setItem('notifications', JSON.stringify(stored.slice(0, 100)));
});
```

### 4. Rate Limiting
```javascript
// Debounce notification requests
const sendNotification = debounce(async (data) => {
  await axios.post('/notifications', data);
}, 1000);
```

### 5. User Preferences
```javascript
// Allow users to control notification types
const preferences = {
  email: true,
  push: true,
  inApp: true,
  types: ['success', 'warning', 'error'] // Exclude 'info'
};

socket.on('notification', (notification) => {
  if (preferences.inApp && preferences.types.includes(notification.type)) {
    displayNotification(notification);
  }
});
```

## Troubleshooting

### Issue: Notifications not received
**Solution**: Check user registration, verify userId matches

### Issue: Duplicate notifications
**Solution**: Implement deduplication logic using notification ID

### Issue: Connection drops frequently
**Solution**: Implement reconnection logic, check network stability

### Issue: High latency
**Solution**: Deploy server closer to users, optimize database queries

## Summary

The notification system can be integrated into any application using:
- WebSocket for real-time updates
- REST API for sending notifications
- Framework-specific libraries and patterns

Choose the integration method that best fits your application architecture and user experience requirements.
