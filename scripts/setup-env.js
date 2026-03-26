#!/usr/bin/env node

/**
 * Script to generate environment.ts from environment variables
 * Used in CI/CD to inject GitHub secrets securely
 */

const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '../src/environments/environment.ts');

const environment = `export const environment = {
  firebaseConfig: {
    apiKey: "${process.env.FIREBASE_API_KEY}",
    authDomain: "${process.env.FIREBASE_AUTH_DOMAIN}",
    projectId: "${process.env.FIREBASE_PROJECT_ID}",
    storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET}",
    messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID}",
    appId: "${process.env.FIREBASE_APP_ID}",
    measurementId: "${process.env.FIREBASE_MEASUREMENT_ID}"
  },
  apiBase: "${process.env.API_BASE}"
};
`;

fs.writeFileSync(envFile, environment, 'utf-8');
console.log('✅ Environment file generated successfully');
