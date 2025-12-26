/**
 * Database Index Migration Script
 * Run this once to add performance indexes to MongoDB collections
 * 
 * Usage: node scripts/addIndexes.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function addIndexes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    console.log('\n📊 Creating indexes...\n');
    
    // Helper to create index with error handling
    const createIndexSafely = async (collection, indexSpec, options = {}, description) => {
      try {
        await db.collection(collection).createIndex(indexSpec, options);
        console.log(`  ✅ ${description}`);
      } catch (e) {
        if (e.code === 86 || e.codeName === 'IndexKeySpecsConflict' || e.code === 85 || e.codeName === 'IndexOptionsConflict') {
          console.log(`  ⚠️  ${description} (already exists)`);
        } else {
          throw e;
        }
      }
    };
    
    // Resume Collection Indexes
    console.log('Creating Resume indexes...');
    await createIndexSafely('resumes', { tenantId: 1, jobId: 1 }, {}, 'tenantId + jobId');
    await createIndexSafely('resumes', { tenantId: 1, parsingStatus: 1 }, {}, 'tenantId + parsingStatus');
    await createIndexSafely('resumes', { tenantId: 1, createdAt: -1 }, {}, 'tenantId + createdAt (desc)');
    await createIndexSafely('resumes', { 'personalInfo.email': 1 }, { sparse: true }, 'personalInfo.email (sparse)');
    
    // Match Collection Indexes
    console.log('\nCreating Match indexes...');
    await createIndexSafely('matches', { tenantId: 1, jobId: 1 }, {}, 'tenantId + jobId');
    await createIndexSafely('matches', { tenantId: 1, resumeId: 1 }, {}, 'tenantId + resumeId');
    await createIndexSafely('matches', { jobId: 1, overallScore: -1 }, {}, 'jobId + overallScore (desc)');
    await createIndexSafely('matches', { tenantId: 1, reviewStatus: 1 }, {}, 'tenantId + reviewStatus');
    
    // Job Collection Indexes
    console.log('\nCreating Job indexes...');
    await createIndexSafely('jobs', { tenantId: 1, status: 1 }, {}, 'tenantId + status');
    await createIndexSafely('jobs', { tenantId: 1, createdAt: -1 }, {}, 'tenantId + createdAt (desc)');
    
    // Interview Kit Collection Indexes
    console.log('\nCreating InterviewKit indexes...');
    await createIndexSafely('interviewkits', { tenantId: 1, jobId: 1 }, {}, 'tenantId + jobId');
    await createIndexSafely('interviewkits', { tenantId: 1, resumeId: 1 }, {}, 'tenantId + resumeId');
    
    // User Collection Indexes
    console.log('\nCreating User indexes...');
    await createIndexSafely('users', { email: 1 }, { unique: true }, 'email (unique)');
    await createIndexSafely('users', { tenantId: 1 }, {}, 'tenantId');
    
    console.log('\n✅ All indexes created successfully!');
    console.log('\n📊 Summary:');
    console.log('  - Resume indexes: 4');
    console.log('  - Match indexes: 4');
    console.log('  - Job indexes: 2');
    console.log('  - InterviewKit indexes: 2');
    console.log('  - User indexes: 2');
    console.log('  - Total: 14 indexes');
    
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating indexes:', error);
    process.exit(1);
  }
}

// Run the migration
addIndexes();
