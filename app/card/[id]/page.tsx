import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { cleanSongTitle } from '@/utils/cleanSongTitle';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getRecord(id: string) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ygpnkvwretilfrmeirtp.supabase.co';
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlncG5rdndyZXRpbGZybWVpcnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4OTgzNTUsImV4cCI6MjA4MjQ3NDM1NX0.Cqc7J68bQotQ1lQa61_PKc7thX_QUrQz7ahkAILxOOM';

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from('records')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const record = await getRecord(id);

  if (!record) {
    return {
      title: 'Record Not Found - For the Record',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://fortherecord.vercel.app';
  const title = `${cleanSongTitle(record.song_title)} by ${record.artist} — For ${record.for_name}`;
  const description = record.lyric_excerpt?.substring(0, 140) || record.reflection_text?.substring(0, 140) || `${cleanSongTitle(record.song_title)} by ${record.artist}`;
  const logoUrl = `${siteUrl}/logo.webp`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: logoUrl,
          width: 1200,
          height: 630,
          alt: 'For the Record',
        },
      ],
      url: `${siteUrl}/card/${id}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [logoUrl],
    },
  };
}

export default async function CardPage({ params }: PageProps) {
  const { id } = await params;
  // Redirect to home page with card query param to maintain existing behavior
  redirect(`/?card=${id}`);
}

