// scripts/test-webster-sin.js
const { ConvexHttpClient } = require('convex/browser');

const client = new ConvexHttpClient('https://sensible-frog-62.convex.cloud');

async function test() {
  console.log('🔍 Testing Webster for "sin"...\n');
  
  // Test 1: Exact search
  const result1 = await client.query('dictionary:search', {
    table: 'webster1828',
    query: 'sin',
    limit: 1,
  });
  console.log('Exact search:', result1 && result1.length > 0 ? '✅ Found' : '❌ Not found');
  if (result1 && result1.length > 0) {
    console.log('  Word:', result1[0].word);
  }
  
  // Test 2: searchInDefinitions
  const result2 = await client.query('dictionary:searchInDefinitions', {
    table: 'webster1828',
    query: 'sin',
    limit: 1,
  });
  console.log('\nsearchInDefinitions:', result2 && result2.length > 0 ? '✅ Found' : '❌ Not found');
  if (result2 && result2.length > 0) {
    console.log('  Word:', result2[0].word);
    console.log('  Definition preview:', result2[0].definition.substring(0, 100) + '...');
  }
}

test().catch(console.error);