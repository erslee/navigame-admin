#!/usr/bin/env node

/**
 * Script to list all allowed emails from Firestore
 *
 * Usage:
 *   npm run list-emails
 *
 * Or directly:
 *   node scripts/list-emails.js
 */

const admin = require('firebase-admin');

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

  console.log('✓ Firebase Admin initialized\n');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message);
  process.exit(1);
}

// List all emails
async function listEmails() {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('allowedEmails').get();

    if (snapshot.empty) {
      console.log('📭 No allowed emails found');
      console.log('\nAdd an email using:');
      console.log('  npm run add-email your-email@example.com');
      process.exit(0);
    }

    console.log(`📧 Allowed Emails (${snapshot.size}):\n`);

    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  ✓ ${data.email}`);
      console.log(`    Added by: ${data.addedBy}`);
      if (data.createdAt) {
        console.log(`    Added on: ${data.createdAt.toDate().toLocaleString()}`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error listing emails:', error.message);
    process.exit(1);
  } finally {
    await admin.app().delete();
  }
}

// Run the script
listEmails();
