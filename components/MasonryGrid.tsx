"use client";

import { Record } from "@/types/record";
import RecordCard from "./RecordCard";
import Masonry from "react-masonry-css";

interface MasonryGridProps {
  records: Record[];
  onCardClick: (record: Record) => void;
  onCardLongPress?: (record: Record) => void;
}

export default function MasonryGrid({ records, onCardClick, onCardLongPress }: MasonryGridProps) {
  // Responsive breakpoint configuration
  // Matches Tailwind's default breakpoints for consistency
  const breakpointColumns = {
    default: 4,  // Desktop: 4 columns (xl)
    1280: 4,     // xl breakpoint
    1024: 3,     // Tablet: 3 columns (lg)
    768: 2,      // md: 2 columns
    640: 1,      // Mobile: 1 column (sm)
  };

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="masonry-grid"
      columnClassName="masonry-grid-column"
    >
      {records.map((record) => (
        <RecordCard
          key={record.id}
          record={record}
          onClick={() => onCardClick(record)}
          onLongPress={onCardLongPress ? () => onCardLongPress(record) : undefined}
        />
      ))}
    </Masonry>
  );
}
