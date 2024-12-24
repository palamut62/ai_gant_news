import { NextResponse } from 'next/server';
import { fetchAIUpdates } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const updates = await fetchAIUpdates();
    
    for (const update of updates) {
      const { error } = await supabase
        .from('timeline_events')
        .upsert(
          {
            title: update.title,
            description: update.description,
            date: update.date,
            image_url: update.image_url,
          },
          {
            onConflict: 'title,date',
          }
        );

      if (error) {
        console.error('Error inserting update:', error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating timeline:', error);
    return NextResponse.json({ error: 'Failed to update timeline' }, { status: 500 });
  }
}