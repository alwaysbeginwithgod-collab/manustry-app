// scripts/importFromCSV.ts
import { fetchMutation } from "convex/nextjs";
import { api } from "../convex/_generated/api";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

// ============================================================
// IMPORT WEBSTER 1828 DICTIONARY FROM CSV
// ============================================================
async function importFromCSV() {
  console.log("📚 Starting Webster 1828 Dictionary Import from CSV...");
  
  const filePath = path.join(process.cwd(), "webster1828.csv");
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    console.log("📁 Please make sure 'webster1828.csv' is in the project root folder.");
    return;
  }

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let entries: Array<{word: string, definition: string}> = [];
  let lineNumber = 0;
  let headerLine = true;

  for await (const line of rl) {
    lineNumber++;
    
    // Skip empty lines
    if (!line.trim()) continue;
    
    // Handle header row
    if (headerLine) {
      headerLine = false;
      // Check if it has a header
      const firstLine = line.toLowerCase();
      if (firstLine.includes('word') || firstLine.includes('definition')) {
        console.log("📋 Found header row, skipping...");
        continue;
      }
    }

    try {
      // Try to parse CSV (handles quoted fields)
      const parts = parseCSVLine(line);
      
      let word = "";
      let definition = "";
      
      // Check if we have word and definition
      if (parts.length >= 2) {
        // First part is word, second is definition
        // Sometimes the CSV might have the word first, then definition
        // Sometimes it might have definition first, then word
        // We need to detect which is which
        
        // Check if first part looks like a word (short, no spaces, no punctuation)
        const firstPart = parts[0].trim();
        const secondPart = parts.slice(1).join(" ").trim();
        
        // If first part is short and looks like a word, it's likely the word
        if (firstPart.length < 30 && !firstPart.includes(' ') && !firstPart.includes(',')) {
          word = firstPart;
          definition = secondPart;
        } else {
          // First part might be definition, second part might be word
          // Try to find which part looks like a word
          let foundWord = false;
          for (let i = 0; i < parts.length; i++) {
            const part = parts[i].trim();
            if (part.length < 30 && !part.includes(' ') && !part.includes(',') && !part.includes(';')) {
              // This looks like a word
              word = part;
              definition = parts.filter((_, idx) => idx !== i).join(" ").trim();
              foundWord = true;
              break;
            }
          }
          
          if (!foundWord) {
            word = parts[0].trim();
            definition = parts.slice(1).join(" ").trim();
          }
        }
      } else if (parts.length === 1) {
        // Only one field - try to split by colon or tab
        const singlePart = parts[0];
        const colonMatch = singlePart.match(/^([^:]+):\s*(.+)$/);
        if (colonMatch) {
          word = colonMatch[1].trim();
          definition = colonMatch[2].trim();
        } else {
          // Skip - not enough data
          continue;
        }
      } else {
        continue;
      }
      
      // Clean up the word and definition
      word = word.toLowerCase().trim();
      definition = definition.replace(/^["']|["']$/g, '').trim();
      
      // Skip if word or definition is empty
      if (!word || !definition || word.length < 1) {
        continue;
      }
      
      // Remove the word from the beginning of definition if it appears
      const wordRegex = new RegExp(`^${word}\\s+`, 'i');
      definition = definition.replace(wordRegex, '');
      
      entries.push({ word, definition });
      
      // Process in batches of 50 to avoid rate limits
      if (entries.length >= 50) {
        await processBatch(entries);
        entries = [];
      }
      
    } catch (err) {
      console.log(`⚠️ Error parsing line ${lineNumber}:`, err);
    }
  }

  // Process remaining entries
  if (entries.length > 0) {
    await processBatch(entries);
  }

  console.log("\n✅ Import complete!");
}

// ============================================================
// Process a batch of entries
// ============================================================
async function processBatch(entries: Array<{word: string, definition: string}>) {
  console.log(`📤 Importing batch of ${entries.length} words...`);
  
  let success = 0;
  let failed = 0;
  
  for (const entry of entries) {
    try {
      await fetchMutation(api.dictionary.addWord, {
        word: entry.word,
        definition: entry.definition,
      });
      success++;
    } catch (err) {
      console.log(`❌ Failed to import "${entry.word}":`, err);
      failed++;
    }
  }
  
  console.log(`✅ Batch complete: ${success} imported, ${failed} failed`);
}

// ============================================================
// Parse CSV line (handles quoted fields)
// ============================================================
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  
  // Add the last field
  if (current) {
    result.push(current.trim());
  }
  
  return result;
}

// Run the import
importFromCSV();