# EAD Backend - Vehicle Service Management System

A comprehensive backend system for managing vehicle service appointments, built with Node.js, Express, and MongoDB.

## Features

- ✅ **Authentication System** - Employee and customer authentication with JWT
- 🚗 **Vehicle Management** - Complete vehicle information tracking
- 📅 **Appointment System** - Book, manage, and track service appointments
- 🔧 **Service Management** - Pre-defined services with pricing and duration
- 📝 **Work Logs** - Track technician work and time logs
- 📊 **Dashboard Analytics** - Real-time statistics and insights
- 🗓️ **Calendar Integration** - Schedule and view appointments
- 💳 **Payment Tracking** - Track appointment fees and payments

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer
- **Security**: bcryptjs, CORS

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   
   The `.env` file is already configured. Update if needed:
   ```env
   MONGODB_URI=your-mongodb-connection-string
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your-secret-key
   ```

3. **Seed the database (optional)**
   ```bash
   node seedServices.js
   ```

4. **Start the server**
   
   Development mode:
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

## API Documentation

Comprehensive API documentation is available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Quick API Overview

#### Authentication (Existing - Working)
- `POST /api/auth/employee/login` - Employee login
- `POST /api/auth/customer/signup` - Customer registration
- `POST /api/auth/customer/send-otp` - Send OTP
- `POST /api/auth/customer/verify-otp` - Verify OTP

#### Appointments (New)
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `PATCH /api/appointments/:id/status` - Update status
- `PATCH /api/appointments/:id/reschedule` - Reschedule

#### Vehicles (New)
- `POST /api/vehicles` - Register vehicle
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/number/:vehicleNumber` - Get by vehicle number

#### Services (New)
- `GET /api/services` - Get all services
- `GET /api/services/popular` - Get popular services

#### Dashboard (New)
- `GET /api/dashboard/stats` - Get statistics
- `GET /api/dashboard/schedule/today` - Today's schedule
- `GET /api/dashboard/calendar/events` - Calendar events

## Database Models

### Appointment
- Customer and vehicle information
- Service details and scheduling
- Status tracking (pending, confirmed, in-service, completed, cancelled)
- Payment information
- Assignment to employees

### Vehicle
- Vehicle identification (number, make, model, year)
- Owner information
- Service history
- Technical details

### Service
- Service types with pricing
- Duration estimates
- Step-by-step procedures
- Popularity tracking

### WorkLog
- Time tracking for technicians
- Task details and status
- Parts used and costs

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `node seedServices.js` - Seed database with services

## Testing the API

Health check:
```bash
curl http://localhost:5000/api/health
```

Get all services:
```bash
curl http://localhost:5000/api/services
```

## Support

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
