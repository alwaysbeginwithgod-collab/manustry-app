// app/api/dictionary/route.ts
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import { WEBSTER_FALLBACK } from "../../data/websterFallback";

// ============================================================
// CONVEX CONFIGURATION
// ============================================================
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://sensible-frog-62.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

// ============================================================
// Helper: Remove scripture references from Webster (already clean)
// ============================================================
function cleanDefinition(text: string): string {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')
    .trim();
}

// ============================================================
// Helper: Format definition with numbered points
// ============================================================
function formatDefinition(text: string): string {
  if (!text) return '';
  
  let formatted = text;
  formatted = formatted.replace(/(\d+\.)\s*/g, '\n$1 ');
  formatted = formatted.replace(/(\d+\))\s*/g, '\n$1 ');
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  return formatted.trim();
}

// ============================================================
// Helper: Format definition as paragraphs (for Easton's and Smith's)
// ============================================================
function formatDefinitionAsParagraph(text: string): string {
  if (!text) return '';
  let formatted = text;
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  return formatted.trim();
}

// ============================================================
// Helper: Get dictionary from Convex
// ============================================================
async function getDictionaryFromConvex(word: string, table: string): Promise<string | null> {
  try {
    const result = await client.query(api.dictionary.search, {
      table: table,
      query: word,
      limit: 1,
    });
    
    if (result && result.length > 0 && result[0]?.definition) {
      const cleaned = cleanDefinition(result[0].definition);
      if (cleaned && cleaned.length > 5) {
        return cleaned;
      }
    }
    return null;
  } catch (error) {
    console.log(`Error fetching from ${table}:`, error);
    return null;
  }
}

// ============================================================
// MAIN API ROUTE
// ============================================================
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get("word");

  if (!word) {
    return NextResponse.json({ error: "Word parameter required" }, { status: 400 });
  }

  const cleanWord = word.toLowerCase().trim();
  const startTime = Date.now();
  let definitions: { [key: string]: string } = {};
  let hasAny = false;
  let source = "unknown";

  try {
    console.log(`⚡ Searching for "${cleanWord}"...`);

    // ============================================================
    // STEP 1: Get Webster's from Convex
    // ============================================================
    const websterDef = await getDictionaryFromConvex(cleanWord, 'webster1828');
    if (websterDef) {
      const formattedDef = formatDefinition(websterDef);
      definitions["📚 Webster's 1828 Dictionary"] = formattedDef;
      hasAny = true;
      source = "Convex (Webster)";
      console.log(`✅ Webster's: Found "${cleanWord}"`);
    }

    // ============================================================
    // STEP 2: Get Easton's from Convex
    // ============================================================
    const eastonDef = await getDictionaryFromConvex(cleanWord, 'eastonsDictionary');
    if (eastonDef) {
      const formattedDef = formatDefinitionAsParagraph(eastonDef);
      definitions["📖 Easton's Bible Dictionary"] = formattedDef;
      hasAny = true;
      if (source === "unknown") source = "Convex (Easton)";
      else source = source + ", Easton";
      console.log(`✅ Easton's: Found "${cleanWord}"`);
    }

    // ============================================================
    // STEP 3: Get Smith's from Convex
    // ============================================================
    const smithDef = await getDictionaryFromConvex(cleanWord, 'smithsDictionary');
    if (smithDef) {
      const formattedDef = formatDefinitionAsParagraph(smithDef);
      definitions["📗 Smith's Bible Dictionary"] = formattedDef;
      hasAny = true;
      if (source === "unknown") source = "Convex (Smith)";
      else source = source + ", Smith";
      console.log(`✅ Smith's: Found "${cleanWord}"`);
    }

    // ============================================================
    // STEP 4: Fallback (if not found in Convex)
    // ============================================================
    if (!hasAny && WEBSTER_FALLBACK[cleanWord]) {
      definitions["📚 Webster's 1828 Dictionary"] = WEBSTER_FALLBACK[cleanWord];
      hasAny = true;
      if (source === "unknown") source = "Fallback";
      else source = source + ", Fallback";
      console.log(`🟡 Fallback: Found "${cleanWord}"`);
    }

    // ============================================================
    // STEP 5: If no definition found
    // ============================================================
    if (!hasAny) {
      definitions["📚 Word Not Found"] = `No definition found for "${word}". Please try a different word.`;
      hasAny = true;
      source = source + ", Not Found";
      console.log(`🟡 No definition found for "${cleanWord}"`);
    }

    // ✅ Return the result
    return NextResponse.json({
      word: cleanWord,
      definitions: definitions,
      found: hasAny,
      source: source,
      responseTime: Date.now() - startTime,
    });

  } catch (error) {
    console.error("Dictionary error:", error);
    return NextResponse.json({
      word: cleanWord,
      definitions: {
        "📚 Error": "Unable to fetch definition. Please try again."
      },
      found: false,
      message: `Unable to fetch definition. Please try again.`,
    });
  }
}