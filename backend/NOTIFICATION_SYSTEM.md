# Notification System Documentation

## Overview
This notification system provides real-time notifications using Socket.io and persistent storage with MongoDB.

## Features
- ✅ Real-time notifications via Socket.io
- ✅ Persistent notification storage in MongoDB
- ✅ User-specific and role-based notifications
- ✅ Read/unread status tracking
- ✅ Auto-deletion of old read notifications (30 days)
- ✅ Priority levels (low, medium, high, urgent)
- ✅ Multiple notification types
- ✅ RESTful API endpoints
- ✅ Socket.io events for real-time updates

## Architecture

### Components
1. **Model** (`models/Notification.js`) - MongoDB schema for notifications
2. **Controller** (`controllers/notificationController.js`) - HTTP endpoints
3. **Service** (`services/notificationService.js`) - Socket.io and notification logic
4. **Routes** (`routes/notifications.js`) - API route definitions
5. **Helper** (`utils/notificationHelper.js`) - Easy-to-use helper functions

## Installation

The required packages are already installed:
```bash
npm install socket.io
```

## Backend Integration

### 1. Server Setup (Already Done)
Socket.io is initialized in `server.js`:
```javascript
const { Server } = require('socket.io');
const notificationService = require('./services/notificationService');

const io = new Server(server, { /* cors config */ });
notificationService.initialize(io);
```

### 2. Using Notifications in Controllers

Import the helper:
```javascript
const { notifyAppointmentCreated } = require('../utils/notificationHelper');
```

Send notifications:
```javascript
// Example: In appointmentController.js
await notifyAppointmentCreated(appointment, customerId);
```

### 3. Available Helper Functions

```javascript
// Appointment notifications
notifyAppointmentCreated(appointment, customerId)
notifyAppointmentConfirmed(appointment, customerId)
notifyAppointmentCancelled(appointment, userId, role)
notifyAppointmentReminder(appointment, customerId)

// Service notifications
notifyServiceStarted(serviceRecord, customerId)
notifyServiceCompleted(serviceRecord, customerId)
notifyVehicleReady(serviceRecord, customerId)

// Custom notifications
sendCustomNotification(userId, {
  recipientRole: 'customer',
  type: 'system_notification',
  title: 'Custom Title',
  message: 'Custom message',
  priority: 'medium'
})

// Broadcast to all users with a role
notifyRole('employee', notificationData)
```

## API Endpoints

All endpoints require authentication.

### Get Notifications
```http
GET /api/notifications?page=1&limit=20&unreadOnly=false
```

Response:
```json
{
  "success": true,
  "data": {
    "notifications": [...],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "pages": 3
    },
    "unreadCount": 5
  }
}
```

### Get Unread Count
```http
GET /api/notifications/unread-count
```

### Mark as Read
```http
PATCH /api/notifications/:id/read
```

### Mark All as Read
```http
PATCH /api/notifications/read-all
```

### Delete Notification
```http
DELETE /api/notifications/:id
```

### Delete All Read
```http
DELETE /api/notifications/read/all
```

## Frontend Integration

### 1. Install Socket.io Client
```bash
npm install socket.io-client
```

### 2. Connect to Socket.io

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  withCredentials: true
});

// Authenticate after connection
socket.on('connect', () => {
  socket.emit('authenticate', {
    userId: currentUser._id,
    role: currentUser.role
  });
});

// Listen for new notifications
socket.on('new_notification', (data) => {
  console.log('New notification:', data.notification);
  console.log('Unread count:', data.unreadCount);
  // Update UI
});

// Listen for unread count updates
socket.on('unread_count', (data) => {
  console.log('Unread count:', data.count);
  // Update badge
});

// Mark notification as read
socket.emit('mark_read', notificationId);
```

### 3. React Context Example

```javascript
import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const newSocket = io('http://localhost:5000', {
      withCredentials: true
    });

    newSocket.on('connect', () => {
      newSocket.emit('authenticate', {
        userId: user._id,
        role: user.role
      });
    });

    newSocket.on('new_notification', (data) => {
      setNotifications(prev => [data.notification, ...prev]);
      setUnreadCount(data.unreadCount);
      // Show toast notification
    });

    newSocket.on('unread_count', (data) => {
      setUnreadCount(data.count);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [user]);

  return (
    <NotificationContext.Provider value={{ 
      socket, 
      notifications, 
      unreadCount 
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
```

## Notification Types

- `appointment_created` - New appointment created
- `appointment_confirmed` - Appointment confirmed
- `appointment_cancelled` - Appointment cancelled
- `appointment_reminder` - Appointment reminder
- `service_started` - Service work started
- `service_completed` - Service completed
- `vehicle_ready` - Vehicle ready for pickup
- `payment_reminder` - Payment reminder
- `system_notification` - General system notification

## Priority Levels

- `low` - General updates
- `medium` - Standard notifications (default)
- `high` - Important updates
- `urgent` - Critical notifications

## Example Integration in Appointment Controller

```javascript
const { notifyAppointmentCreated, notifyAppointmentConfirmed } = require('../utils/notificationHelper');

// Create appointment
const appointment = await Appointment.create(appointmentData);
await notifyAppointmentCreated(appointment, customerId);

// Confirm appointment
appointment.status = 'confirmed';
await appointment.save();
await notifyAppointmentConfirmed(appointment, appointment.customer);
```

## Testing

### Test Socket.io Connection
```javascript
// In browser console
const socket = io('http://localhost:5000');
socket.on('connect', () => {
  console.log('Connected!');
  socket.emit('authenticate', { userId: 'YOUR_USER_ID', role: 'customer' });
});
socket.on('new_notification', (data) => console.log(data));
```

### Test API Endpoints
```bash
# Get notifications
curl -X GET http://localhost:5000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"

# Mark as read
curl -X PATCH http://localhost:5000/api/notifications/NOTIFICATION_ID/read \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Database Schema

```javascript
{
  recipient: ObjectId,          // User who receives notification
  recipientRole: String,         // customer, employee, admin
  type: String,                  // Notification type
  title: String,                 // Notification title
  message: String,               // Notification message
  relatedEntity: {
    entityType: String,          // appointment, service, etc.
    entityId: ObjectId           // ID of related entity
  },
  isRead: Boolean,               // Read status
  readAt: Date,                  // When it was read
  priority: String,              // low, medium, high, urgent
  actionUrl: String,             // URL for action button
  metadata: Map,                 // Additional data
  createdAt: Date,
  updatedAt: Date
}
```

## Auto-cleanup

Read notifications are automatically deleted after 30 days using MongoDB TTL index.

## Performance Considerations

- Notifications are indexed for fast queries
- Socket connections are mapped in memory for efficient lookups
- Pagination is supported for large notification lists
- Old notifications are auto-deleted to prevent database bloat

## Security

- All API endpoints require authentication
- Socket connections must be authenticated
- Users can only access their own notifications
- CORS is properly configured

## Next Steps

To integrate notifications into your existing controllers:

1. Import the helper: `const { notifyAppointmentCreated } = require('../utils/notificationHelper');`
2. Call the appropriate function after creating/updating records
3. Frontend: Set up Socket.io client and listen for events
4. Frontend: Create UI components for notification display

## Support

For issues or questions, refer to:
- Socket.io documentation: https://socket.io/docs/
- MongoDB TTL indexes: https://docs.mongodb.com/manual/core/index-ttl/
