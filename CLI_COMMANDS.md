# CLI Commands Reference

Console commands for managing the Navigame Admin dashboard.

## Prerequisites

Before using these commands, you need:

1. **Firebase Service Account** file saved as `firebase-service-account.json` in the project root
2. To obtain this file:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `firebase-service-account.json`

## Available Commands

### Add Email to Allowed List

Add an email address to authorize access to the admin dashboard.

```bash
npm run add-email your-email@example.com
```

**Example Output:**
```
✓ Firebase Admin initialized
✅ Successfully added email: your-email@example.com
   This email can now sign in to the admin dashboard
```

**If email already exists:**
```
✓ Firebase Admin initialized
ℹ️  Email already exists: your-email@example.com
   Added by: console-script
   Added on: 11/1/2025, 10:30:00 AM
```

### List All Allowed Emails

Display all emails currently authorized to access the dashboard.

```bash
npm run list-emails
```

**Example Output:**
```
✓ Firebase Admin initialized

📧 Allowed Emails (3):

  ✓ admin@example.com
    Added by: console-script
    Added on: 11/1/2025, 10:30:00 AM

  ✓ user@example.com
    Added by: admin@example.com
    Added on: 11/1/2025, 2:15:00 PM

  ✓ developer@example.com
    Added by: console-script
    Added on: 11/1/2025, 3:45:00 PM
```

**If no emails exist:**
```
✓ Firebase Admin initialized

📭 No allowed emails found

Add an email using:
  npm run add-email your-email@example.com
```

### Remove Email from Allowed List

Remove an email address and revoke dashboard access.

```bash
npm run remove-email user@example.com
```

**Example Output:**
```
✓ Firebase Admin initialized
✅ Successfully removed email: user@example.com
   This email can no longer sign in to the admin dashboard
```

**If email doesn't exist:**
```
✓ Firebase Admin initialized
ℹ️  Email not found: user@example.com
```

## Use Cases

### Initial Setup

When first setting up the project, add your admin email:

```bash
npm run add-email admin@example.com
```

### Adding Team Members

When onboarding new team members:

```bash
npm run add-email newmember@company.com
npm run list-emails  # Verify it was added
```

### Removing Access

When someone leaves the team:

```bash
npm run remove-email oldmember@company.com
npm run list-emails  # Verify removal
```

### Audit Access List

Regularly review who has access:

```bash
npm run list-emails
```

## Error Handling

### Missing Service Account File

**Error:**
```
❌ Error: Firebase service account file not found

Please follow these steps:
1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save the JSON file as firebase-service-account.json in the project root
```

**Solution:** Follow the steps in the error message to download the service account file.

### Invalid Email Format

**Error:**
```
❌ Error: Invalid email format: not-an-email
```

**Solution:** Provide a valid email address in the format `user@domain.com`

### Missing Email Argument

**Error:**
```
❌ Error: Email address is required

Usage:
  npm run add-email your-email@example.com
```

**Solution:** Provide an email address as an argument

### Firebase Connection Issues

**Error:**
```
❌ Error initializing Firebase Admin: [error details]
```

**Solution:**
- Verify `firebase-service-account.json` is valid JSON
- Check that you downloaded it from the correct Firebase project
- Ensure you have internet connection

## Direct Script Execution

You can also run the scripts directly with Node.js:

```bash
# Add email
node scripts/add-email.js your-email@example.com

# List emails
node scripts/list-emails.js

# Remove email
node scripts/remove-email.js your-email@example.com
```

## Environment Variables

By default, scripts look for `firebase-service-account.json` in the project root. You can specify a different path:

```bash
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-admin.json npm run add-email user@example.com
```

## Security Notes

- ⚠️ **Never commit** `firebase-service-account.json` to version control
- 🔒 The service account has **admin access** to your Firebase project
- 👥 Only share the service account file with **trusted team members**
- 🔑 Rotate service account keys periodically for security
- 📝 Keep track of who you add to the allowed list

## Firestore Structure

These commands interact with the `allowedEmails` collection:

```
allowedEmails/
├── user1@example.com
│   ├── email: "user1@example.com"
│   ├── addedBy: "console-script" or "admin@example.com"
│   └── createdAt: Timestamp
├── user2@example.com
│   └── ...
```

- **Document ID** = email address
- **email** field = same as document ID
- **addedBy** = who added this email (script or admin user)
- **createdAt** = when it was added

## Troubleshooting

### Script hangs or doesn't exit

This is normal - the script needs time to:
1. Connect to Firebase
2. Perform the operation
3. Disconnect gracefully

Wait a few seconds. If it takes more than 10 seconds, try Ctrl+C and check your internet connection.

### Changes not reflected in web app

If you add/remove emails via CLI but don't see changes in the web app:

1. The web app checks permissions on each sign-in
2. User needs to **sign out and sign in again** for changes to take effect
3. Or refresh the authentication state by refreshing the page

## Best Practices

1. **Bootstrap with CLI**: Use CLI to add the first admin email
2. **Use Web UI for routine management**: After initial setup, use the web interface (Allowed Emails page)
3. **CLI for bulk operations**: Use CLI for adding multiple emails at once
4. **Regular audits**: Run `npm run list-emails` monthly to review access
5. **Document additions**: Keep a separate log of who was given access and why

## Examples

### Add multiple emails

```bash
npm run add-email admin@company.com
npm run add-email user1@company.com
npm run add-email user2@company.com
npm run list-emails
```

### Cleanup old access

```bash
# First, review the list
npm run list-emails

# Remove old users
npm run remove-email olduser1@company.com
npm run remove-email olduser2@company.com

# Verify
npm run list-emails
```
