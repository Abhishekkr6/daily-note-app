#!/usr/bin/env node

/**
 * OAuth Configuration Checker
 * Run this script to verify your OAuth setup
 */

const requiredEnvVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'MONGO_URI'
];

console.log('🔍 Checking OAuth Configuration...\n');

let allPresent = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('SECRET') ? '[HIDDEN]' : value.substring(0, 30) + '...'}`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
    allPresent = false;
  }
});

console.log('\n' + '='.repeat(60));

if (allPresent) {
  console.log('✅ All required environment variables are present!');
  console.log('\n📝 Next Steps:');
  console.log('1. Verify Google OAuth redirect URI:');
  console.log(`   ${process.env.NEXTAUTH_URL}/api/auth/callback/google`);
  console.log('\n2. Verify GitHub OAuth redirect URI:');
  console.log(`   ${process.env.NEXTAUTH_URL}/api/auth/callback/github`);
  console.log('\n3. Make sure these URIs are added in:');
  console.log('   - Google Cloud Console > Credentials');
  console.log('   - GitHub Settings > Developer Settings > OAuth Apps');
} else {
  console.log('❌ Some environment variables are missing!');
  console.log('Please set them in your .env.local file or Vercel dashboard.');
}

console.log('\n' + '='.repeat(60));
console.log('\n🔗 OAuth Callback URLs that should be configured:');
console.log(`Google:  ${process.env.NEXTAUTH_URL || 'https://your-domain.vercel.app'}/api/auth/callback/google`);
console.log(`GitHub:  ${process.env.NEXTAUTH_URL || 'https://your-domain.vercel.app'}/api/auth/callback/github`);
console.log('\n');
