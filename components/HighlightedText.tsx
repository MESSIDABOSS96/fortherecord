interface HighlightedTextProps {
  text: string;
  searchQuery: string;
}

export default function HighlightedText({ text, searchQuery }: HighlightedTextProps) {
  // Early return if no query
  if (!searchQuery.trim()) return <>{text}</>;

  // Escape special regex characters
  const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Try phrase match first
  const phraseRegex = new RegExp(`(${escapedQuery})`, 'gi');
  const phraseMatches = text.match(phraseRegex);

  // If phrase found, use it; otherwise split into words
  let regex = phraseRegex;
  if (!phraseMatches || phraseMatches.length === 0) {
    const words = searchQuery.trim().split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return <>{text}</>;

    const escapedWords = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    regex = new RegExp(`(${escapedWords.join('|')})`, 'gi');
  }

  // Split text and highlight matches
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        // Odd indices are matches (due to capturing group in regex)
        if (index % 2 === 1) {
          return (
            <mark
              key={index}
              className="bg-yellow-200/60 rounded-sm px-0.5"
            >
              {part}
            </mark>
          );
        }
        return part;
      })}
    </>
  );
}
