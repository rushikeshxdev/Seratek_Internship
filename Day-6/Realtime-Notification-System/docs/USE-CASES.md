# Use Cases

## Real-World Applications

This document provides detailed use cases and implementation examples for various industries and scenarios.

## 1. College/University ERP System

### Overview
Educational institutions need to notify students, faculty, and staff about various events, deadlines, and updates.

### Use Cases

#### 1.1 Exam Results Publication

**Scenario**: When exam results are published, notify all students instantly.

**Implementation**:
```javascript
// Backend: When results are published
async function publishExamResults(examId) {
  const results = await getExamResults(examId);
  
  for (const result of results) {
    const passed = result.score >= result.passingMarks;
    
    await axios.post('http://localhost:3000/notifications', {
      userId: result.studentId,
      title: passed ? '🎉 Exam Results - Passed!' : '📊 Exam Results Available',
      message: `Your ${result.examName} results are now available. Score: ${result.score}/${result.totalMarks}`,
      type: passed ? 'success' : 'info'
    });
  }
}
```

**Student Experience**:
1. Student is browsing the portal
2. Notification appears instantly: "🎉 Exam Results - Passed!"
3. Student clicks to view detailed results
4. No need to refresh or check repeatedly

#### 1.2 Fee Payment Reminders

**Scenario**: Send reminders to students with pending fee payments.

**Implementation**:
```javascript
// Scheduled job (runs daily)
async function sendFeeReminders() {
  const pendingPayments = await getPendingFeePayments();
  
  for (const payment of pendingPayments) {
    const daysUntilDue = getDaysUntilDue(payment.dueDate);
    
    let type = 'info';
    let title = 'Fee Payment Reminder';
    
    if (daysUntilDue <= 3) {
      type = 'warning';
      title = '⚠️ Fee Payment Due Soon';
    } else if (daysUntilDue < 0) {
      type = 'error';
      title = '🚨 Fee Payment Overdue';
    }
    
    await axios.post('http://localhost:3000/notifications', {
      userId: payment.studentId,
      title,
      message: `Your ${payment.semester} semester fee of $${payment.amount} is due on ${formatDate(payment.dueDate)}`,
      type
    });
  }
}
```

#### 1.3 Class Cancellation/Rescheduling

**Scenario**: Notify students when a class is cancelled or rescheduled.

**Implementation**:
```javascript
async function notifyClassChange(classId, changeType, newDetails) {
  const enrolledStudents = await getEnrolledStudents(classId);
  const classInfo = await getClassInfo(classId);
  
  const messages = {
    cancelled: `Your ${classInfo.name} class scheduled for ${classInfo.time} has been cancelled.`,
    rescheduled: `Your ${classInfo.name} class has been rescheduled to ${newDetails.time} in ${newDetails.room}.`,
    roomChanged: `Your ${classInfo.name} class room has been changed to ${newDetails.room}.`
  };
  
  for (const student of enrolledStudents) {
    await axios.post('http://localhost:3000/notifications', {
      userId: student.id,
      title: `📚 Class ${changeType.charAt(0).toUpperCase() + changeType.slice(1)}`,
      message: messages[changeType],
      type: changeType === 'cancelled' ? 'warning' : 'info'
    });
  }
}
```

#### 1.4 Assignment Deadlines

**Scenario**: Remind students about upcoming assignment deadlines.

**Implementation**:
```javascript
// Scheduled job (runs every hour)
async function sendAssignmentReminders() {
  const upcomingDeadlines = await getUpcomingDeadlines(24); // Next 24 hours
  
  for (const assignment of upcomingDeadlines) {
    const students = await getEnrolledStudents(assignment.courseId);
    
    for (const student of students) {
      const submitted = await hasSubmitted(student.id, assignment.id);
      
      if (!submitted) {
        await axios.post('http://localhost:3000/notifications', {
          userId: student.id,
          title: '⏰ Assignment Deadline Approaching',
          message: `Your ${assignment.title} assignment is due in ${getHoursUntil(assignment.deadline)} hours!`,
          type: 'warning'
        });
      }
    }
  }
}
```

