# jo-sh daily

A minimalist daily todo app with the josh-thetic design philosophy. Track your tasks, build streaks, and celebrate your wins - all with Firebase authentication and cloud sync.

## Features

- **User Authentication**: Secure login and signup with Firebase Authentication
- **Cloud Sync**: Your tasks and progress sync across devices with Firestore
- **Task Persistence**: Tasks you create persist across sessions and devices until deleted
- **Task Management**: Create, edit, and complete daily tasks with point values
- **Streak Tracking**: Build and maintain your completion streaks (synced to Firebase)
- **Progress Calendar**: Visual calendar showing your daily achievements
- **Follow-up Questions**: Reflect on completed tasks with custom follow-ups
- **Celebrations**: Celebrate milestones and achievements
- **Usage Analytics**: Track app usage, task completion history, and session data
- **Multi-user Support**: Each user has their own private data

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Firebase

Before running the app, you need to set up Firebase. Follow the detailed instructions in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md).

Quick steps:
1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Email/Password authentication
3. Create a Firestore database
4. Copy `.env.example` to `.env` and add your Firebase credentials

### 3. Run the App

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Data Persistence

All user data is automatically saved to Firebase Firestore and syncs across devices:

### What's Saved to Firebase

1. **Tasks** (`users/{userId}/data/tasks`)
   - Task definitions with points and follow-up questions
   - Persists across sessions and devices until manually deleted
   - Automatically syncs when you create, edit, or delete tasks

2. **Daily Completion Data** (`users/{userId}/data/dailyData`)
   - Completed tasks for each day (with timestamps)
   - Follow-up responses for each completed task
   - Daily point totals
   - Full completion history

3. **Streaks** (`users/{userId}/data/streaks`)
   - Current streak count
   - Best streak achieved
   - Last completion date

4. **Usage Analytics** (`users/{userId}/data/usage`)
   - Session tracking (login/logout times)
   - Task interaction events (created, edited, deleted, completed)
   - Celebration milestones
   - App usage statistics

### Cross-Device Sync

When you log in from any device, your data is automatically loaded:
- Tasks you created on one device appear on all devices
- Completion history and streaks stay in sync
- Progress is preserved across sessions

## Project Structure

```
src/
├── components/        # React components
│   ├── Login.js      # Authentication UI
│   ├── TaskList.js   # Task display
│   └── ...
├── contexts/         # React context providers
│   └── AuthContext.js # Authentication state management
├── services/         # External service integrations
│   └── firebaseService.js # Firestore operations & usage tracking
├── utils/            # Utility functions
│   ├── storage.js    # Data persistence abstraction
│   ├── usageTracking.js # User analytics tracking
│   └── celebrations.js # Achievement logic
└── config/           # Configuration
    └── firebase.js   # Firebase initialization
```

## Technologies

- **React** - UI framework
- **Firebase Authentication** - User authentication
- **Cloud Firestore** - NoSQL database for task storage
- **Create React App** - Build tooling

---

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
