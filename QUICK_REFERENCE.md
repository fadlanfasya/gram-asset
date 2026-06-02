# User Management - Quick Reference

## 🚀 Getting Started

1. Log in as an admin user
2. Look for "User Management" in the sidebar (under Admin section)
3. Click to access the user management page

## 📋 Main Operations

### Add User
```
Click: "Add New User" button
Fill: Full Name, Email, Password, Role, Status
Click: "Save User"
```

### Edit User
```
Click: Pencil icon next to user
Update: Any field except Email
Click: "Save User"
```

### Delete User
```
Click: Trash icon next to user
Confirm: Deletion prompt
User: Permanently deleted
```

### Change Role
```
Use: Role dropdown in table
Select: User or Admin
Change: Applied immediately
```

### Search Users
```
Type: Name or email in search box
Results: Update as you type
Clear: Leave empty to see all
```

## 🔒 Access Control

| User Type | Can Access? | Actions |
|-----------|------------|---------|
| Admin | ✅ Full Access | Create, Edit, Delete, Change Roles |
| Regular User | ❌ Denied | Redirected to Dashboard |
| Anonymous | ❌ Denied | Redirected to Login |

## 📊 User Table Columns

| Column | Description |
|--------|-------------|
| Name | User's full name with avatar |
| Email | User's email address |
| Role | User (regular) or Admin |
| Status | Active ✓ or Inactive ○ |
| Created | Account creation date |
| Actions | Edit & Delete buttons |

## ⚠️ Important Rules

- **Admins cannot delete themselves** - Delete button disabled
- **Admins cannot change their own role** - Role dropdown disabled
- **Email is unique** - Cannot duplicate email addresses
- **Email cannot be changed** - Edit form has email disabled
- **Password is optional on edit** - Leave blank to keep current
- **Password required on creation** - Minimum 6 characters

## 🎨 UI Indicators

### Status Badges
- 🟢 **Active** - Green badge, user can log in
- 🔴 **Inactive** - Red badge, user cannot log in

### Visual Feedback
- ✅ Green notification = Success (3 sec)
- ❌ Red notification = Error
- ⏳ "Loading users..." = Fetching data

## 📱 Features by Breakpoint

| Desktop | Tablet | Mobile |
|---------|--------|--------|
| Full table | Optimized table | Condensed view |
| All columns | All columns | Essential cols |
| Hover effects | Touch friendly | Buttons stack |

## 🔄 Form Validation

| Field | Requirements | Error |
|-------|-------------|-------|
| Name | Required | "Name is required" |
| Email | Valid format | "Please enter a valid email" |
| Email | Unique (new) | Handled by backend |
| Password (new) | Min 6 chars | "Password must be at least 6 characters" |
| Password (edit) | Min 6 chars | Same as above |

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't access User Management | Verify you're logged in as admin |
| Search not working | Check backend API is running |
| Form won't submit | Fill all required fields, check console |
| Users won't delete | Check you're not deleting yourself |
| Roles not changing | Check backend role endpoint works |

## 📡 API Endpoints

All requests include: `Authorization: Bearer {token}`

```
GET    /api/users              # List all users
POST   /api/users              # Create user
GET    /api/users/:id          # Get user details
PUT    /api/users/:id          # Update user
DELETE /api/users/:id          # Delete user
PUT    /api/users/:id/role     # Change role
GET    /api/users/search?q=    # Search users
```

## 📁 File Locations

```
src/pages/UserManagementPage.jsx       - Main page
src/pages/components/UserList.jsx      - Users table
src/pages/components/UserForm.jsx      - Add/Edit form
src/utils/userApi.js                   - API calls
src/App.jsx                            - Routes (updated)
src/components/layout/Sidebar.jsx      - Navigation (updated)
```

## 🎯 User Roles

### Admin
- Access User Management page
- Create, edit, delete users
- Change user roles
- View all users
- Cannot: Delete self, change own role

### Regular User
- Cannot access User Management
- Can view own profile (future feature)
- Cannot manage other users

## 📞 Support

For detailed documentation, see:
- `USER_MANAGEMENT.md` - Complete documentation
- `IMPLEMENTATION_SUMMARY.md` - Technical overview

## ✨ Tips & Tricks

1. **Quick role change** - Use dropdown in table instead of edit form
2. **Search efficiency** - Search by partial name/email
3. **Bulk operations** - Edit multiple users by going one-by-one
4. **Status management** - Deactivate instead of delete for records
5. **Confirmation** - Deletion requires confirmation to prevent accidents

---

**Last Updated**: June 2, 2026
**Version**: 1.0
