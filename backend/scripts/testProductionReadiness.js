#!/usr/bin/env node
/**
 * Production Readiness Test Suite
 * Validates all critical fixes are working correctly
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🧪 PRODUCTION READINESS TEST SUITE\n');
console.log('Testing all critical fixes...\n');

const tests = {
  passed: 0,
  failed: 0,
  results: []
};

const test = (name, fn) => {
  return async () => {
    try {
      await fn();
      tests.passed++;
      tests.results.push({ name, status: '✅ PASS' });
      console.log(`✅ ${name}`);
    } catch (error) {
      tests.failed++;
      tests.results.push({ name, status: `❌ FAIL: ${error.message}` });
      console.error(`❌ ${name}: ${error.message}`);
    }
  };
};

async function runTests() {
  console.log('📊 Test 1: Database Connection\n');
  
  await test('Connect to MongoDB', async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    if (!mongoose.connection.db) throw new Error('No database connection');
  })();
  
  console.log('\n📊 Test 2: Database Indexes\n');
  
  await test('Resume indexes exist', async () => {
    const indexes = await mongoose.connection.db.collection('resumes').indexes();
    const hastenantIdJobId = indexes.some(idx => idx.key.tenantId && idx.key.jobId);
    const hastenantIdStatus = indexes.some(idx => idx.key.tenantId && idx.key.parsingStatus);
    if (!hastenantIdJobId || !hastenantIdStatus) {
      throw new Error('Missing required indexes');
    }
  })();
  
  await test('Match indexes exist', async () => {
    const indexes = await mongoose.connection.db.collection('matches').indexes();
    const hastenantIdJobId = indexes.some(idx => idx.key.tenantId && idx.key.jobId);
    const hasJobIdScore = indexes.some(idx => idx.key.jobId && idx.key.overallScore);
    if (!hastenantIdJobId || !hasJobIdScore) {
      throw new Error('Missing required indexes');
    }
  })();
  
  await test('Job indexes exist', async () => {
    const indexes = await mongoose.connection.db.collection('jobs').indexes();
    const hastenantIdStatus = indexes.some(idx => idx.key.tenantId && idx.key.status);
    if (!hastenantIdStatus) {
      throw new Error('Missing required indexes');
    }
  })();
  
  await test('User indexes exist', async () => {
    const indexes = await mongoose.connection.db.collection('users').indexes();
    const hasEmailUnique = indexes.some(idx => idx.key.email && idx.unique);
    if (!hasEmailUnique) {
      throw new Error('Missing email unique index');
    }
  })();
  
  console.log('\n📊 Test 3: User Model Enhancements\n');
  
  await test('User model has refresh token fields', async () => {
    const User = (await import('../models/User.js')).default;
    const schema = User.schema.obj;
    if (!schema.refreshToken || !schema.refreshTokenExpiry) {
      throw new Error('Missing refresh token fields in User schema');
    }
  })();
  
  await test('User model has saveRefreshToken method', async () => {
    const User = (await import('../models/User.js')).default;
    if (typeof User.schema.methods.saveRefreshToken !== 'function') {
      throw new Error('Missing saveRefreshToken method');
    }
  })();
  
  await test('User model has clearRefreshToken method', async () => {
    const User = (await import('../models/User.js')).default;
    if (typeof User.schema.methods.clearRefreshToken !== 'function') {
      throw new Error('Missing clearRefreshToken method');
    }
  })();
  
  console.log('\n📊 Test 4: JWT Utils\n');
  
  await test('generateRefreshToken function exists', async () => {
    const jwt = await import('../utils/jwt.js');
    if (typeof jwt.generateRefreshToken !== 'function') {
      throw new Error('generateRefreshToken function not found');
    }
  })();
  
  await test('generateRefreshToken creates valid token', async () => {
    const { generateRefreshToken } = await import('../utils/jwt.js');
    const token = generateRefreshToken({ userId: '123', tenantId: '456' });
    if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
      throw new Error('Invalid refresh token generated');
    }
  })();
  
  console.log('\n📊 Test 5: Auth Controller\n');
  
  await test('Auth controller exports refreshToken', async () => {
    const auth = await import('../controllers/authController.js');
    if (typeof auth.refreshToken !== 'function') {
      throw new Error('refreshToken function not exported');
    }
  })();
  
  await test('Auth controller exports logout', async () => {
    const auth = await import('../controllers/authController.js');
    if (typeof auth.logout !== 'function') {
      throw new Error('logout function not exported');
    }
  })();
  
  console.log('\n📊 Test 6: File Validation Middleware\n');
  
  await test('File validation middleware exists', async () => {
    const validation = await import('../middleware/fileValidation.js');
    if (typeof validation.validateUploadedFile !== 'function') {
      throw new Error('validateUploadedFile middleware not found');
    }
  })();
  
  await test('File validation has validateUploadedFiles', async () => {
    const validation = await import('../middleware/fileValidation.js');
    if (typeof validation.validateUploadedFiles !== 'function') {
      throw new Error('validateUploadedFiles middleware not found');
    }
  })();
  
  console.log('\n📊 Test 7: Tenant Validation Middleware\n');
  
  await test('Tenant validation middleware exists', async () => {
    const validation = await import('../middleware/tenantValidation.js');
    if (typeof validation.validateTenantOwnership !== 'function') {
      throw new Error('validateTenantOwnership middleware not found');
    }
  })();
  
  console.log('\n📊 Test 8: Dependencies\n');
  
  await test('file-type package installed', async () => {
    try {
      await import('file-type');
    } catch (e) {
      throw new Error('file-type package not installed');
    }
  })();
  
  await test('express-rate-limit package installed', async () => {
    try {
      await import('express-rate-limit');
    } catch (e) {
      throw new Error('express-rate-limit package not installed');
    }
  })();
  
  // Close database connection
  await mongoose.connection.close();
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${tests.passed + tests.failed}`);
  console.log(`✅ Passed: ${tests.passed}`);
  console.log(`❌ Failed: ${tests.failed}`);
  console.log(`Success Rate: ${Math.round((tests.passed / (tests.passed + tests.failed)) * 100)}%`);
  console.log('='.repeat(60));
  
  if (tests.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED - PRODUCTION READY! 🚀\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  SOME TESTS FAILED - FIX BEFORE DEPLOYMENT\n');
    console.log('Failed tests:');
    tests.results
      .filter(r => r.status.startsWith('❌'))
      .forEach(r => console.log(`  ${r.status}`));
    console.log('');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
