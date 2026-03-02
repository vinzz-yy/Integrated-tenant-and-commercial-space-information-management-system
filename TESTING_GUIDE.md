# Testing Guide
## LA Union Skymall Property Management System

This guide provides instructions for testing the application manually and outlines the testing strategy.

---

## Table of Contents

1. [Manual Testing](#manual-testing)
2. [Test User Accounts](#test-user-accounts)
3. [Test Scenarios](#test-scenarios)
4. [Browser Testing](#browser-testing)
5. [Mobile Testing](#mobile-testing)
6. [API Testing](#api-testing)
7. [Security Testing](#security-testing)

---

## Manual Testing

### Prerequisites

1. **Start the application:**
```bash
npm run dev
```

2. **Open browser:**
```
http://localhost:5173
```

3. **Ensure Django backend is running (if available):**
```bash
python manage.py runserver
```

---

## Test User Accounts

### Admin Account
```
Email: admin@skymall.com
Password: password
```

**Access Level:**
- ✅ Full system access
- ✅ User management
- ✅ Compliance approval
- ✅ Financial management
- ✅ All modules

### Staff Account
```
Email: staff@skymall.com
Password: password
```

**Access Level:**
- ✅ Dashboard access
- ✅ View compliance (read-only)
- ✅ Schedule management
- ✅ Operations handling
- ✅ Basic financial reports
- ✅ Commercial space editing

### Tenant Account
```
Email: tenant@skymall.com
Password: password
```

**Access Level:**
- ✅ Personal dashboard
- ✅ Profile management
- ✅ Document uploads
- ✅ Payment portal
- ✅ Maintenance requests
- ✅ Appointment booking

---

## Test Scenarios

### 🔐 Authentication Testing

#### Test Case 1: Login
**Steps:**
1. Navigate to login page
2. Enter valid credentials (admin@skymall.com / password)
3. Click "Sign In"

**Expected Result:**
- ✅ Redirect to admin dashboard
- ✅ Navbar shows user avatar and name
- ✅ Sidebar navigation visible

#### Test Case 2: Invalid Login
**Steps:**
1. Navigate to login page
2. Enter invalid credentials
3. Click "Sign In"

**Expected Result:**
- ❌ Error message displayed
- ❌ No navigation occurs
- ✅ Form remains on login page

#### Test Case 3: Logout
**Steps:**
1. Login with any account
2. Click on user avatar in navbar
3. Click "Logout"

**Expected Result:**
- ✅ Redirect to login page
- ✅ Session cleared
- ✅ Accessing protected routes redirects to login

#### Test Case 4: Role-Based Access
**Steps:**
1. Login as Tenant
2. Try to access `/admin` URL directly

**Expected Result:**
- ❌ Redirect to tenant dashboard or login
- ✅ No access to admin pages

---

### 👤 User Management Testing (Admin Only)

#### Test Case 5: View Users List
**Steps:**
1. Login as Admin
2. Navigate to "User Management"
3. Observe users table

**Expected Result:**
- ✅ Table displays all users
- ✅ Search functionality works
- ✅ Filter by role works
- ✅ Pagination works (if applicable)

#### Test Case 6: Create New User
**Steps:**
1. Click "Add User" button
2. Fill in form:
   - Email: test@example.com
   - First Name: Test
   - Last Name: User
   - Role: Tenant
   - Phone: +1 (555) 999-9999
   - Unit Number: C-301
3. Click "Create User"

**Expected Result:**
- ✅ Success notification appears
- ✅ New user appears in table
- ✅ Dialog closes

#### Test Case 7: Edit User
**Steps:**
1. Click edit icon on any user
2. Modify phone number
3. Click "Update User"

**Expected Result:**
- ✅ Success notification appears
- ✅ Table reflects changes
- ✅ Dialog closes

#### Test Case 8: Delete User
**Steps:**
1. Click delete icon on a user
2. Confirm deletion

**Expected Result:**
- ✅ Confirmation prompt appears
- ✅ User removed from table
- ✅ Success notification

---

### 📄 Compliance Management Testing

#### Test Case 9: View Compliance Documents (Admin)
**Steps:**
1. Login as Admin
2. Navigate to "Compliance"
3. View documents table

**Expected Result:**
- ✅ All compliance documents visible
- ✅ Filter by status works
- ✅ Search functionality works

#### Test Case 10: Review Document
**Steps:**
1. Click "Review" on a pending document
2. Change status to "Approved"
3. Add review notes
4. Click "Save Review"

**Expected Result:**
- ✅ Document status updated
- ✅ Badge color changes
- ✅ Notes saved

#### Test Case 11: Upload Document (Tenant)
**Steps:**
1. Login as Tenant
2. Navigate to "Documents"
3. Click "Upload Document"
4. Select document type
5. Choose file
6. Click "Upload"

**Expected Result:**
- ✅ File upload successful
- ✅ Document appears in list
- ✅ Status shows as "pending"

---

### 📅 Schedule Management Testing

#### Test Case 12: View Calendar
**Steps:**
1. Login as Admin or Staff
2. Navigate to "Schedule"
3. Observe calendar

**Expected Result:**
- ✅ Calendar displays current month
- ✅ Appointments list visible
- ✅ Can select different dates

#### Test Case 13: Create Appointment
**Steps:**
1. Click "New Appointment"
2. Fill in form:
   - Title: "Test Appointment"
   - Date: Select future date
   - Time: Select time
   - Type: Meeting
   - Location: Office
3. Click "Create"

**Expected Result:**
- ✅ Appointment created
- ✅ Appears in appointments list
- ✅ Success notification

#### Test Case 14: Delete Appointment
**Steps:**
1. Click delete icon on appointment
2. Confirm deletion

**Expected Result:**
- ✅ Appointment removed
- ✅ Success notification

---

### 💰 Financial Management Testing

#### Test Case 15: View Invoices
**Steps:**
1. Login as Admin
2. Navigate to "Financial"
3. View invoices tab

**Expected Result:**
- ✅ All invoices displayed
- ✅ Revenue charts visible
- ✅ Statistics cards show correct totals

#### Test Case 16: View Payment History
**Steps:**
1. Click "Payments" tab
2. Observe payment records

**Expected Result:**
- ✅ All payments listed
- ✅ Transaction details visible
- ✅ Status badges correct

#### Test Case 17: Pay Invoice (Tenant)
**Steps:**
1. Login as Tenant
2. Navigate to "Payments"
3. Click "Pay Now" on unpaid invoice
4. Select payment method
5. Fill in payment details (mock)
6. Click "Pay"

**Expected Result:**
- ✅ Payment dialog opens
- ✅ Amount displayed correctly
- ✅ Success notification
- ✅ Invoice status updated

---

### 🏢 Commercial Space Testing

#### Test Case 18: View Units List
**Steps:**
1. Login as Admin
2. Navigate to "Commercial Space"
3. View units table

**Expected Result:**
- ✅ All units displayed
- ✅ Occupancy rate calculated correctly
- ✅ Filter by status works

#### Test Case 19: Create New Unit
**Steps:**
1. Click "Add Unit"
2. Fill in form:
   - Unit Number: D-401
   - Floor: 4
   - Size: 200
   - Type: Retail
   - Rental Rate: 3000
   - Status: Available
3. Click "Create Unit"

**Expected Result:**
- ✅ Unit created
- ✅ Appears in table
- ✅ Statistics updated

#### Test Case 20: Edit Unit
**Steps:**
1. Click edit icon on unit
2. Change status to "Occupied"
3. Click "Update"

**Expected Result:**
- ✅ Status updated
- ✅ Badge reflects change
- ✅ Occupancy rate recalculated

#### Test Case 21: View Unit Details (Tenant)
**Steps:**
1. Login as Tenant
2. Navigate to "My Unit"
3. View unit information

**Expected Result:**
- ✅ Correct unit details displayed
- ✅ Lease information visible
- ✅ Rental rate shown

---

### 🔧 Maintenance Testing

#### Test Case 22: Submit Maintenance Request (Tenant)
**Steps:**
1. Login as Tenant
2. Navigate to "Maintenance"
3. Click "New Request"
4. Fill in form:
   - Title: "Test Maintenance Issue"
   - Priority: High
   - Description: "Test description"
   - Upload file (optional)
5. Click "Submit Request"

**Expected Result:**
- ✅ Request created
- ✅ Appears in requests list
- ✅ Status is "pending"
- ✅ Priority badge correct color

#### Test Case 23: View Maintenance Requests (Staff)
**Steps:**
1. Login as Staff
2. Navigate to "Operations"
3. View maintenance requests

**Expected Result:**
- ✅ Can view all requests
- ✅ Can filter by status/priority
- ✅ Request details visible

---

### 📊 Dashboard Testing

#### Test Case 24: Admin Dashboard
**Steps:**
1. Login as Admin
2. Observe dashboard

**Expected Result:**
- ✅ Statistics cards display correct data
- ✅ Charts render properly
- ✅ Recent activities visible
- ✅ Notifications panel shows alerts
- ✅ Quick actions work

#### Test Case 25: Staff Dashboard
**Steps:**
1. Login as Staff
2. Observe dashboard

**Expected Result:**
- ✅ Staff-specific metrics shown
- ✅ Assigned tasks visible
- ✅ Today's appointments listed
- ✅ Quick actions work

#### Test Case 26: Tenant Dashboard
**Steps:**
1. Login as Tenant
2. Observe dashboard

**Expected Result:**
- ✅ Unit information displayed
- ✅ Pending payments shown
- ✅ Maintenance requests visible
- ✅ Quick actions work

---

### 🎨 UI/UX Testing

#### Test Case 27: Theme Toggle
**Steps:**
1. Login with any account
2. Click theme toggle button (Sun/Moon icon)

**Expected Result:**
- ✅ Theme switches between light and dark
- ✅ All components adapt to theme
- ✅ Theme persists on page reload

#### Test Case 28: Responsive Design - Mobile
**Steps:**
1. Open browser DevTools
2. Switch to mobile view (375px width)
3. Navigate through pages

**Expected Result:**
- ✅ Sidebar collapses to hamburger menu
- ✅ Tables are scrollable
- ✅ Forms are readable
- ✅ Buttons are touch-friendly
- ✅ No horizontal scroll

#### Test Case 29: Responsive Design - Tablet
**Steps:**
1. Switch to tablet view (768px width)
2. Navigate through pages

**Expected Result:**
- ✅ Layout adapts appropriately
- ✅ Grid columns adjust
- ✅ Navigation remains functional

---

## Browser Testing

### Supported Browsers

Test the application on these browsers:

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ✅ Supported |
| Firefox | Latest | ✅ Supported |
| Safari | Latest | ✅ Supported |
| Edge | Latest | ✅ Supported |
| Opera | Latest | ✅ Supported |

### Browser-Specific Tests

**Chrome:**
- ✅ All features work
- ✅ Animations smooth
- ✅ File uploads work

**Firefox:**
- ✅ All features work
- ✅ Theme toggle works
- ✅ Forms validation works

**Safari:**
- ✅ All features work
- ✅ Date pickers work
- ✅ File uploads work

**Edge:**
- ✅ All features work
- ✅ Charts render correctly

---

## Mobile Testing

### iOS Testing
- Device: iPhone 12+
- Browser: Safari
- Orientation: Portrait & Landscape

**Test:**
- ✅ Touch events work
- ✅ Modals display correctly
- ✅ Forms are usable
- ✅ Navigation works

### Android Testing
- Device: Samsung Galaxy S21+
- Browser: Chrome
- Orientation: Portrait & Landscape

**Test:**
- ✅ Touch events work
- ✅ File uploads work
- ✅ Notifications display
- ✅ Back button works

---

## API Testing

### Using Browser DevTools

**Steps:**
1. Open DevTools (F12)
2. Go to Network tab
3. Perform actions in the app
4. Observe API calls

**Check:**
- ✅ Correct endpoints called
- ✅ Proper HTTP methods used
- ✅ Authorization headers present
- ✅ Response status codes correct
- ✅ Response data format correct

### Using Postman

**Import Postman Collection:**
1. Use endpoints from API_ENDPOINTS.md
2. Set up environment variables
3. Test each endpoint

**Test Scenarios:**
```
GET /api/users/ - List users
POST /api/users/ - Create user
PATCH /api/users/1/ - Update user
DELETE /api/users/1/ - Delete user
```

---

## Security Testing

### Authentication Tests

**Test Case 30: Protected Routes**
**Steps:**
1. Logout
2. Try accessing `/admin` directly

**Expected Result:**
- ❌ Redirect to login
- ✅ No data exposure

**Test Case 31: Token Expiration**
**Steps:**
1. Login
2. Wait for token to expire (or manipulate localStorage)
3. Try accessing protected route

**Expected Result:**
- ❌ Redirect to login
- ✅ Error message displayed

**Test Case 32: XSS Prevention**
**Steps:**
1. Try entering `<script>alert('XSS')</script>` in form fields
2. Submit form

**Expected Result:**
- ✅ Script doesn't execute
- ✅ Data sanitized

**Test Case 33: SQL Injection Prevention**
**Steps:**
1. Try entering `' OR '1'='1` in search fields
2. Observe results

**Expected Result:**
- ✅ No error
- ✅ Query doesn't execute malicious code

---

## Performance Testing

### Load Time
**Test:**
1. Clear browser cache
2. Load application
3. Measure time using DevTools

**Expected:**
- ✅ First Contentful Paint < 1.5s
- ✅ Time to Interactive < 3s
- ✅ Total page load < 5s

### Bundle Size
**Check:**
```bash
npm run build
```

**Expected:**
- ✅ Total bundle size < 500KB (gzipped)
- ✅ Code splitting working
- ✅ Lazy loading implemented

---

## Accessibility Testing

### Keyboard Navigation
**Test:**
1. Use Tab key to navigate
2. Use Enter to activate buttons
3. Use Escape to close modals

**Expected:**
- ✅ All interactive elements focusable
- ✅ Focus indicators visible
- ✅ Logical tab order

### Screen Reader
**Test:**
1. Use screen reader (NVDA/JAWS/VoiceOver)
2. Navigate through application

**Expected:**
- ✅ All content readable
- ✅ Form labels present
- ✅ ARIA labels correct
- ✅ Semantic HTML used

---

## Test Results Template

```markdown
## Test Report

**Date:** YYYY-MM-DD
**Tester:** Name
**Environment:** Development/Staging/Production
**Browser:** Chrome 120.0

### Test Results

| Test Case | Status | Notes |
|-----------|--------|-------|
| TC-01: Login | ✅ Pass | - |
| TC-02: Invalid Login | ✅ Pass | - |
| TC-03: Logout | ✅ Pass | - |
| TC-04: Role Access | ✅ Pass | - |
| TC-05: View Users | ✅ Pass | - |

### Issues Found

1. **Issue #1:** Button color incorrect in dark mode
   - **Severity:** Low
   - **Status:** Open

### Summary

- Total Tests: 33
- Passed: 32
- Failed: 1
- Pass Rate: 97%
```

---

## Automated Testing (Future)

### Unit Tests
```typescript
// Example with Jest
describe('AuthContext', () => {
  it('should login user successfully', async () => {
    // Test implementation
  });
});
```

### Integration Tests
```typescript
// Example with React Testing Library
describe('UserManagement', () => {
  it('should create new user', async () => {
    // Test implementation
  });
});
```

### E2E Tests
```typescript
// Example with Playwright
test('complete user flow', async ({ page }) => {
  await page.goto('/');
  await page.fill('[name="email"]', 'admin@skymall.com');
  // ...
});
```

---

## Continuous Testing

### Pre-Deployment Checklist
- [ ] All manual tests passed
- [ ] Browser compatibility verified
- [ ] Mobile responsiveness checked
- [ ] Security tests passed
- [ ] Performance benchmarks met
- [ ] Accessibility audit completed
- [ ] API integration verified

---

For questions or to report issues, contact: qa@launionskymall.com
