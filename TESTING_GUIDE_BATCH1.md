# 🧪 BOOKING WIZARD - MANUAL TESTING GUIDE

## ✅ Pre-Test Checklist

- [x] Backend server running on http://localhost:5000
- [ ] Frontend server running on http://localhost:5174
- [ ] MongoDB connected
- [ ] Admin user exists (username: `admin`, password: `Admin@123`)

---

## 🎯 TEST PLAN - BATCH 1 (3 Components)

### **Test 1: Service Selection Step** ⏱️ 3 minutes

#### Steps:
1. Open http://localhost:5174
2. Login with admin credentials (if needed)
3. Navigate to **Dashboard** → Click **"Book Appointment"** button
4. You should see the Booking Wizard on Step 1: "Select Services"

#### What to Test:
- [ ] Services load from API (should show grid of service cards)
- [ ] Each service shows: name, category, duration (hours), price
- [ ] Can select multiple services with checkboxes
- [ ] Total duration calculation updates in real-time
- [ ] Total cost calculation updates in real-time
- [ ] "Next" button is disabled when no services selected
- [ ] "Next" button becomes enabled after selecting ≥1 service
- [ ] Can deselect services and totals update

#### Expected Results:
✅ Services display in grid layout  
✅ Checkboxes work for multi-select  
✅ Totals show: "~Xh total" and "$X.XX total"  
✅ Can't proceed without selecting services  

#### Screenshot Checkpoints:
📸 Service grid loaded  
📸 Multiple services selected with totals  
📸 "Next" button enabled  

---

### **Test 2: Vehicle Selection Step** ⏱️ 5 minutes

#### Steps:
1. Complete Test 1 (select at least 1 service)
2. Click "Next" button
3. You should see Step 2: "Select Vehicle(s)"

#### Scenario A: User Has Vehicles
- [ ] Vehicles load from API
- [ ] Each vehicle shows: year, make, model, license plate, type, mileage
- [ ] Can select multiple vehicles with checkboxes
- [ ] Multi-vehicle warning appears when >1 selected
- [ ] Warning says: "Appointments will be scheduled sequentially for X vehicles"

#### Scenario B: Add New Vehicle
- [ ] Click dashed "Add New Vehicle" card OR "Add Vehicle Now" button
- [ ] Dialog opens with form fields:
  - License Plate (required, uppercase)
  - Make (required)
  - Model (required)
  - Year (dropdown, last 30 years)
  - Type (dropdown: Sedan/SUV/Truck/Van/etc.)
  - Mileage (optional, number)
- [ ] Fill all required fields and click "Add Vehicle"
- [ ] Success toast appears: "Vehicle added successfully!"
- [ ] Dialog closes
- [ ] New vehicle appears in list
- [ ] New vehicle is automatically selected
- [ ] Can now proceed to next step

#### Scenario C: Empty State
- [ ] If no vehicles exist, shows message: "No Vehicles Found"
- [ ] Shows "Add Vehicle Now" button prominently
- [ ] Works same as Scenario B

#### Expected Results:
✅ Vehicles display as cards with checkboxes  
✅ Multi-select works  
✅ Add vehicle dialog functional  
✅ New vehicle POST to `/api/vehicles` succeeds  
✅ New vehicle auto-selected  

#### Screenshot Checkpoints:
📸 Vehicles loaded  
📸 Multiple vehicles selected with warning  
📸 Add vehicle dialog  
📸 New vehicle in list  

---

### **Test 3: Date Selection Step** ⏱️ 5 minutes

#### Steps:
1. Complete Test 1 & 2 (services + vehicles selected)
2. Click "Next" button
3. You should see Step 3: "Select Appointment Date"

#### What to Test:
- [ ] Calendar displays for current month
- [ ] API call to `/api/appointments/available-dates` happens
- [ ] Dates are color-coded:
  - 🟢 Green = Plenty of slots available
  - 🟡 Yellow = Limited slots remaining
  - 🔴 Red = Fully booked (strikethrough)
  - ⚪ Gray = Not available (past dates, closed days)
