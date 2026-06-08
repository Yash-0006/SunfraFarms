import { NextResponse } from 'next/server';
import { searchClient, SALES_INDEX } from '@/lib/search';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    // Search Meilisearch instantly instead of hitting the SQL database
    const result = await searchClient.index(SALES_INDEX).search(q, {
      limit: 50 // Return top 50 matches instantly
    });

    return NextResponse.json(result.hits);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
