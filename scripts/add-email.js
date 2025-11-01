#!/usr/bin/env node

/**
 * Script to add an email to the allowed emails list in Firestore
 *
 * Usage:
 *   npm run add-email your-email@example.com
 *
 * Or directly:
 *   node scripts/add-email.js your-email@example.com
 */

const admin = require('firebase-admin');

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('❌ Error: Email address is required');
  console.log('\nUsage:');
  console.log('  npm run add-email your-email@example.com');
  console.log('  OR');
  console.log('  node scripts/add-email.js your-email@example.com');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error(`❌ Error: Invalid email format: ${email}`);
  process.exit(1);
}

// Initialize Firebase Admin
try {
  // Check if service account file exists
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
    console.log('4. Or set FIREBASE_SERVICE_ACCOUNT_PATH environment variable');
    console.log('\nAlternatively, you can use Firebase project credentials:');
    console.log('Set these environment variables in .env.local:');
    console.log('  FIREBASE_PROJECT_ID=your-project-id');
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

// Add email to allowedEmails collection
async function addEmail() {
  try {
    const db = admin.firestore();

    // Check if email already exists
    const docRef = db.collection('allowedEmails').doc(email);
    const doc = await docRef.get();

    if (doc.exists) {
      console.log(`ℹ️  Email already exists: ${email}`);
      const data = doc.data();
      console.log(`   Added by: ${data.addedBy}`);
      console.log(`   Added on: ${data.createdAt.toDate().toLocaleString()}`);
      process.exit(0);
    }

    // Add new email
    await docRef.set({
      email: email,
      addedBy: 'console-script',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ Successfully added email: ${email}`);
    console.log('   This email can now sign in to the admin dashboard');

  } catch (error) {
    console.error('❌ Error adding email:', error.message);
    process.exit(1);
  } finally {
    // Cleanup
    await admin.app().delete();
  }
}

// Run the script
addEmail();
