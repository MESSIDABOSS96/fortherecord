import { useState } from 'react';

interface SongData {
  song_title: string;
  artist: string;
  album_art_url: string;
  spotify_track_id: string;
  background_color: string;
}

export function useAddRecordState() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [songData, setSongData] = useState<SongData | null>(null);
  const [selectedLines, setSelectedLines] = useState<string[]>([]);
  const [forName, setForName] = useState('');
  const [reflectionText, setReflectionText] = useState('');

  return {
    step,
    songData,
    selectedLines,
    forName,
    reflectionText,
    setStep,
    setSongData,
    setSelectedLines,
    setForName,
    setReflectionText,
  };
}
