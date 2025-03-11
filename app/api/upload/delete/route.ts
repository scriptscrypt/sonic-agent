import { supabase } from '@/db';
import { NextResponse } from 'next/server';

// Bucket name
const BUCKET_NAME = 'chat-images';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    // Extract the filename from the URL
    // URL format: https://[supabase-project].supabase.co/storage/v1/object/public/[bucket-name]/[filename]
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    
    if (!filename) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Delete the file from Supabase Storage
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filename]);

    if (error) {
      console.error('Error deleting from Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error handling delete:', error);
    return NextResponse.json(
      { error: 'Error deleting file' },
      { status: 500 }
    );
  }
} 