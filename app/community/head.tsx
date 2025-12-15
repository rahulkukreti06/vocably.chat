export default function Head() {
  const title = 'Vocably Community — Discussions, Rooms, and Posts';
  const description = 'Join the Vocably Community to discover topics, create posts, and join voice & video rooms. Share ideas, ask questions, and connect with people around the world.';
  const siteUrl = 'https://vocably.chat/community';
  const image = 'https://vocably.chat/favicon.png';
  const logo = 'https://vocably.chat/favicon.png';
  const keywords = 'Vocably, community, voice chat, video chat, rooms, posts, discussions, topic-based chat';

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
      logo: { '@type': 'ImageObject', url: logo }
    }
  };

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={siteUrl} />

      {/* Open Graph */}
      <meta property="og:locale" content="en_US" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Vocably" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content="@vocably" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Mobile / misc */}
      <meta name="theme-color" content="#000000" />
      <link rel="icon" href="/favicon.png" />

      {/* Structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
