// Clean song title to remove metadata suffixes that Spotify adds
// Used both on API side (for search matching) and client side (for display)
export function cleanSongTitle(title: string): string {
  return title
    // Featuring artists (highest priority - remove first)
    .replace(/\s*\(feat\.?[^)]*\)/gi, '')         // (feat. Artist)
    .replace(/\s*\(ft\.?[^)]*\)/gi, '')           // (ft. Artist)
    .replace(/\s*\(featuring[^)]*\)/gi, '')       // (featuring Artist)
    .replace(/\s*\(with[^)]*\)/gi, '')            // (with Artist)

    // Parenthesized versions/editions
    .replace(/\s*\(Remastered[^)]*\)/gi, '')      // (Remastered), (Remastered 2009)
    .replace(/\s*\(Live[^)]*\)/gi, '')            // (Live), (Live at Venue)
    .replace(/\s*\(Explicit\)/gi, '')             // (Explicit)
    .replace(/\s*\(Radio[^)]*\)/gi, '')           // (Radio Edit), (Radio Version)
    .replace(/\s*\(Album[^)]*\)/gi, '')           // (Album Version)
    .replace(/\s*\(Single[^)]*\)/gi, '')          // (Single Version)
    .replace(/\s*\(Deluxe[^)]*\)/gi, '')          // (Deluxe), (Deluxe Edition)
    .replace(/\s*\(Acoustic[^)]*\)/gi, '')        // (Acoustic), (Acoustic Version)
    .replace(/\s*\(Instrumental\)/gi, '')         // (Instrumental)
    .replace(/\s*\(Extended[^)]*\)/gi, '')        // (Extended), (Extended Mix)
    .replace(/\s*\(Original[^)]*\)/gi, '')        // (Original Mix)
    .replace(/\s*\(\d+th Anniversary[^)]*\)/gi, '') // (10th Anniversary Edition)
    .replace(/\s*\(Bonus[^)]*\)/gi, '')           // (Bonus Track)
    .replace(/\s*\(OST\)/gi, '')                  // (OST)
    .replace(/\s*\(From[^)]*\)/gi, '')            // (From "Movie")

    // Soundtrack/Album/Theme references with dash
    .replace(/\s*-\s*From\s+["'][^"']+["']\s*(Soundtrack|Original Motion Picture Soundtrack|OST)?/gi, '') // - From "La La Land" Soundtrack
    .replace(/\s*-\s*Original Motion Picture Soundtrack$/gi, '') // - Original Motion Picture Soundtrack
    .replace(/\s*-\s*(Theme From|Music From)\s+["'][^"']+["']/gi, '') // - Theme From "Show"

    // Version types with dash
    .replace(/\s*-\s*\w+\s+Remastered(\s+\d{4})?$/gi, '')   // - Buddha Remastered 2001, - Columbia Remastered 2009
    .replace(/\s*-\s*Remastered(\s+\d{4})?$/gi, '')         // - Remastered, - Remastered 2009
    .replace(/\s*-\s*Live(\s+at\s+[^-]+)?$/gi, '')          // - Live, - Live at Venue
    .replace(/\s*-\s*(Radio|Album|Single)\s+(Edit|Version)$/gi, '') // - Radio Edit, - Album Version
    .replace(/\s*-\s*Explicit(\s+Version)?$/gi, '')     // - Explicit, - Explicit Version
    .replace(/\s*-\s*Deluxe\s+Edition$/gi, '')          // - Deluxe Edition
    .replace(/\s*-\s*\d+th\s+Anniversary\s+Edition$/gi, '') // - 10th Anniversary Edition
    .replace(/\s*-\s*Acoustic(\s+Version)?$/gi, '')     // - Acoustic, - Acoustic Version
    .replace(/\s*-\s*Extended(\s+Mix)?$/gi, '')         // - Extended, - Extended Mix
    .replace(/\s*-\s*Instrumental$/gi, '')              // - Instrumental
    .replace(/\s*-\s*Bonus\s+Track$/gi, '')             // - Bonus Track

    .trim();
}
