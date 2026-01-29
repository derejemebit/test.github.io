# Real-Time Collaboration Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "personal-website-schedule")
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Setup Realtime Database

1. In your Firebase project, go to "Realtime Database"
2. Click "Create Database"
3. Choose "Start in test mode" (for development)
4. Select your preferred location
5. Click "Done"

## Step 3: Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Web" icon (</>) to add a web app
4. Enter app nickname (e.g., "Schedule Website")
5. Copy the configuration object

## Step 4: Update Firebase Configuration

1. Open `firebase-config.js` in your project
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com/",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-actual-app-id"
};
```

## Step 5: Setup GitHub Repository

1. Create a new repository on GitHub
2. Clone this project to your local machine
3. Add your GitHub repository as remote:
```bash
git remote add origin https://github.com/yourusername/your-repo-name.git
```

## Step 6: Enable GitHub Pages

1. Go to your GitHub repository
2. Click "Settings" tab
3. Scroll down to "Pages" section
4. Under "Source", select "GitHub Actions"
5. The website will be available at: `https://yourusername.github.io/your-repo-name`

## Step 7: Deploy

1. Commit and push your changes:
```bash
git add .
git commit -m "Initial commit with real-time collaboration"
git push origin main
```

2. GitHub Actions will automatically deploy your site
3. Check the "Actions" tab to see deployment progress

## Step 8: Test Real-Time Collaboration

1. Open your GitHub Pages URL in multiple browser tabs/windows
2. Click "የሳምንቱን ፕሮግራሞች ማስተካከያ" (Edit Schedule) in one tab
3. Make changes to the schedule
4. Watch the changes appear instantly in other tabs!

## Security Notes

- The current setup uses Firebase test mode (no authentication required)
- For production, consider adding Firebase Authentication
- Set up proper database rules in Firebase Console

## Troubleshooting

### Firebase Not Connecting
- Check browser console for errors
- Verify Firebase configuration is correct
- Ensure Realtime Database is enabled

### Changes Not Syncing
- Check internet connection
- Look for Firebase errors in browser console
- Verify database rules allow read/write access

### GitHub Pages Not Updating
- Check GitHub Actions tab for deployment status
- Ensure main branch has latest changes
- Wait a few minutes for changes to propagate

## Features

✅ **Real-time synchronization** - Changes appear instantly across all users  
✅ **Offline fallback** - Works with local storage when offline  
✅ **Connection status** - Shows online/offline status  
✅ **Automatic deployment** - Updates live site when you push to GitHub  
✅ **Mobile responsive** - Works on all devices  
✅ **No authentication required** - Anyone can edit (configurable)  

## Next Steps

- Add user authentication for controlled access
- Implement user presence indicators (show who's online)
- Add change history/undo functionality
- Create admin panel for schedule management