- [ ] Past dates are disabled (can't click)
- [ ] Sunday is disabled (non-working day)
- [ ] Monday-Saturday are available (green/yellow)
- [ ] Can click on a green or yellow date
- [ ] Selected date shows in blue sidebar card
- [ ] Selected date displays as: "DayOfWeek, Month Day, Year"
- [ ] Shows "X of Y time slots available"
- [ ] Appointment summary sidebar shows:
  - Number of services
  - Number of vehicles
  - Total duration in minutes
- [ ] Legend displays correctly at bottom
- [ ] "Refresh Availability" button works
- [ ] Can change month and dates update

#### Expected Results:
✅ Calendar renders with color coding  
✅ Can select available dates  
✅ Selected date info appears in sidebar  
✅ API receives correct duration parameter (services × 60 × vehicle count)  
✅ Refresh button re-fetches dates  

#### Screenshot Checkpoints:
📸 Calendar with color-coded dates  
📸 Selected date in sidebar  
📸 Availability legend  

---

### **Test 4: Navigation & Persistence** ⏱️ 3 minutes

#### Steps:
1. Complete steps 1-3 (all selections made)
2. Click "Back" button at Step 3
3. Verify returns to Step 2 (vehicles)
4. Check vehicles still selected
5. Click "Back" again
6. Verify returns to Step 1 (services)
7. Check services still selected

#### What to Test:
- [ ] Back button works at each step
- [ ] Selections preserved when going back
- [ ] Can modify earlier step selections
- [ ] Forward navigation works after modification
- [ ] Changes to services affect date step duration

#### SessionStorage Persistence:
1. Make selections in steps 1-3
2. Open DevTools → Application → Session Storage → `http://localhost:5174`
3. Find key: `bookingDraft`
4. Verify JSON contains: services, vehicles, date, timeSlot, specialInstructions
5. Refresh browser (F5)
6. Verify selections restored

#### Expected Results:
✅ Back/Next navigation works  
✅ Selections persist across steps  
✅ SessionStorage saves draft  
✅ Refresh restores state  

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module" errors
**Solution**: Components not yet created (TimeSlotSelectionStep, ReviewConfirmStep, ConfirmationStep are in Batch 2)

### Issue: Services don't load
**Solution**:
1. Check backend running: http://localhost:5000
2. Check MongoDB connected (see terminal)
3. Seed services: `cd backend; node seedServices.js`
4. Check browser Console for errors (F12)

### Issue: No JWT token
**Solution**:
1. Login first at http://localhost:5174/login
2. Use admin credentials: `admin` / `Admin@123`
3. Check sessionStorage has `authToken`

### Issue: Vehicles endpoint 404
**Solution**:
1. Check route exists: `backend/routes/vehicles.js`
2. Check route registered in `server.js`
3. Try manually: http://localhost:5000/api/vehicles (with Authorization header)

### Issue: Dates all disabled
**Solution**:
1. Check backend terminal for errors
2. Verify business hours config: `backend/config/businessHours.js`
3. Check database time vs local time (timezone)
4. Try tomorrow's date specifically

---

## 📊 Success Criteria - Batch 1

| Component | Functionality | Status |
|-----------|---------------|--------|
| ServiceSelectionStep | Load services, multi-select, totals | ⏳ Pending |
| VehicleSelectionStep | Load vehicles, add vehicle, multi-select | ⏳ Pending |
| DateSelectionStep | Calendar, availability colors, selection | ⏳ Pending |
| Navigation | Back/Next, persistence | ⏳ Pending |

**All tests must pass before proceeding to Batch 2.**

---

## 🔜 Next: Batch 2 Tests

After Batch 1 passes:
- TimeSlotSelectionStep (slot grid, capacity, polling)
- ReviewConfirmStep (summary, submit)
- ConfirmationStep (success page)

---

## 📝 Test Results

### Date/Time: __________

### Tester: __________

### Test 1 - Service Selection:
- [ ] PASS   [ ] FAIL  
- Notes: _________________________________

### Test 2 - Vehicle Selection:
- [ ] PASS   [ ] FAIL  
- Notes: _________________________________

### Test 3 - Date Selection:
- [ ] PASS   [ ] FAIL  
- Notes: _________________________________

### Test 4 - Navigation:
- [ ] PASS   [ ] FAIL  
- Notes: _________________________________

### Overall Result:
- [ ] ✅ All tests passed - Ready for Batch 2
- [ ] ⚠️ Some issues found - See notes
- [ ] ❌ Critical failures - Need fixes

---

**Ready to start testing!** 🚀

Open: http://localhost:5174 and follow the test steps above.
