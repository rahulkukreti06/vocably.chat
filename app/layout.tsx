// app/layout.tsx

import '../styles/globals.css';
import '../styles/components.css';
import '../styles/vocably.css';
import '../styles/header.css';
import '../styles/responsive.css';
// import '@livekit/components-styles';
// Removed LiveKit styles. Jitsi UI will be styled separately if needed.
// import '@livekit/components-styles/prefabs';
// import '../styles/livekit-chat-fix.css';
import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import { Providers } from './providers';
import Script from 'next/script';

export const metadata: Metadata = {
  title: {
    default: 'Vocably – Talk, Learn & Connect Globally by Voice & Video Chat',
    template: '%s | Vocably',
  },
  description:
    'Vocably is a free real-time voice and video chat app for learning new languages, practicing new languages, and making friends with people around the world. Join public or private rooms, talk to strangers, and grow your speaking skills in a safe, global community.',
  keywords: [
    'language learning',
    'voice chat',
    'practice English',
    'make friends',
    'talk to strangers',
    'global community',
    'learn languages',
    'public rooms',
    'private rooms',
    'Vocably',
  ],
  alternates: {
    canonical: 'https://vocably.chat/',
  },
  twitter: {
    creator: '@vocably_app',
    site: '@vocably_app',
    card: 'summary_large_image',
    title: 'Vocably | Voice Chat for Language Learning & Making Friends',
    description:
      'Join Vocably to practice English, learn new languages, and make friends worldwide in real-time voice chat rooms. Safe, free, and easy to use.',
    images: [
      '/favicon.png',
    ],
  },
  openGraph: {
    url: 'https://vocably.chat',
    title: 'Vocably | Voice Chat for Language Learning & Making Friends',
    description:
      'Vocably lets you join or create voice chat rooms to practice languages, meet new people, and make friends globally.',
    images: [
      {
        url: '/favicon.png',
        width: 512,
        height: 512,
        type: 'image/png',
      },
    ],
    siteName: 'Vocably',
  },
  icons: {
    icon: {
      rel: 'icon',
      url: '/favicon.png',
    },
    apple: [
      {
        rel: 'apple-touch-icon',
        url: '/images/vocably-touch-icon.png',
        sizes: '180x180',
      },
      {
        rel: 'mask-icon',
        url: '/images/vocably-mask-icon.svg',
        color: '#0f0f0f',
      },
    ],
  },
  metadataBase: new URL('https://vocably.chat'),
};

export const viewport: Viewport = {
  themeColor: '#0f0f0f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

// Google Analytics 4 Measurement ID
const GA_MEASUREMENT_ID = 'G-MM47J30M5G';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, shrink-to-fit=no, viewport-fit=cover' />
        <link rel="canonical" href="https://vocably.chat/" />
        <meta name="keywords" content="language learning, voice chat, practice English, make friends, talk to strangers, global community, learn languages, public rooms, private rooms, Vocably" />
  {/* Jitsi perf hints */}
  <link rel="dns-prefetch" href="https://api.vocably.chat" />
  <link rel="preconnect" href="https://api.vocably.chat" crossOrigin="anonymous" />
  <link rel="preload" as="script" href="https://api.vocably.chat/external_api.js" />
        
        {/* Google Analytics 4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-MM47J30M5G"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-MM47J30M5G');
            `
          }}
        />
        
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{
          \"@context\": \"https://schema.org\",
          \"@type\": \"WebSite\",
          \"name\": \"Vocably\",
          \"url\": \"https://vocably.chat/",
          \"description\": \"Create or join topic-based voice and video chat rooms. Talk with people worldwide about anything from learning languages to fun conversations.\"
        }` }} />
      </head>
      <body>
        <Providers>
          {/* Move header above main so it is sticky/fixed at the top */}
          <div id="header-portal" />
          {/* Removed 'container mx-auto' to avoid forced centering/padding on every route; each page can manage its own width */}
          {/* Removed global paddingTop so full-screen pages (e.g., /rooms pre-join & Jitsi) are flush with header; individual pages add their own offset */}
          <main className="relative min-h-screen main-content w-full">
            {children}
          </main>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
