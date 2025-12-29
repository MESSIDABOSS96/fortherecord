import { createClient } from '@supabase/supabase-js';

async function deleteMessyRecord() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing required environment variables');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'set' : 'missing');
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'set' : 'missing');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Find and delete the Messy record
    const { data: records, error: fetchError } = await supabase
      .from('records')
      .select('id, song_title, artist')
      .eq('song_title', 'Messy')
      .eq('artist', 'Olivia Dean');

    if (fetchError) {
      console.error('Error fetching record:', fetchError);
      process.exit(1);
    }

    if (!records || records.length === 0) {
      console.log('No Messy record found to delete');
      return;
    }

    const record = records[0];
    console.log(`Found record: ${record.song_title} by ${record.artist} (ID: ${record.id})`);

    const { error: deleteError } = await supabase
      .from('records')
      .delete()
      .eq('id', record.id);

    if (deleteError) {
      console.error('Error deleting record:', deleteError);
      process.exit(1);
    }

    console.log('✓ Successfully deleted Messy record');
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

deleteMessyRecord();
