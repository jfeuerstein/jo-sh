# Firebase Setup Guide

This guide will help you set up Firebase authentication and database for the jo-sh daily todo app.

## Prerequisites

- A Google account
- Node.js and npm installed

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter a project name (e.g., "jo-sh-daily")
   - Choose whether to enable Google Analytics (optional)
   - Click "Create project"

## Step 2: Register Your Web App

1. In your Firebase project dashboard, click the web icon (`</>`) to add a web app
2. Register your app:
   - Enter an app nickname (e.g., "jo-sh-daily-web")
   - Check "Also set up Firebase Hosting" if you want to deploy to Firebase (optional)
   - Click "Register app"
3. Copy the Firebase configuration values

## Step 3: Enable Authentication

1. In the Firebase Console, go to "Build" → "Authentication"
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" provider:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

## Step 4: Set Up Firestore Database

1. In the Firebase Console, go to "Build" → "Firestore Database"
2. Click "Create database"
3. Choose a starting mode:
   - **Production mode** (recommended): Start with secure rules
   - **Test mode**: Start with open rules (not recommended for production)
4. Select a Firestore location (choose one closest to your users)
5. Click "Enable"

## Step 5: Configure Firestore Security Rules

1. In Firestore Database, go to the "Rules" tab
2. Replace the default rules with the following:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read and write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click "Publish"

These rules ensure that:
- Users must be authenticated
- Users can only access their own data
- Each user's tasks and daily data are private

## Step 6: Configure Your App

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and replace the placeholder values with your Firebase configuration:
   ```
   REACT_APP_FIREBASE_API_KEY=your-actual-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
   REACT_APP_FIREBASE_APP_ID=your-actual-app-id
   ```

3. **Important**: Add `.env` to your `.gitignore` to keep your credentials private:
   ```bash
   echo ".env" >> .gitignore
   ```

## Step 7: Test Your Setup

1. Start your development server:
   ```bash
   npm start
   ```

2. You should see the login screen
3. Try creating an account with an email and password
4. After logging in, you should see the todo app
5. Create a task and verify it saves to Firestore:
   - Go to Firebase Console → Firestore Database
   - You should see a `users` collection with your user ID
   - Inside, you'll find `data/tasks` and `data/dailyData` documents

## Troubleshooting

### "Firebase: Error (auth/...)"

- Check that Email/Password authentication is enabled in Firebase Console
- Verify your Firebase configuration in `.env` is correct
- Make sure you've restarted your development server after changing `.env`

### Data not saving

- Check Firestore security rules are set up correctly
- Check the browser console for errors
- Verify your user is authenticated (you should see the email in the header)

### "Configuration object is invalid"

- Make sure all environment variables in `.env` are set
- Restart your development server (`npm start`)

## Deployment

When deploying to production:

1. Set the environment variables in your hosting platform
2. Ensure Firestore security rules are set to production mode
3. Consider adding email verification for new users
4. Set up proper error monitoring

## Additional Security (Optional but Recommended)

### Email Verification

Add email verification to ensure users own the email addresses they sign up with:

1. In Firebase Console → Authentication → Settings
2. Enable "Email verification" under "User verification"

### Password Reset

The app uses Firebase's built-in password reset. Users can request a password reset email through the Firebase Authentication system.

## Support

For more information, visit:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