#### 1.5 Campus Announcements

**Scenario**: Broadcast important announcements to all students.

**Implementation**:
```javascript
async function sendCampusAnnouncement(title, message, targetAudience = 'all') {
  if (targetAudience === 'all') {
    // Broadcast to everyone
    await axios.post('http://localhost:3000/notifications', {
      broadcast: true,
      title: `📢 ${title}`,
      message,
      type: 'info'
    });
  } else {
    // Send to specific group (e.g., all students in a department)
    const users = await getUsersByAudience(targetAudience);
    
    for (const user of users) {
      await axios.post('http://localhost:3000/notifications', {
        userId: user.id,
        title: `📢 ${title}`,
        message,
        type: 'info'
      });
    }
  }
}

// Usage
await sendCampusAnnouncement(
  'Campus Closure',
  'The campus will be closed on Monday due to maintenance.',
  'all'
);
```

### Benefits for Educational Institutions

1. **Instant Communication**: No delays in critical information
2. **Reduced Email Overload**: Important notifications stand out
3. **Better Engagement**: Students stay informed and engaged
4. **Automated Reminders**: Reduce administrative workload
5. **Improved Attendance**: Timely class change notifications

## 2. E-commerce Platform

### Overview
Online stores need to keep customers informed about their orders, promotions, and account activities.

### Use Cases

#### 2.1 Order Status Updates

**Scenario**: Notify customers at each stage of order fulfillment.

