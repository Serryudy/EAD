# SMS Quick Start Guide

## ⚡ Quick Setup (5 Minutes)

### Step 1: Verify Configuration ✅
Your `.env` file already has:
```env
SMS_API_URL=https://arms-studies-loads-invitation.trycloudflare.com/send
SMS_ENABLED=true
```

### Step 2: Test SMS Service ✅
```bash
cd backend
node testSms.js
```

You should see:
- ✅ Phone number validation working
- ✅ Template messages generated
- ✅ All tests passing

### Step 3: Send Test SMS (Optional)
Edit `testSms.js` line 38-45 and uncomment:
```javascript
const testPhone = '0771234567'; // YOUR PHONE NUMBER
const result = await smsService.sendSms(
  testPhone,
  'Test from EAD!'
);
```

Then run: `node testSms.js`

### Step 4: Enable SMS for Users

**Option A: Enable for specific user (MongoDB)**
```javascript
db.users.updateOne(
  { email: "customer@example.com" },
  { 
    $set: { 
      "notificationPreferences.sms": true,
      "phoneNumber": "0771234567"  // Must have phone number
    }
  }
)
```

**Option B: Enable by default for new users**
Update `models/User.js` line 120:
```javascript
sms: {
  type: Boolean,
  default: true  // Changed from false
}
```

---

## 🎯 That's It!

SMS notifications will now automatically send when:
- ✅ Appointment created
- ✅ Appointment confirmed
- ✅ Status updated
- ✅ Service completed

---

## 📱 Example Flow

**Customer books appointment:**
1. Goes to booking page
2. Selects service, vehicle, date, time
3. Confirms booking
4. **Immediately receives:**
   - In-app notification 🔔
   - Email notification 📧
   - **SMS notification 📱**

**SMS Message Received:**
```
Hi John! Your Oil Change appointment is 
confirmed for 11/10/2025 at 10:00 AM. 
Ref: APT12345. Thank you!
```

---

## 🔍 Verify It's Working

**Check server logs for:**
```
📱 Sending SMS to: +94771234567
📝 Message: Hi John! Your Oil Change...
✅ SMS sent successfully
```

**If you see errors:**
```
❌ SMS sending failed: [error message]
```
Then check:
1. SMS_ENABLED=true in .env
2. User has phoneNumber field
3. User has SMS enabled in preferences
4. Phone number is valid Sri Lankan number

---

## 💡 Pro Tips

### For Testing:
- Use your own phone number
- Check SMS delivery immediately
- Monitor server console for logs

### For Production:
- Ask users to verify phone numbers
- Add phone number to signup form
- Add SMS preferences to profile page
- Monitor SMS usage/costs

### Phone Number Formats:
All these work:
- `0771234567` ✅
- `771234567` ✅
- `+94771234567` ✅
- `94771234567` ✅

---

## 📚 Need More Info?

- **Full Documentation**: See `SMS_INTEGRATION.md`
- **Integration Summary**: See `SMS_INTEGRATION_SUMMARY.md`
- **Code Reference**: See `services/smsService.js`

---

**Ready to go! 🚀**
