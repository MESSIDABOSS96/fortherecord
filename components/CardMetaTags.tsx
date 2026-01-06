"use client";

import { useEffect } from "react";
import { Record } from "@/types/record";
import { cleanSongTitle } from "@/utils/cleanSongTitle";

interface CardMetaTagsProps {
  record: Record | null;
}

export default function CardMetaTags({ record }: CardMetaTagsProps) {
  useEffect(() => {
    if (!record) {
      // Reset to default meta tags
      updateMetaTag("og:title", "For the Record");
      updateMetaTag("og:description", "Anonymous collection of songs, lyrics, and reflections");
      updateMetaTag("og:image", "");
      updateMetaTag("og:url", window.location.origin);
      updateMetaTag("twitter:card", "summary");
      return;
    }

    const shareUrl = `${window.location.origin}?card=${record.id}`;
    const title = `${cleanSongTitle(record.song_title)} by ${record.artist} - For ${record.for_name}`;
    const description = record.reflection_text?.substring(0, 200) || `${cleanSongTitle(record.song_title)} by ${record.artist}`;
    // Use card image endpoint for preview (the card as it appears in grid)
    const image = `${window.location.origin}/api/card-image/${record.id}`;

    // Update or create meta tags
    updateMetaTag("og:title", title);
    updateMetaTag("og:description", description);
    updateMetaTag("og:image", image);
    updateMetaTag("og:url", shareUrl);
    updateMetaTag("og:type", "website");
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", title);
    updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", image);
  }, [record]);

  const updateMetaTag = (property: string, content: string) => {
    // Remove 'og:' or 'twitter:' prefix for attribute name
    const attribute = property.startsWith("og:") ? "property" : "name";
    const name = property.replace(/^(og:|twitter:)/, "");

    // Find existing meta tag
    let meta = document.querySelector(`meta[${attribute}="${property}"]`);
    
    if (!meta) {
      // Create new meta tag if it doesn't exist
      meta = document.createElement("meta");
      meta.setAttribute(attribute, property);
      document.head.appendChild(meta);
    }
    
    meta.setAttribute("content", content);
  };

  return null;
}

