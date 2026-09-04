// scripts/import-webster-clean.js
const { ConvexHttpClient } = require('convex/browser');
const fs = require('fs');
const path = require('path');

const CONVEX_URL = 'https://sensible-frog-62.convex.cloud';
const client = new ConvexHttpClient(CONVEX_URL);

// Helper: Remove scripture references from definitions
function removeScriptureReferences(text) {
  if (!text) return '';
  
  let cleaned = text;
  
  // Remove patterns like: "1 John 3:4", "Romans 6:23"
  cleaned = cleaned.replace(/\b[1-3]?\s?[A-Za-z]+(?:\s[A-Za-z]+)?\s+\d+:\d+(?:-\d+)?/g, '');
  
  // Remove patterns with multiple references: "Romans 3:22; Ephesians 1:7"
  cleaned = cleaned.replace(/\b[1-3]?\s?[A-Za-z]+(?:\s[A-Za-z]+)?\s+\d+:\d+(?:-\d+)?(?:;?\s*[1-3]?\s?[A-Za-z]+(?:\s[A-Za-z]+)?\s+\d+:\d+(?:-\d+)?)*/g, '');
  
  // Clean up extra spaces
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.replace(/[;,]+\s*[;,]+\s*/g, '');
  cleaned = cleaned.replace(/[;,]+\s*$/, '');
  cleaned = cleaned.replace(/\s+\./g, '.');
  cleaned = cleaned.replace(/\s+,/g, ',');
  
  return cleaned.trim();
}

// Helper: Format definition with numbered points on separate lines
function formatDefinition(text) {
  if (!text) return '';
  
  let formatted = text;
  
  // Ensure numbered points are on their own lines
  formatted = formatted.replace(/(\d+\.)\s*/g, '\n$1 ');
  formatted = formatted.replace(/(\d+\))\s*/g, '\n$1 ');
  
  // Remove excessive newlines
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  
  return formatted.trim();
}

// Parse CSV and clean definitions
function parseAndCleanCSV() {
  console.log('📖 Loading webster1828.csv...');
  
  const csv = fs.readFileSync('webster1828.csv', 'utf8');
  const lines = csv.split('\n');
  
  console.log(`📊 Total lines: ${lines.length}`);
  
  const entries = [];
  let count = 0;
  let skipped = 0;
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV with quotes
    let word = '';
    let definition = '';
    let inQuotes = false;
    let current = '';
    let fieldIndex = 0;
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        if (fieldIndex === 0) word = current.trim();
        else if (fieldIndex === 1) definition = current.trim();
        current = '';
        fieldIndex++;
      } else {
        current += char;
      }
    }
    if (fieldIndex === 0) word = current.trim();
    else if (fieldIndex === 1) definition = current.trim();
    
    word = word.replace(/^"|"$/g, '').toLowerCase().trim();
    definition = definition.replace(/^"|"$/g, '').trim();
    
    if (word && definition && word.length > 1 && definition.length > 5) {
      // Remove HTML tags
      let cleanDef = definition.replace(/<[^>]*>/g, ' ');
      
      // Remove scripture references
      cleanDef = removeScriptureReferences(cleanDef);
      
      // Clean up
      cleanDef = cleanDef.replace(/\s+/g, ' ').trim();
      
      // Only keep if definition has content after cleaning
      if (cleanDef && cleanDef.length > 5) {
        // Format with numbered points on separate lines
        const formattedDef = formatDefinition(cleanDef);
        
        entries.push({ 
          word: word, 
          definition: formattedDef 
        });
        count++;
        
        if (count % 5000 === 0) {
          console.log(`   Processed ${count} entries...`);
        }
      } else {
        skipped++;
      }
    } else {
      skipped++;
    }
  }
  
  console.log(`📊 Found ${count} valid entries (skipped ${skipped})`);
  return entries;
}

// Import to Convex
async function importToConvex(entries) {
  console.log(`📤 Importing ${entries.length} entries to webster1828...`);
  
  let imported = 0;
  const batchSize = 50;
  const totalBatches = Math.ceil(entries.length / batchSize);
  
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    
    if (batchNum % 10 === 0) {
      console.log(`   Batch ${batchNum}/${totalBatches}...`);
    }
    
    for (const entry of batch) {
      try {
        await client.mutation('dictionary:insert', {
          table: 'webster1828',
          word: entry.word,
          definition: entry.definition,
        });
        imported++;
      } catch (err) {
        // Skip duplicates
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log(`✅ Imported ${imported} entries to webster1828`);
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('📚 Importing Clean Webster\'s 1828 to Convex...');
  console.log('========================================\n');
  
  // Check if CSV exists
  if (!fs.existsSync('webster1828.csv')) {
    console.log('❌ webster1828.csv not found!');
    return;
  }
  
  // Parse and clean
  const entries = parseAndCleanCSV();
  
  if (entries.length === 0) {
    console.log('❌ No valid entries found!');
    return;
  }
  
  // Save to file for backup
  fs.writeFileSync('webster-clean.json', JSON.stringify(entries, null, 2));
  console.log(`💾 Saved to webster-clean.json (${entries.length} entries)`);
  
  // Clear existing Webster data first
  console.log('\n⚠️  This will replace existing Webster data.');
  console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Import to Convex
  console.log('\n📤 Importing to Convex...');
  await importToConvex(entries);
  
  console.log('\n========================================');
  console.log('✅ All imports complete!');
  console.log(`📊 Webster's: ${entries.length} entries`);
}

main().catch(console.error);