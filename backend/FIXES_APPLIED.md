# Backend Issues Fixed

## Issues Found & Solutions Applied

### 1. ❌ MongoDB Connection Error
**Problem:** `querySrv ENOTFOUND _mongodb._tcp.ead.nya3hdq.mongodb.net`

**Cause:** The MongoDB Atlas cluster might be:
- Deleted or inactive
- Network access restrictions
- Invalid credentials
- DNS resolution issues

**Solutions Applied:**
- Added comment in `.env` suggesting local MongoDB as fallback
- Keep the Atlas URI but note it may need updating

**Action Required:**
You need to do ONE of the following:

#### Option A: Use Local MongoDB (Recommended for Development)
```bash
# Install MongoDB Community Edition locally
# Then update .env:
MONGODB_URI=mongodb://localhost:27017/EAD
```

#### Option B: Fix MongoDB Atlas Connection
1. Go to https://cloud.mongodb.com/
2. Check if cluster `ead.nya3hdq.mongodb.net` exists and is active
3. Verify Network Access (add your IP: 0.0.0.0/0 for development)
4. Verify Database Access (check username/password)
5. Get fresh connection string and update `.env`

---

### 2. ⚠️ Cloudinary API Secret Missing
**Problem:** `CLOUDINARY_API_SECRET: NOT SET`

**Cause:** Environment variables for Cloudinary not configured

**Solution Applied:**
- Added Cloudinary configuration section to `.env` with placeholder values

**Action Required:**
1. Sign up at https://cloudinary.com/ (free tier available)
2. Get your credentials from https://cloudinary.com/console
3. Update `.env` with your actual values:
```env
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

**Note:** Profile picture uploads won't work until this is configured.

---

### 3. ⚠️ Mongoose Duplicate Index Warnings
**Problem:** 
```
Duplicate schema index on {"employeeId":1} found
Duplicate schema index on {"username":1} found
Duplicate schema index on {"email":1} found
```

**Cause:** Indexes defined both in field definition (`unique: true`) AND in `schema.index()`

**Solution Applied:**
- Removed `unique: true` from field definitions in `models/User.js`
- Kept unique indexes only in `schema.index()` declarations
- Added `nic` unique index that was missing

**Result:** No more duplicate index warnings

---

## Testing the Fixes

After applying fixes and configuring MongoDB + Cloudinary:

```bash
# Start the backend
cd backend
npm run dev

# Expected output:
# ✅ Cloudinary configured successfully
# ✅ MongoDB connected successfully
# 🚀 Server running on port 5000
# (No warnings or errors)
```

---

## Quick Start Checklist

- [x] Fixed duplicate index warnings in User model
- [x] Added Cloudinary config section to .env
- [ ] Choose MongoDB option (local or Atlas)
- [ ] Configure MongoDB connection
- [ ] Get Cloudinary credentials and update .env
- [ ] Restart server and verify all services connect

---

## Summary

**Fixed Automatically:**
1. ✅ Duplicate Mongoose index warnings
2. ✅ Added Cloudinary env variables structure

**Requires Your Action:**
1. ⏳ Configure MongoDB connection (local or Atlas)
2. ⏳ Add Cloudinary credentials

Once you configure MongoDB and Cloudinary, the backend will run without errors!
