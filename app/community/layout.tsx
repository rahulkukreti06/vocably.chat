import React from 'react';

const title = 'Vocably Community — Discussions, Rooms, and Posts';
const description = 'Join the Vocably Community to discover topics, create posts, and join voice & video rooms. Share ideas, ask questions, and connect with people around the world.';
const siteUrl = 'https://vocably.chat/community';
const image = 'https://vocably.chat/favicon.png';

export const metadata = {
  title,
  description,
  alternates: { canonical: siteUrl },
  openGraph: {
    title,
    description,
    url: siteUrl,
    images: [image],
    siteName: 'Vocably',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@vocably',
    creator: '@vocably',
    title,
    description,
    images: [image],
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.png' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: title,
  description,
  url: siteUrl,
  publisher: {
    '@type': 'Organization',
    name: 'Vocably',
    url: 'https://vocably.chat',
    logo: { '@type': 'ImageObject', url: image },
  },
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
