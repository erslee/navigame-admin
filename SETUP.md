# Navigame Admin - Detailed Setup Guide

This guide provides step-by-step instructions to set up the Navigame Admin dashboard from scratch.

## Prerequisites

- Node.js 18+ installed
- A Google account
- Basic understanding of Firebase

## Step 1: Clone and Install

```bash
# Clone the repository (or navigate to your project directory)
cd navigame-admin

# Install dependencies
npm install
```

## Step 2: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** (or select an existing project)
3. Enter project name: `navigame-admin` (or your preferred name)
4. (Optional) Enable Google Analytics
5. Click **Create project**
6. Wait for project creation to complete
7. Click **Continue**

## Step 3: Enable Google Authentication

1. In Firebase Console, select your project
2. Go to **Build** → **Authentication** (in left sidebar)
3. Click **Get started**
4. Click on the **Sign-in method** tab
5. Click on **Google** in the providers list
6. Toggle **Enable**
7. Enter a **Project support email** (your email)
8. Click **Save**

## Step 4: Create Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **Create database**
3. Choose a location (select closest to your users)
4. Select **Start in production mode** (we'll add security rules later)
5. Click **Enable**
6. Wait for database creation to complete

## Step 5: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (click gear icon near "Project Overview")
2. Scroll down to **Your apps** section
3. Click the **Web** icon (`</>`)
4. Enter app nickname: `navigame-admin-web`
5. (Optional) Check **Also set up Firebase Hosting** if you plan to deploy
6. Click **Register app**
7. Copy the `firebaseConfig` object values

## Step 6: Configure Environment Variables

1. In your project root, create `.env.local` file:

```bash
touch .env.local
```

2. Copy the template from `.env.local.example` or add these variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

3. Replace the values with your actual Firebase config values from Step 5

## Step 7: Get Firebase Service Account (for CLI commands)

1. In Firebase Console, go to **Project Settings** → **Service Accounts** tab
2. Click **Generate New Private Key**
3. Click **Generate Key** in the confirmation dialog
4. A JSON file will be downloaded
5. Rename it to `firebase-service-account.json`
6. Move it to your project root directory

⚠️ **IMPORTANT**: Never commit this file to Git! It's already in `.gitignore`.

## Step 8: Add Your First Allowed Email

Before you can sign in, you need to add your email to the allowed list.

### Using the CLI (Recommended)

```bash
npm run add-email your-email@example.com
```

You should see:
```
✓ Firebase Admin initialized
✅ Successfully added email: your-email@example.com
   This email can now sign in to the admin dashboard
```

### Verify it was added:

```bash
npm run list-emails
```

### Alternative: Using Firebase Console

If you don't have the service account yet:

1. Go to **Firestore Database** in Firebase Console
2. Click **+ Start collection**
3. Collection ID: `allowedEmails`
4. Click **Next**
5. Document ID: `your-email@example.com` (your actual email)
6. Add fields:
   - Field: `email`, Type: string, Value: `your-email@example.com`
   - Field: `addedBy`, Type: string, Value: `system`
   - Field: `createdAt`, Type: timestamp, Value: (click "Use current date/time")
7. Click **Save**

## Step 9: Run the Development Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 16.0.1
- Local: http://localhost:3000
```

## Step 10: Test the Application

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. You'll be redirected to `/login`
3. Click **Continue with Google**
4. Sign in with the email you added to the allowed list
5. After successful authentication, you'll be redirected to `/countries`
6. You should see the admin dashboard with sidebar navigation

## Step 11: Set Up Firestore Security Rules (Recommended)

1. In Firebase Console, go to **Firestore Database** → **Rules** tab
2. Replace the existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is allowed
    function isAllowed() {
      return request.auth != null &&
             exists(/databases/$(database)/documents/allowedEmails/$(request.auth.token.email));
    }

    // All collections require authentication and whitelist
    match /{collection}/{document=**} {
      allow read, write: if isAllowed();
    }
  }
}
```

3. Click **Publish**

These rules ensure that only authenticated users whose emails are in the `allowedEmails` collection can read/write data.

## Step 12: Add More Allowed Emails

To give other users access to the admin dashboard:

```bash
npm run add-email another-user@example.com
```

Or use the web interface:
1. Sign in to the admin dashboard
2. Navigate to **Allowed Emails** in the sidebar
3. Enter the email address
4. Click **Add**

## Troubleshooting

### "Module not found" errors

Make sure you ran `npm install` successfully.

### Firebase initialization errors

- Double-check all values in `.env.local`
- Make sure there are no extra spaces or quotes
- Restart the dev server after changing `.env.local`

### "Your email is not authorized"

- Make sure your email is exactly as entered in the `allowedEmails` collection
- Check for typos
- Verify in Firebase Console under Firestore Database

### Can't add emails with CLI

- Make sure `firebase-service-account.json` exists in the project root
- Verify the JSON file is valid (check for syntax errors)
- Make sure you downloaded the service account from the correct Firebase project

### Google Sign-In popup blocked

- Allow popups in your browser for localhost:3000
- Try disabling popup blockers temporarily

## Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

1. Push your code to GitHub (don't commit `.env.local` or `firebase-service-account.json`)
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel project settings (all `NEXT_PUBLIC_*` variables)
5. Deploy

### Deploy to Other Platforms

Make sure to:
- Set all environment variables
- Use Node.js 18+
- Run `npm run build` during deployment

## Next Steps

1. Start adding countries, cities, categories, and POIs
2. Invite team members by adding their emails
3. Customize the design/branding
4. Add more features as needed

## Support

For issues or questions:
- Check the main [README.md](README.md)
- Review Firebase Console for errors
- Check browser console for client-side errors
- Check terminal/logs for server-side errors

## Security Checklist

- [ ] Never commit `.env.local` to Git
- [ ] Never commit `firebase-service-account.json` to Git
- [ ] Set up Firestore security rules
- [ ] Only add trusted emails to allowed list
- [ ] Enable 2FA on your Google account
- [ ] Regularly review allowed emails list
- [ ] Monitor Firebase Console for unusual activity
