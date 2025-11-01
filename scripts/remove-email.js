#!/usr/bin/env node

/**
 * Script to remove an email from the allowed emails list in Firestore
 *
 * Usage:
 *   npm run remove-email your-email@example.com
 *
 * Or directly:
 *   node scripts/remove-email.js your-email@example.com
 */

const admin = require('firebase-admin');

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('❌ Error: Email address is required');
  console.log('\nUsage:');
  console.log('  npm run remove-email your-email@example.com');
  console.log('  OR');
  console.log('  node scripts/remove-email.js your-email@example.com');
  process.exit(1);
}

// Initialize Firebase Admin
try {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json';

  let serviceAccount;
  try {
    serviceAccount = require(`../${serviceAccountPath}`);
  } catch (error) {
    console.error('❌ Error: Firebase service account file not found');
    console.log('\nPlease follow these steps:');
    console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
    console.log('2. Click "Generate new private key"');
    console.log('3. Save the JSON file as firebase-service-account.json in the project root');
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log('✓ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message);
  process.exit(1);
}

// Remove email from allowedEmails collection
async function removeEmail() {
  try {
    const db = admin.firestore();
    const docRef = db.collection('allowedEmails').doc(email);
    const doc = await docRef.get();

    if (!doc.exists) {
      console.log(`ℹ️  Email not found: ${email}`);
      process.exit(0);
    }

    await docRef.delete();
    console.log(`✅ Successfully removed email: ${email}`);
    console.log('   This email can no longer sign in to the admin dashboard');

  } catch (error) {
    console.error('❌ Error removing email:', error.message);
    process.exit(1);
  } finally {
    await admin.app().delete();
  }
}

// Run the script
removeEmail();