**Implementation**:
```javascript
const orderStatuses = {
  placed: {
    title: '🛍️ Order Placed',
    message: 'Your order has been placed successfully!',
    type: 'success'
  },
  confirmed: {
    title: '✅ Order Confirmed',
    message: 'Your order has been confirmed and is being prepared.',
    type: 'success'
  },
  shipped: {
    title: '📦 Order Shipped',
    message: 'Your order has been shipped! Track your package.',
    type: 'success'
  },
  outForDelivery: {
    title: '🚚 Out for Delivery',
    message: 'Your order is out for delivery and will arrive today!',
    type: 'info'
  },
  delivered: {
    title: '✨ Order Delivered',
    message: 'Your order has been delivered. Enjoy your purchase!',
    type: 'success'
  }
};

async function updateOrderStatus(orderId, userId, status, trackingNumber = null) {
  const order = await getOrder(orderId);
  const statusInfo = orderStatuses[status];
  
  let message = statusInfo.message;
  if (trackingNumber) {
    message += ` Tracking: ${trackingNumber}`;
  }
  
  await axios.post('http://localhost:3000/notifications', {
    userId,
    title: statusInfo.title,
    message: `Order #${orderId}: ${message}`,
    type: statusInfo.type
  });
}
```

#### 2.2 Price Drop Alerts

**Scenario**: Notify users when items in their wishlist go on sale.

**Implementation**:
```javascript
async function checkPriceDrops() {
  const wishlistItems = await getWishlistItems();
  
  for (const item of wishlistItems) {
    if (item.currentPrice < item.originalPrice) {
      const discount = Math.round(((item.originalPrice - item.currentPrice) / item.originalPrice) * 100);
      
      await axios.post('http://localhost:3000/notifications', {
        userId: item.userId,
        title: '💰 Price Drop Alert!',
        message: `${item.productName} is now ${discount}% off! Was $${item.originalPrice}, now $${item.currentPrice}`,
        type: 'success'
      });
    }
  }
}
```

#### 2.3 Low Stock Alerts (for Sellers)

**Scenario**: Alert sellers when product inventory is running low.

**Implementation**:
```javascript
async function checkInventoryLevels() {
  const lowStockProducts = await getProductsBelowThreshold();
  
  for (const product of lowStockProducts) {
    const seller = await getSeller(product.sellerId);
    
    let type = 'warning';
    let title = '⚠️ Low Stock Alert';
    
    if (product.quantity === 0) {
      type = 'error';
      title = '🚨 Out of Stock';
    }
    
    await axios.post('http://localhost:3000/notifications', {
      userId: seller.id,
      title,
      message: `${product.name} has only ${product.quantity} units left. Consider restocking.`,
      type
    });
  }
}
```

#### 2.4 Cart Abandonment Reminders

**Scenario**: Remind users about items left in their cart.

**Implementation**:
```javascript
// Scheduled job (runs every hour)
async function sendCartReminders() {
  const abandonedCarts = await getAbandonedCarts(24); // Abandoned for 24 hours
  
  for (const cart of abandonedCarts) {
    const itemCount = cart.items.length;
    const totalValue = cart.items.reduce((sum, item) => sum + item.price, 0);
    
    await axios.post('http://localhost:3000/notifications', {
      userId: cart.userId,
      title: '🛒 Items Waiting in Your Cart',
      message: `You have ${itemCount} item(s) worth $${totalValue.toFixed(2)} in your cart. Complete your purchase now!`,
      type: 'info'
    });
  }
}
```

#### 2.5 Flash Sale Notifications

**Scenario**: Notify users about time-limited sales.

**Implementation**:
```javascript
async function announceFlashSale(saleDetails) {
  // Notify all users
  await axios.post('http://localhost:3000/notifications', {
    broadcast: true,
    title: '⚡ Flash Sale Alert!',
    message: `${saleDetails.discount}% off on ${saleDetails.category}! Sale ends in ${saleDetails.duration} hours.`,
    type: 'success'
  });
  
  // Also notify users who have items from that category in wishlist
  const interestedUsers = await getUsersInterestedInCategory(saleDetails.category);
  
  for (const user of interestedUsers) {
    await axios.post('http://localhost:3000/notifications', {
      userId: user.id,
      title: '🎯 Flash Sale on Your Wishlist Items!',
      message: `Items you're interested in are now ${saleDetails.discount}% off! Don't miss out.`,
      type: 'success'
    });
  }
}
```

### Benefits for E-commerce

1. **Increased Sales**: Timely reminders drive conversions
2. **Customer Satisfaction**: Keep customers informed
3. **Reduced Support Queries**: Proactive order updates
4. **Inventory Management**: Sellers stay on top of stock
5. **Engagement**: Flash sales and price drops drive traffic

## 3. Social Media Platform

### Overview
Social platforms need to notify users about interactions, messages, and content updates.

### Use Cases

#### 3.1 New Follower Notifications

**Implementation**:
```javascript
async function notifyNewFollower(userId, followerId) {
  const follower = await getUser(followerId);
  
  await axios.post('http://localhost:3000/notifications', {
    userId,
    title: '👤 New Follower',
    message: `${follower.name} (@${follower.username}) started following you`,
    type: 'info'
  });
}
```

#### 3.2 Post Interactions (Likes, Comments, Shares)

**Implementation**:
```javascript
async function notifyPostInteraction(postId, interactionType, actorId) {
  const post = await getPost(postId);
  const actor = await getUser(actorId);
  
  const interactions = {
    like: {
      title: '❤️ New Like',
      message: `${actor.name} liked your post`
    },
    comment: {
      title: '💬 New Comment',
      message: `${actor.name} commented on your post`
    },
    share: {
      title: '🔄 Post Shared',
      message: `${actor.name} shared your post`
    }
  };
  
  const notification = interactions[interactionType];
  
  await axios.post('http://localhost:3000/notifications', {
    userId: post.authorId,
    title: notification.title,
    message: notification.message,
    type: 'success'
  });
}
```

#### 3.3 Direct Messages

**Implementation**:
```javascript
async function notifyNewMessage(senderId, recipientId, messagePreview) {
  const sender = await getUser(senderId);
  
  await axios.post('http://localhost:3000/notifications', {
    userId: recipientId,
    title: '💌 New Message',
    message: `${sender.name}: ${messagePreview}`,
    type: 'info'
  });
}
```

#### 3.4 Mention Notifications

**Implementation**:
```javascript
async function notifyMention(postId, mentionedUserId, authorId) {
  const author = await getUser(authorId);
  const post = await getPost(postId);
  
  await axios.post('http://localhost:3000/notifications', {
    userId: mentionedUserId,
    title: '@ Mentioned',
    message: `${author.name} mentioned you in a post`,
    type: 'info'
  });
}
```

#### 3.5 Live Stream Notifications

**Implementation**:
```javascript
async function notifyLiveStream(streamerId) {
  const streamer = await getUser(streamerId);
  const followers = await getFollowers(streamerId);
  
  for (const follower of followers) {
    await axios.post('http://localhost:3000/notifications', {
      userId: follower.id,
      title: '🔴 Live Now!',
      message: `${streamer.name} is live streaming now. Join to watch!`,
      type: 'info'
    });
  }
}
```

### Benefits for Social Media

1. **User Engagement**: Keep users active and engaged
2. **Real-time Interactions**: Instant feedback on content
3. **Community Building**: Foster connections between users
4. **Content Discovery**: Notify about relevant content
5. **Retention**: Keep users coming back

## 4. Healthcare System

### Overview
Healthcare providers need to send appointment reminders, test results, and health alerts.

### Use Cases

#### 4.1 Appointment Reminders

**Implementation**:
```javascript
async function sendAppointmentReminders() {
  const upcomingAppointments = await getAppointmentsInNext24Hours();
  
  for (const appointment of upcomingAppointments) {
    const hoursUntil = getHoursUntil(appointment.dateTime);
    
    await axios.post('http://localhost:3000/notifications', {
      userId: appointment.patientId,
      title: '🏥 Appointment Reminder',
      message: `Your appointment with Dr. ${appointment.doctorName} is in ${hoursUntil} hours at ${formatTime(appointment.dateTime)}`,
      type: 'info'
    });
  }
}
```

#### 4.2 Test Results Available

**Implementation**:
```javascript
async function notifyTestResults(patientId, testName) {
  await axios.post('http://localhost:3000/notifications', {
    userId: patientId,
    title: '📋 Test Results Available',
    message: `Your ${testName} results are now available. Please check your patient portal.`,
    type: 'success'
  });
}
```

#### 4.3 Medication Reminders

**Implementation**:
```javascript
async function sendMedicationReminders() {
  const prescriptions = await getActivePrescriptions();
  
  for (const prescription of prescriptions) {
    const currentTime = new Date().getHours();
    
    if (prescription.times.includes(currentTime)) {
      await axios.post('http://localhost:3000/notifications', {
        userId: prescription.patientId,
        title: '💊 Medication Reminder',
        message: `Time to take your ${prescription.medicationName} (${prescription.dosage})`,
        type: 'warning'
      });
    }
  }
}
```

#### 4.4 Health Alerts

**Implementation**:
```javascript
async function sendHealthAlert(patientId, alertType, message) {
  const alertTypes = {
    critical: { type: 'error', icon: '🚨' },
    warning: { type: 'warning', icon: '⚠️' },
    info: { type: 'info', icon: 'ℹ️' }
  };
  
  const alert = alertTypes[alertType];
  
  await axios.post('http://localhost:3000/notifications', {
    userId: patientId,
    title: `${alert.icon} Health Alert`,
    message,
    type: alert.type
  });
}
```

### Benefits for Healthcare

1. **Improved Compliance**: Medication and appointment reminders
2. **Timely Communication**: Quick delivery of test results
3. **Patient Safety**: Critical health alerts
4. **Reduced No-shows**: Appointment reminders
5. **Better Outcomes**: Proactive health management

## 5. Banking & Finance

### Overview
Financial institutions need to notify customers about transactions, security alerts, and account activities.

### Use Cases

#### 5.1 Transaction Alerts

**Implementation**:
```javascript
async function notifyTransaction(userId, transaction) {
  const type = transaction.amount > 0 ? 'success' : 'info';
  const action = transaction.amount > 0 ? 'credited to' : 'debited from';
  
  await axios.post('http://localhost:3000/notifications', {
    userId,
    title: '💳 Transaction Alert',
    message: `$${Math.abs(transaction.amount)} ${action} your account. Balance: $${transaction.newBalance}`,
    type
  });
}
```

#### 5.2 Security Alerts

**Implementation**:
```javascript
async function notifySecurityEvent(userId, eventType, details) {
  const events = {
    loginFromNewDevice: {
      title: '🔐 New Device Login',
      message: `Login detected from ${details.device} in ${details.location}`,
      type: 'warning'
    },
    passwordChanged: {
      title: '🔑 Password Changed',
      message: 'Your password was changed successfully',
      type: 'success'
    },
    suspiciousActivity: {
      title: '🚨 Suspicious Activity',
      message: `Unusual activity detected on your account. Please verify.`,
      type: 'error'
    }
  };
  
  const event = events[eventType];
  
  await axios.post('http://localhost:3000/notifications', {
    userId,
    title: event.title,
    message: event.message,
    type: event.type
  });
}
```

#### 5.3 Bill Payment Reminders

**Implementation**:
```javascript
async function sendBillReminders() {
  const upcomingBills = await getBillsDueInNext7Days();
  
  for (const bill of upcomingBills) {
    const daysUntilDue = getDaysUntilDue(bill.dueDate);
    
    await axios.post('http://localhost:3000/notifications', {
      userId: bill.userId,
      title: '📅 Bill Payment Reminder',
      message: `Your ${bill.billerName} bill of $${bill.amount} is due in ${daysUntilDue} days`,
      type: daysUntilDue <= 2 ? 'warning' : 'info'
    });
  }
}
```

### Benefits for Banking

1. **Fraud Prevention**: Instant security alerts
2. **Customer Awareness**: Real-time transaction notifications
3. **Payment Compliance**: Bill reminders reduce late fees
4. **Trust**: Transparent communication builds confidence
5. **Engagement**: Keep customers informed about their finances

## Implementation Best Practices

### 1. Notification Frequency Management

```javascript
// Don't spam users
const notificationLimits = {
  perHour: 10,
  perDay: 50
};

