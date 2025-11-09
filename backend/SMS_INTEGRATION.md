# SMS Integration Documentation

## Overview
SMS notification system integrated with the CloudFlare SMS API for sending real-time updates to customers and employees via text messages.

## Features

### ✅ Implemented
- Sri Lankan phone number validation and normalization
- Multi-channel notifications (Email + SMS + In-app)
- SMS templates for common scenarios
- Error handling and fallback mechanisms
- Quiet hours detection (9 PM - 8 AM)
- Character limit management (160 chars per SMS)

### 📱 SMS Triggers

#### Customer Notifications
1. **Appointment Created** - Confirmation with date, time, and reference ID
2. **Appointment Confirmed** - Admin confirmation notification
3. **Status Updates** - Service progress updates (in-progress, completed)
4. **Service Completed** - Final notification with total cost
5. **Appointment Reminder** - 24 hours before scheduled time (planned)

#### Employee Notifications
1. **New Assignment** - When assigned to an appointment
2. **Urgent Updates** - Admin notifications (planned)

## Configuration

### Environment Variables (.env)
```env
# SMS Service Configuration
SMS_API_URL=https://arms-studies-loads-invitation.trycloudflare.com/send
SMS_ENABLED=true
```

### User Preferences
Users can enable/disable SMS notifications in their profile:
- `notificationPreferences.sms` - Master SMS toggle (default: false)
- Individual notification types can also be controlled

## Phone Number Format

### Supported Formats
- `0771234567` - Local format with leading zero
- `771234567` - Local format without leading zero
- `+94771234567` - International format
- `94771234567` - International without plus

### Validation Rules
- Must be Sri Lankan number (+94)
- Must have 9 digits after country code
- First digit after country code must be 1-9
- Common formats: 7XXXXXXXX, 1XXXXXXXX

## SMS Templates

### 1. Appointment Confirmation
```
Hi {customerName}! Your {serviceName} appointment is confirmed for {date} at {time}. Ref: {referenceId}. Thank you!
```

### 2. Status Update
```
Hi {customerName}! Your {vehicleMake} {vehicleModel} service is now {status}. We'll notify you when it's ready.
```

### 3. Service Completion
```
Hi {customerName}! Your {vehicleMake} {vehicleModel} service is complete. Total: ${totalCost}. Thank you for choosing us!
```

### 4. Appointment Reminder
```
Reminder: Your {serviceName} appointment is tomorrow at {time}. Contact us if you need to reschedule. Thank you!
```

### 5. Employee Assignment
```
Hi {employeeName}! New assignment: {serviceName} for {customerName} on {date} at {time}. Check your dashboard.
```

## API Integration

### SMS Service (smsService.js)

#### Methods

**`sendSms(phoneNumber, message)`**
- Sends SMS to a single recipient
- Auto-validates and normalizes phone number
- Truncates to 160 characters if needed

**`sendAppointmentConfirmation(data)`**
```javascript
await smsService.sendAppointmentConfirmation({
  phoneNumber: '0771234567',
  customerName: 'John Doe',
  serviceName: 'Oil Change',
  date: '2024-11-10',
  time: '10:00 AM',
  referenceId: 'APT12345'
});
```

**`sendStatusUpdate(data)`**
```javascript
await smsService.sendStatusUpdate({
  phoneNumber: '0771234567',
  customerName: 'John Doe',
  status: 'completed',
  vehicleMake: 'Toyota',
  vehicleModel: 'Camry'
});
```

**`sendServiceCompletion(data)`**
```javascript
await smsService.sendServiceCompletion({
  phoneNumber: '0771234567',
  customerName: 'John Doe',
  vehicleMake: 'Toyota',
  vehicleModel: 'Camry',
  totalCost: 150.50
});
```

### Notification Service Integration

The notification service automatically sends SMS when:
1. User has `phoneNumber` field populated
2. User has SMS enabled in preferences
3. Notification type is not disabled
4. SMS service is enabled globally

