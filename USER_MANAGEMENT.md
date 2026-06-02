# User Management System Documentation

## Overview
A complete user management system has been integrated into the Gram application. This system allows administrators to manage users in the system with full CRUD (Create, Read, Update, Delete) operations.

## Features

### 1. **Admin-Only Access**
- Only users with the `admin` role can access the User Management page
- Non-admin users attempting to access `/users` will be redirected to the dashboard
- Administrators see a dedicated "User Management" link in the sidebar

### 2. **User Operations**

#### Create User
- Click "Add New User" button
- Fill in the form with:
  - Full Name
  - Email address (unique)
  - Password (minimum 6 characters)
  - Role (User or Admin)
  - Status (Active or Inactive)
- Click "Save User" to create

#### View Users
- All users are displayed in a table with:
  - User name with avatar
  - Email address
  - Current role
  - Account status
  - Creation date
  - Action buttons

#### Edit User
- Click the edit icon (pencil) next to any user
- Update the user's information
- Note: Email cannot be changed after creation
- Leave password blank to keep the current password
- Click "Save User" to apply changes

#### Delete User
- Click the delete icon (trash) next to any user
- Confirm the deletion when prompted
- Admins cannot delete themselves (button is disabled)

#### Change User Role
- Use the role dropdown in the table to change a user's role between "User" and "Admin"
- Changes are applied immediately
- Admins cannot change their own role

### 3. **Search Functionality**
- Use the search box at the top to find users by name or email
- Search results update as you type
- Click the search field and clear it to view all users again

### 4. **Status Management**
- Users can be marked as "Active" or "Inactive"
- Status is indicated by color-coded badges (green for active, red for inactive)

## File Structure

```
src/
├── pages/
│   ├── UserManagementPage.jsx        # Main user management page
│   ├── UserManagementPage.css        # Page styling
│   └── components/
│       ├── UserList.jsx              # User table component
│       ├── UserList.css              # User table styling
│       ├── UserForm.jsx              # Add/Edit user form
│       └── UserForm.css              # Form styling
├── utils/
│   └── userApi.js                    # API integration layer
├── stores/
│   └── useAuthStore.js               # (Existing auth store)
└── App.jsx                           # (Updated with routes)
```

## API Endpoints

All endpoints are configured to connect to `http://localhost:4000/api`:

### Create User
```
POST /api/users
Headers: Authorization: Bearer {token}
Body: { name, email, password, role, status }
```

### Get All Users
```
GET /api/users
Headers: Authorization: Bearer {token}
```

### Get User by ID
```
GET /api/users/:id
Headers: Authorization: Bearer {token}
```

### Update User
```
PUT /api/users/:id
Headers: Authorization: Bearer {token}
Body: { name, email, password, role, status }
```

### Delete User
```
DELETE /api/users/:id
Headers: Authorization: Bearer {token}
```

### Change User Role
```
PUT /api/users/:id/role
Headers: Authorization: Bearer {token}
Body: { role }
```

### Search Users
```
GET /api/users/search?q={query}
Headers: Authorization: Bearer {token}
```

## Navigation

### Access User Management
1. Log in as an admin user
2. Look for "User Management" in the sidebar under the "Admin" section
3. Click to navigate to `/users`

### Return to Dashboard
- Click "Dashboard" in the sidebar
- Or use the browser back button

## Key Features

- ✅ Role-based access control (admin-only)
- ✅ Create, Read, Update, Delete users
- ✅ Change user roles
- ✅ Search and filter users
- ✅ Admin cannot delete or modify their own role
- ✅ Success/error notifications
- ✅ Form validation with helpful error messages
- ✅ Responsive design for mobile and desktop
- ✅ User avatars with initials
- ✅ Real-time role changes
- ✅ Status indicators (Active/Inactive)
- ✅ Creation date tracking

## Security Considerations

1. **Token-Based Authentication**: All API requests include the JWT token from the auth store
2. **Role Verification**: Both frontend and backend verify admin role
3. **Self-Protection**: Admins cannot delete or modify their own profile
4. **Password Handling**: Passwords are only visible during creation/update
5. **CORS**: Requests go to the backend API with proper authorization headers

## Error Handling

- Network errors are caught and displayed to the user
- Form validation provides clear error messages
- API errors are displayed in red banner notifications
- Success operations show green confirmation messages
- Auto-dismissing notifications (3-second timeout)

## Styling

The user management system uses:
- CSS variables for consistent theming
- Responsive grid/flexbox layouts
- Smooth transitions and hover effects
- Material Design icons (via Lucide React)
- Modal overlay for forms
- Table layout for user list
- Color-coded status indicators

## Troubleshooting

**Cannot access User Management page**
- Verify you're logged in as an admin user
- Check that your user role is set to "admin"

**Search not working**
- Ensure the backend API is running
- Check browser console for errors
- Verify the backend search endpoint is implemented

**Form submission fails**
- Check the error message displayed
- Verify all required fields are filled
- Ensure email format is valid

**User list not loading**
- Confirm backend API is accessible
- Check network tab in browser DevTools
- Verify authentication token is valid

## Future Enhancements

Potential improvements could include:
- Bulk user operations (import, export)
- User activity logs
- Password reset functionality
- Two-factor authentication
- User permissions per resource
- Department/team management
- User audit trail
