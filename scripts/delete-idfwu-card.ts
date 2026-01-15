import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteCard() {
  try {
    // First, find the card
    console.log('Searching for "i don\'t fuck with you" card...');
    const { data: cards, error: searchError } = await supabase
      .from('records')
      .select('*')
      .ilike('song_title', '%i don%t fuck with you%');

    if (searchError) {
      console.error('Error searching:', searchError);
      return;
    }

    if (!cards || cards.length === 0) {
      console.log('Card not found. Searching with alternative spelling...');
      const { data: altCards, error: altError } = await supabase
        .from('records')
        .select('*')
        .ilike('song_title', '%IDFWU%');

      if (altError) {
        console.error('Error searching:', altError);
        return;
      }

      if (!altCards || altCards.length === 0) {
        console.log('Card not found with either spelling.');
        return;
      }

      console.log('Found card(s):', altCards);

      // Delete the card(s)
      for (const card of altCards) {
        console.log(`Deleting card ID: ${card.id}, Song: ${card.song_title}`);
        const { error: deleteError } = await supabase
          .from('records')
          .delete()
          .eq('id', card.id);

        if (deleteError) {
          console.error(`Error deleting card ${card.id}:`, deleteError);
        } else {
          console.log(`✓ Deleted card: ${card.song_title}`);
        }
      }
      return;
    }

    console.log('Found card(s):', cards);

    // Delete the card(s)
    for (const card of cards) {
      console.log(`Deleting card ID: ${card.id}, Song: ${card.song_title}`);
      const { error: deleteError } = await supabase
        .from('records')
        .delete()
        .eq('id', card.id);

      if (deleteError) {
        console.error(`Error deleting card ${card.id}:`, deleteError);
      } else {
        console.log(`✓ Deleted card: ${card.song_title}`);
      }
    }

    console.log('\n✅ Deletion completed!');
  } catch (error) {
    console.error('Script error:', error);
  }
}

deleteCard();