```javascript
// Notification flow
await notificationService.notifyAppointmentCreated(appointment, customerId);
// ↓ Triggers:
// 1. In-app notification (database + socket.io)
// 2. Email notification (if email enabled)
// 3. SMS notification (if phone number and SMS enabled)
```

## Testing

### Run SMS Tests
```bash
cd backend
node testSms.js
```

This will test:
- Phone number normalization
- Validation logic
- Template message generation
- Message length calculations

### Manual SMS Test
To send an actual SMS, edit `testSms.js` and uncomment the Test 3 section:
```javascript
const testPhone = '0771234567'; // Your number
const result = await smsService.sendSms(
  testPhone,
  'Test message from EAD Service Center.'
);
```

## Error Handling

### Graceful Degradation
- SMS failures don't block appointment creation
- Errors are logged but don't throw exceptions
- Falls back to email if SMS fails
- User still receives in-app notification

### Error Scenarios
1. **Invalid Phone Number** - Logs warning, skips SMS
2. **API Timeout** - 10-second timeout, logs error
3. **API Error Response** - Logs error details
4. **SMS Disabled** - Logs info message
5. **No Phone Number** - Silently skips SMS

## Best Practices

### Message Design
- ✅ Keep under 160 characters for single SMS
- ✅ Include business name for brand recognition
- ✅ Add reference numbers (last 8 chars of appointment ID)
- ✅ Use clear call-to-actions
- ✅ Be concise and friendly

### Rate Limiting (Planned)
- Queue bulk SMS sends
- Implement per-user rate limits
- Track SMS usage for analytics
- Add cost tracking

### Quiet Hours
- Respect 9 PM - 8 AM quiet period
- Queue non-urgent messages for 8 AM
- Urgent messages (cancellations) override quiet hours

## Troubleshooting

### SMS Not Sending

1. **Check SMS_ENABLED**
   ```env
   SMS_ENABLED=true  # Must be 'true' string
   ```

2. **Verify Phone Number**
   - Must be valid Sri Lankan number
   - Check database for correct format
   - Test with `smsService.isValidPhoneNumber()`

3. **Check User Preferences**
   ```javascript
   user.notificationPreferences.sms === true
   ```

4. **Review Logs**
   - Look for "📱 Sending SMS to:" messages
   - Check for error messages with ❌
   - Verify API responses

5. **Test API Endpoint**
   ```bash
   curl -X POST https://arms-studies-loads-invitation.trycloudflare.com/send \
     -H "Content-Type: application/json" \
     -d '{"phoneNumber":"+94771234567","message":"Test"}'
   ```

### Common Issues

**Issue**: SMS not received
- Verify phone number is correct
- Check API endpoint is accessible
- Ensure SMS_ENABLED=true
- Check quiet hours

**Issue**: Phone number validation fails
- Use Sri Lankan number format
- Ensure 9-10 digits after country code
- Don't use spaces or dashes in database

**Issue**: Message truncated
- Keep base message under 140 chars
- Allow 20 chars for variable data
- Test message length with template

## Future Enhancements

### Phase 2
- [ ] Two-way SMS (reply handling)
- [ ] SMS delivery tracking
- [ ] Bulk SMS for marketing
- [ ] SMS templates admin panel
- [ ] Multi-language support
- [ ] SMS analytics dashboard
- [ ] Cost tracking per SMS
- [ ] Alternative SMS providers (fallback)

### Phase 3
- [ ] Rich messaging (MMS)
- [ ] SMS scheduling
- [ ] A/B testing for messages
- [ ] Customer opt-out management
- [ ] SMS campaign management

## Security Considerations

- Phone numbers stored in database (not exposed in API responses)
- API calls use HTTPS
- No sensitive data in SMS messages
- Rate limiting to prevent abuse
- User consent for SMS notifications

## Compliance

- Users must enable SMS in preferences
- Easy opt-out mechanism
- No marketing SMS without consent
- Respect quiet hours for non-urgent messages
- Clear sender identification in messages

---

**Last Updated**: November 2025  
**Version**: 1.0.0  
**Maintainer**: EAD Development Team
