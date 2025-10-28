# Firebase Setup Instructions

Your Todo App now includes Google Sign-In and cloud storage! Follow these steps to complete the setup:

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

## Step 2: Enable Google Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on **Google** provider
3. Enable it and click **Save**

## Step 3: Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select a location and click **Enable**

## Step 4: Register Your Web App

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the **Web** icon (`</>`)
4. Register your app with a nickname (e.g., "Todo App")
5. Copy the **firebaseConfig** object

## Step 5: Update Firebase Configuration

1. Open `src/firebase.js` in your project
2. Replace the placeholder configuration with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 6: Configure Firestore Security Rules (Optional but Recommended)

In Firebase Console, go to **Firestore Database** > **Rules** and update to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Step 7: Run Your App

```bash
npm start
```

## Features

✅ **Google Sign-In**: Secure authentication with Google accounts
✅ **Cloud Storage**: All tasks are saved to Firebase Firestore
✅ **Real-time Sync**: Tasks sync across devices
✅ **User-specific Data**: Each user sees only their own tasks
✅ **Violet Theme**: Beautiful violet color scheme throughout

## Troubleshooting

- **Sign-in popup blocked**: Allow popups in your browser for localhost
- **Firebase errors**: Make sure you've enabled Authentication and Firestore in Firebase Console
- **Configuration errors**: Double-check your Firebase config values in `src/firebase.js`

## Need Help?

Check the [Firebase Documentation](https://firebase.google.com/docs) for more details.
