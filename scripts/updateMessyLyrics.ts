import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateMessyLyrics() {
  try {
    // Find the Messy card
    const { data: records, error: fetchError } = await supabase
      .from('records')
      .select('*')
      .eq('song_title', 'Messy')
      .eq('artist', 'Olivia Dean');

    if (fetchError) throw fetchError;
    if (!records || records.length === 0) {
      console.log('No Messy record found');
      return;
    }

    const record = records[0];
    console.log('Found record:', record.id);
    console.log('Current lyrics:', record.lyric_excerpt);

    // Remove the two lines
    const currentLyrics = record.lyric_excerpt;
    const linesToRemove = 'And double yellow lining\nHitting seventy-one down the M25';
    const updatedLyrics = currentLyrics.replace(linesToRemove + '\n', '').replace(linesToRemove, '');

    console.log('\nUpdated lyrics:', updatedLyrics);

    // Update the record
    const { error: updateError } = await supabase
      .from('records')
      .update({ lyric_excerpt: updatedLyrics })
      .eq('id', record.id);

    if (updateError) throw updateError;

    console.log('\n✓ Successfully updated Messy lyric card');
  } catch (error) {
    console.error('Error:', error);
  }
}

updateMessyLyrics();
