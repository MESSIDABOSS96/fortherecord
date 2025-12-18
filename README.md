# For the Record

An anonymous collection of songs, lyrics, and the stories behind why they remind us of the people in our lives.

## Getting Started

The development server is already running! Visit **http://localhost:3000** to see the app.

If you need to restart the server:

```bash
npm run dev
```

## Features Implemented

### ✅ Home Page
- Masonry grid layout (responsive: 4 cols desktop → 2-3 tablet → 1 mobile)
- Header navigation with logo and links
- Centered "FOR THE RECORD" title with search bar placeholder
- Record count display
- Fixed "Add" button (top-right)
- 10 seed records with varying content lengths

### ✅ Card System
- Colorful card backgrounds (purple, blue, red, gray, orange)
- Album art thumbnails with fallback placeholder
- Song title and artist display
- Lyric excerpt in large, bold typography
- "FOR ____" dedication label

### ✅ Expanded Modal View
- Click any card to open expanded modal
- Blurred background overlay
- Split layout: song info + lyrics (left) | reflection (right)
- Close button and ESC key support
- Posted date display
- Body scroll lock when open

### ✅ Add Record Flow
- Multi-step modal (3 steps)
- Step 1: Song selection (title, artist, optional album art)
- Step 2: Lyric excerpt
- Step 3: Reflection + person name + color picker
- Progress indicator
- Form validation
- New records appear immediately in grid

### ✅ Additional Pages
- `/playlist` - Monthly playlist shell with Spotify embed placeholder
- `/about` - About page with project description
- `/archive` - Archive page placeholder

## Project Structure

```
/app
  layout.tsx          # Root layout
  page.tsx            # Home page with state management
  globals.css         # Design tokens + Tailwind
  /archive
  /playlist
  /about

/components
  HeaderNav.tsx       # Top navigation
  RecordCard.tsx      # Grid card preview
  RecordModal.tsx     # Expanded card view
  AddRecordModal.tsx  # Multi-step add flow
  MasonryGrid.tsx     # Responsive grid

/types
  record.ts           # Record interface

/data
  seedRecords.ts      # 10 sample records
```

## Design Tokens

Design tokens are defined in `app/globals.css` as CSS variables:

- **Colors**: Page background, text, borders, card colors
- **Spacing**: xs, sm, md, lg, xl, 2xl, 3xl
- **Border Radius**: sm, md, lg, xl, 2xl
- **Shadows**: sm, md, lg

To change colors, fonts, or spacing, update the CSS variables in `globals.css`.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React 18**

## Data Management (Current MVP)

Records are stored in client-side state. New records persist only during the current session.

For production, you'll want to:
- Add a database (Supabase, Firebase, MongoDB)
- Implement API routes
- Add persistence layer

## Next Steps / Future Enhancements

- Real Spotify API integration for song search
- Lyric selection interface (highlight specific lines)
- Search functionality
- Archive filtering/sorting
- Monthly playlist generation
- Database integration
- Image uploads for album art
- Mobile responsive refinements

## Notes

- Album art URLs currently use placeholder paths (`/album-art/*.jpg`)
- Search bar is non-functional (placeholder)
- Spotify embed is a visual placeholder
- All data is client-side only (no backend yet)

---

Built with Next.js + TypeScript + Tailwind CSS