async function canSendNotification(userId) {
  const recentCount = await getNotificationCount(userId, 'hour');
  return recentCount < notificationLimits.perHour;
}
```

### 2. User Preferences

```javascript
// Respect user notification preferences
async function sendNotificationIfAllowed(userId, notification) {
  const preferences = await getUserPreferences(userId);
  
  if (preferences.notifications.enabled && 
      preferences.notifications.types.includes(notification.type)) {
    await sendNotification(userId, notification);
  }
}
```

### 3. Notification Grouping

```javascript
// Group similar notifications
async function groupNotifications(userId, notifications) {
  if (notifications.length > 5) {
    return {
      title: `${notifications.length} New Notifications`,
      message: 'You have multiple new notifications. Click to view all.',
      type: 'info'
    };
  }
  return notifications;
}
```

### 4. Priority Levels

```javascript
// Implement notification priorities
const priorities = {
  critical: { sound: true, vibrate: true, persistent: true },
  high: { sound: true, vibrate: false, persistent: false },
  normal: { sound: false, vibrate: false, persistent: false }
};

async function sendPriorityNotification(userId, notification, priority) {
  const settings = priorities[priority];
  await sendNotification(userId, { ...notification, ...settings });
}
```

## Summary

The Real-time Notification System can be adapted to virtually any industry:

- **Education**: Keep students and faculty informed
- **E-commerce**: Drive sales and customer satisfaction
- **Social Media**: Boost engagement and retention
- **Healthcare**: Improve patient outcomes
- **Finance**: Enhance security and transparency

The key is to identify critical events in your application and notify users at the right time with the right information.
