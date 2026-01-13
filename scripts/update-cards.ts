import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateCards() {
  try {
    // 1. Delete the second, more recent Messy card (Claire)
    console.log('Deleting newer Messy card...');
    const { error: deleteError } = await supabase
      .from('records')
      .delete()
      .eq('id', '1768340683468');

    if (deleteError) {
      console.error('Error deleting Messy card:', deleteError);
    } else {
      console.log('✓ Deleted Messy card for Claire');
    }

    // 2. Update Weird Fishes card (alex)
    console.log('Updating Weird Fishes card...');
    const { error: weirdFishesError } = await supabase
      .from('records')
      .update({
        reflection_text: "even when i'm having a bad day, you'll just look at me and i'll feel like myself again",
        created_at: new Date('2025-12-28T00:00:00.000Z').toISOString()
      })
      .eq('id', '6');

    if (weirdFishesError) {
      console.error('Error updating Weird Fishes:', weirdFishesError);
    } else {
      console.log('✓ Updated Weird Fishes card');
    }

    // 3. Update Golden Slumbers card (mom)
    console.log('Updating Golden Slumbers card...');
    const { error: goldenError } = await supabase
      .from('records')
      .update({
        reflection_text: "My earliest memory is you singing this to me when I couldn't sleep. Now I'm away at school and I play it when I'm homesick or stressed. Miss you mom",
        created_at: new Date('2025-12-29T00:00:00.000Z').toISOString()
      })
      .eq('id', '1766951128591');

    if (goldenError) {
      console.error('Error updating Golden Slumbers:', goldenError);
    } else {
      console.log('✓ Updated Golden Slumbers card');
    }

    // 4. Update Vienna card (sister)
    console.log('Updating Vienna card...');
    const { error: viennaError } = await supabase
      .from('records')
      .update({
        reflection_text: "you're always running toward the next thing. i wish you'd slow down sometimes and see how much you've already done. you're doing amazing, even if you don't realize it yet. i'm proud of you.",
        created_at: new Date('2025-12-29T00:00:00.000Z').toISOString()
      })
      .eq('id', '1767041774451');

    if (viennaError) {
      console.error('Error updating Vienna:', viennaError);
    } else {
      console.log('✓ Updated Vienna card');
    }

    // 5. Update Who Knows card - first one (Ethan)
    console.log('Updating Who Knows card...');
    const { error: whoKnowsError } = await supabase
      .from('records')
      .update({
        reflection_text: "You're always there when I need you. Doesn't matter what's going on in your life, you show up. I don't think I tell you enough how much that means to me. You're the kind of friend everyone wishes they had.",
        created_at: new Date('2026-01-05T00:00:00.000Z').toISOString()
      })
      .eq('id', '1767043311162');

    if (whoKnowsError) {
      console.error('Error updating Who Knows:', whoKnowsError);
    } else {
      console.log('✓ Updated Who Knows card');
    }

    // 6. Update I'll Be Your Mirror card (dad)
    console.log('Updating I\'ll Be Your Mirror card...');
    const { error: mirrorError } = await supabase
      .from('records')
      .update({
        reflection_text: "My dad's always been honest with me, even when it's hard to hear. This makes me think of him. It's not always easy, but I'm lucky to have someone who tells it like it is. Love you dad.",
        created_at: new Date('2026-01-08T00:00:00.000Z').toISOString()
      })
      .eq('id', '1767041384831');

    if (mirrorError) {
      console.error('Error updating I\'ll Be Your Mirror:', mirrorError);
    } else {
      console.log('✓ Updated I\'ll Be Your Mirror card');
    }

    console.log('\n✅ All updates completed successfully!');
  } catch (error) {
    console.error('Script error:', error);
  }
}

updateCards();
