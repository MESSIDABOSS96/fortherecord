import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ygpnkvwretilfrmeirtp.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlncG5rdndyZXRpbGZybWVpcnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4OTgzNTUsImV4cCI6MjA4MjQ3NDM1NX0.Cqc7J68bQotQ1lQa61_PKc7thX_QUrQz7ahkAILxOOM';

const songsToDelete = [
  'timeless',
  "can't say",
  'wildflower',
  'the blacker the berry',
  'oh my dis side'
];

async function deleteCards() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Fetching all records...');
  const { data: records, error: fetchError } = await supabase
    .from('records')
    .select('*');

  if (fetchError) {
    console.error('Error fetching records:', fetchError);
    return;
  }

  console.log(`Found ${records?.length || 0} total records`);

  // Find records matching song titles (case-insensitive)
  const recordsToDelete = records?.filter(record =>
    songsToDelete.some(song =>
      record.song_title.toLowerCase().includes(song.toLowerCase()) ||
      song.toLowerCase().includes(record.song_title.toLowerCase())
    )
  );

  if (!recordsToDelete || recordsToDelete.length === 0) {
    console.log('No matching records found');
    return;
  }

  console.log(`\nFound ${recordsToDelete.length} record(s) to delete:`);
  recordsToDelete.forEach(record => {
    console.log(`- "${record.song_title}" by ${record.artist} (ID: ${record.id})`);
  });

  // Delete each record
  for (const record of recordsToDelete) {
    console.log(`\nDeleting "${record.song_title}"...`);
    const { error: deleteError } = await supabase
      .from('records')
      .delete()
      .eq('id', record.id);

    if (deleteError) {
      console.error(`Error deleting record ${record.id}:`, deleteError);
    } else {
      console.log(`✓ Deleted "${record.song_title}"`);
    }
  }

  console.log('\nDone!');
}

deleteCards();
