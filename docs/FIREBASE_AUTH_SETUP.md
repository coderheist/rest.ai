# Firebase Authentication Setup Guide

## Overview
This application now uses Google Firebase for authentication instead of traditional JWT-based authentication. Firebase provides secure, scalable authentication with built-in features like password reset, email verification, and social login support.

## Features Implemented
- ✅ Email/Password Registration
- ✅ Email/Password Login
- ✅ Logout
- ✅ Forgot Password (Password Reset Email)
- ✅ Firebase Auth State Management
- ✅ User Profile Management

## Setup Instructions

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Enable Authentication:
   - Go to Authentication → Get Started
   - Enable "Email/Password" sign-in method

### 2. Get Firebase Configuration
1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (</>) to add a web app
4. Register your app and copy the configuration object

### 3. Configure the Application
Open `frontend/src/config/firebase.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",              // Replace with your Firebase API Key
  authDomain: "YOUR_AUTH_DOMAIN",      // Replace with your Auth Domain
  projectId: "YOUR_PROJECT_ID",        // Replace with your Project ID
  storageBucket: "YOUR_STORAGE_BUCKET",// Replace with your Storage Bucket
  messagingSenderId: "YOUR_SENDER_ID", // Replace with your Messaging Sender ID
  appId: "YOUR_APP_ID"                 // Replace with your App ID
};
```

### 4. Environment Variables (Optional but Recommended)
For better security, use environment variables:

1. Create `.env` file in frontend directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

2. Update `firebase.js` to use environment variables:
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

## Usage

### Registration
```javascript
const { register } = useAuth();

const result = await register({
  email: 'user@example.com',
  password: 'securePassword123',
  name: 'John Doe',
  tenantName: 'Company Name'
});
```

### Login
```javascript
const { login } = useAuth();

const result = await login({
  email: 'user@example.com',
  password: 'securePassword123'
});
```

### Logout
```javascript
const { logout } = useAuth();
await logout();
```

### Password Reset
```javascript
const { resetPassword } = useAuth();

const result = await resetPassword('user@example.com');
// User will receive an email with password reset link
```

## Authentication Flow

1. **Registration**: 
   - User enters email, password, name, and company name
   - Firebase creates user account
   - User profile updated with display name
   - Tenant info stored in localStorage
   - Redirects to dashboard

2. **Login**:
   - User enters email and password
   - Firebase authenticates credentials
   - Auth state automatically synced
   - Redirects to dashboard

3. **Forgot Password**:
   - User enters email address
   - Firebase sends password reset email
   - User clicks link in email
   - Firebase-hosted page allows password reset

4. **Auth State Persistence**:
   - Firebase automatically maintains session
   - Auth state synced across tabs
   - Persistent login (survives page refresh)

## Security Features

- ✅ Secure password storage (Firebase handles hashing)
- ✅ Email verification support (can be enabled)
- ✅ Rate limiting on authentication attempts
- ✅ Built-in CSRF protection
- ✅ Secure session management
- ✅ Password reset via email
- ✅ Account recovery

## Firebase Console Configuration

### Customize Email Templates
1. Go to Authentication → Templates
2. Customize:
   - Password reset email
   - Email verification
   - Email address change

### Domain Verification
1. Go to Authentication → Settings
2. Add authorized domains for production

### Security Rules
Configure appropriate security rules based on your needs.

## Migration Notes

### Changes from JWT Authentication
- **Before**: JWT tokens stored in localStorage
- **After**: Firebase auth tokens managed automatically
- **User Object**: Now includes Firebase UID instead of MongoDB _id
- **Tenant Storage**: Temporarily stored in localStorage (consider migrating to Firestore)

### Backend Integration (Future Enhancement)
For features requiring backend verification:
1. Use Firebase Admin SDK on backend
2. Verify Firebase ID tokens
3. Extract user information from verified tokens

```javascript
// Backend example
const admin = require('firebase-admin');

async function verifyToken(idToken) {
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  const uid = decodedToken.uid;
  return uid;
}
```

## Troubleshooting

### Common Issues

1. **"Firebase: Error (auth/configuration-not-found)"**
   - Solution: Update firebase.js with correct configuration

2. **"Firebase: Error (auth/network-request-failed)"**
   - Solution: Check internet connection and Firebase project status

3. **"Firebase: Error (auth/popup-closed-by-user)"**
   - Solution: User closed authentication popup (not applicable for email/password)

4. **Password reset email not received**
   - Check spam folder
   - Verify email in Firebase Console → Authentication
   - Check email template configuration

## Additional Features (Optional)

### Email Verification
Enable email verification in `AuthContext.jsx`:
```javascript
import { sendEmailVerification } from 'firebase/auth';

// After registration
await sendEmailVerification(userCredential.user);
```

### Social Login
Add Google/Facebook/Twitter login:
```javascript
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);
```

## Testing

1. **Test Registration**:
   - Navigate to `/register`
   - Create new account
   - Verify success redirect

2. **Test Login**:
   - Navigate to `/login`
   - Enter credentials
   - Verify dashboard access

3. **Test Password Reset**:
   - Navigate to `/forgot-password`
   - Enter email
   - Check email inbox
   - Click reset link
   - Set new password

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Firebase Console](https://console.firebase.google.com/)
