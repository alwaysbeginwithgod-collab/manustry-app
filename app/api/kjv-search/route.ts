// app/api/kjv-search/route.ts
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://sensible-frog-62.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

export async function POST(request: Request) {
  try {
    const { query, isPhrase, limit } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }
    
    const result = await client.query(api.kjv.search, {
      query: query,
      isPhrase: isPhrase || false,
      limit: limit || 1000,
    });
    
    return NextResponse.json({ results: result });
  } catch (error) {
    console.error("KJV search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}