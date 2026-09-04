// scripts/convertDictionaries.ts
import * as fs from 'fs';
import * as path from 'path';

// ============================================================
// PARSE THML FORMAT (CCEL Easton's/Smith's Bible Dictionary)
// ============================================================
function parseThMLDictionary(xmlFile: string, outputFile: string) {
  console.log(`📖 Converting ${xmlFile}...`);
  
  const xml = fs.readFileSync(path.join(process.cwd(), xmlFile), 'utf8');
  
  // Extract only the body content (between <ThML> and </ThML>)
  const bodyMatch = xml.match(/<ThML[^>]*>([\s\S]*?)<\/ThML>/i);
  if (!bodyMatch) {
    console.log('❌ Could not find <ThML> tags');
    return;
  }
  
  const body = bodyMatch[1];
  
  // Find all entry paragraphs with id attributes
  // Pattern: <p id="word">definition</p>
  const entryRegex = /<p\s+id="([^"]*)"[^>]*>([\s\S]*?)<\/p>/g;
  let match;
  const dictionary: { [key: string]: string } = {};
  
  let count = 0;
  while ((match = entryRegex.exec(body)) !== null) {
    const word = match[1].trim().toLowerCase();
    let definition = match[2].trim();
    
    // Clean up the definition
    definition = definition
      .replace(/<[^>]*>/g, ' ')  // Remove HTML tags
      .replace(/\s+/g, ' ')       // Normalize whitespace
      .trim();
    
    if (word && definition && word.length > 0 && definition.length > 5) {
      // Skip duplicates
      if (!dictionary[word]) {
        dictionary[word] = definition;
        count++;
      }
    }
  }
  
  console.log(`✅ Found ${count} entries`);
  
  fs.writeFileSync(
    path.join(process.cwd(), outputFile),
    JSON.stringify(dictionary, null, 2)
  );
  
  console.log(`💾 Saved to ${outputFile}`);
  
  return dictionary;
}

// ============================================================
// PARSE KJV JSON (Clean up if needed)
// ============================================================
function parseKJV() {
  console.log(`📖 Converting kjv.json...`);
  
  const filePath = path.join(process.cwd(), 'kjv.json');
  if (!fs.existsSync(filePath)) {
    console.log('❌ kjv.json not found');
    return;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // If it's an array of verses, clean it up
    if (Array.isArray(data)) {
      console.log(`✅ Found ${data.length} verses`);
      // Save as-is if it's already clean
      // You might want to format it differently
      fs.writeFileSync(
        path.join(process.cwd(), 'kjv.clean.json'),
        JSON.stringify(data, null, 2)
      );
      console.log(`💾 Saved to kjv.clean.json`);
    } else {
      console.log('📋 Data is not an array, saving as-is');
    }
  } catch (error) {
    console.error('❌ Error parsing kjv.json:', error);
  }
}

// ============================================================
// RUN ALL CONVERSIONS
// ============================================================
function run() {
  console.log('📚 Starting dictionary conversions...\n');
  
  // Convert Easton's
  if (fs.existsSync(path.join(process.cwd(), 'easton.xml'))) {
    parseThMLDictionary('easton.xml', 'easton.json');
  } else {
    console.log('⚠️ easton.xml not found');
  }
  
  console.log('');
  
  // Convert Smith's
  if (fs.existsSync(path.join(process.cwd(), 'smith.xml'))) {
    parseThMLDictionary('smith.xml', 'smith.json');
  } else {
    console.log('⚠️ smith.xml not found');
  }
  
  console.log('');
  
  // Convert KJV
  if (fs.existsSync(path.join(process.cwd(), 'kjv.json'))) {
    parseKJV();
  } else {
    console.log('⚠️ kjv.json not found');
  }
  
  console.log('\n✅ All conversions complete!');
}

run();