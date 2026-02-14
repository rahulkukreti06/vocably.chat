import ChatClient from '../../components/ChatClient';

export const metadata = {
  title: 'Vocably Chat — Live voice & text conversations',
  description: 'Join live voice and text conversations on Vocably. Find rooms, participate in discussions, and connect with people who share your interests.',
  openGraph: {
    title: 'Vocably Chat — Live voice & text conversations',
    description: 'Join live voice & text conversations on Vocably. Find rooms, participate in discussions, and connect with people who share your interests.',
    url: 'https://vocably.chat/chat',
    siteName: 'Vocably',
    type: 'website'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true
    }
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Vocably Chat",
  "url": "https://vocably.chat/chat",
  "description": "Join live voice & text conversations on Vocably. Find rooms, participate in discussions, and connect with people who share your interests.",
  "publisher": {
    "@type": "Organization",
    "name": "Vocably",
    "url": "https://vocably.chat"
  }
};

export default function ChatPage() {
  return (
    <main style={{ padding: '1.2rem', maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.6rem', marginBottom: 8 }}>Vocably Chat</h1>
      <p style={{ color: '#9ca3af', marginBottom: 12 }}>
        Join live voice and text conversations on Vocably. Browse rooms by topic, listen in, or join the conversation. Vocably Chat helps you connect with people around shared interests through short-form voice rooms and threaded text discussions.
      </p>

      <div style={{ marginBottom: 18 }}>
        <a href="/" style={{ marginRight: 12 }}>Home</a>
        <a href="/community">Community</a>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Client-side chat UI mounts here */}
      <ChatClient />
    </main>
  );
}
