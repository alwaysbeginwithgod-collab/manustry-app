// scripts/import-kjv.js
const { ConvexHttpClient } = require('convex/browser');
const fs = require('fs');

const CONVEX_URL = 'https://sensible-frog-62.convex.cloud';
const client = new ConvexHttpClient(CONVEX_URL);

async function importKJV() {
  console.log('📖 Loading kjv.json...');
  
  const data = JSON.parse(fs.readFileSync('kjv.json', 'utf8'));
  
  // Get the verses array
  const verses = data.verses || [];
  
  console.log(`📊 Found ${verses.length} verses`);
  
  if (verses.length === 0) {
    console.log('❌ No verses found!');
    return;
  }
  
  // Show sample
  console.log('📋 Sample verse:', JSON.stringify(verses[0], null, 2));
  
  // Import to Convex in batches
  const batchSize = 100;
  let imported = 0;
  
  console.log('📤 Importing to Convex...');
  
  for (let i = 0; i < verses.length; i += batchSize) {
    const batch = verses.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(verses.length / batchSize);
    
    if (batchNum % 10 === 0 || batchNum === 1 || batchNum === totalBatches) {
      console.log(`   Batch ${batchNum}/${totalBatches}...`);
    }
    
    for (const verse of batch) {
      try {
        await client.mutation('kjv:insert', {
          book: verse.book_name || verse.book || 'Unknown',
          chapter: verse.chapter || 1,
          verse: verse.verse || 1,
          text: verse.text || '',
        });
        imported++;
      } catch (err) {
        // Skip errors
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`✅ Imported ${imported} verses to kjv`);
}

importKJV().catch(console.error);