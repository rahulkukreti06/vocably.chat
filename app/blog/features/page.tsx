import React from 'react';
import BlogHeader from '../../../components/BlogHeader';
import Link from 'next/link';

export const metadata = {
  title: 'Vocably — Features for Better Voice & Video Conversations',
  description: 'Explore Vocably features — topic-based voice & video rooms, scheduled events, screen sharing, noise suppression, and more to make real-time conversations meaningful.',
  keywords: [
    'vocably',
    'voice chat',
    'video chat',
    'topic-based rooms',
    'screen sharing',
    'noise suppression',
    'watch together',
    'room sharing',
    'schedule rooms',
    'social audio'
  ],
  authors: [{ name: 'Rahul Kukreti', url: 'https://vocably.chat' }],
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Vocably Features — Real Voice & Video Conversations',
    description: 'Discover the features that make Vocably a better place for authentic voice and video conversations: topic-based rooms, scheduling, sharing, moderation, and more.',
    url: 'https://vocably.chat/blog/features',
    siteName: 'Vocably',
    images: [
      {
        url: 'https://vocably.chat/favicon.png',
        width: 1200,
        height: 630,
        alt: 'Vocably favicon'
      }
    ],
    type: 'article'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vocably Features — Real Voice & Video Conversations',
    description: 'Discover features like topic-based rooms, schedule rooms, screen sharing, and enhanced moderation on Vocably.',
  images: ['https://vocably.chat/favicon.png']
  },
  alternates: {
    canonical: 'https://vocably.chat/blog/features'
  }
};

export default function FeaturesPage() {
  return (
    <div style={{ background: '#e7e7fd', minHeight: '100vh', color: '#e6eef8' }}>
      <BlogHeader />
      <main style={{ padding: '40px 20px' }}>
        <style>{`
          .post-content h2 { font-size: 20px; }
          .post-content h3 { font-size: 18px; }
          .post-content p { font-size: 16px; }

          /* desktop: modest title */
          .post-title { font-size: 42px; font-weight: 900; color: #071025; text-align: center; margin-top: 0; }

          @media (max-width: 580px) {
            .post-content h2 { font-size: 24px !important; }
            .post-content h3 { font-size: 20px !important; }
            .post-content p { font-size: 18px !important; }
            /* increase title only on small screens */
            .post-title { font-size: 30px !important; }
          }
        `}</style>

        <h1 className="post-title">Vocably Features</h1><br></br>

        <p style={{ textAlign: 'center', color: '#424b56ff', marginTop: 8 }}>Oct 30, 2025 · Written by Rahul Kukreti</p>
        <p className="post-subtitle" style={{ textAlign: 'center', color: '#6b586aff', maxWidth: 820, margin: '8px auto 0' }}>
          Let’s explore what makes Vocably truly different the features that turn simple chat rooms into powerful spaces for authentic conversations.
        </p>

        {/* Article structured data for search engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://vocably.chat/blog/features"
            },
            "headline": "Vocably Features — Explore the Power of Real Conversations",
            "description": "Vocably is built for one simple goal — to bring back the joy of real voice conversations. Learn about the product features that make real-time voice chat simple and meaningful.",
            "keywords": "vocably, voice chat, video chat, topic-based rooms, screen sharing, noise suppression, schedule rooms, social audio",
            "articleSection": "Features",
            "image": ["https://vocably.chat/favicon.png"],
            "author": { "@type": "Person", "name": "Rahul Kukreti", "url": "https://vocably.chat" },
            "publisher": { "@type": "Organization", "name": "Vocably", "logo": { "@type": "ImageObject", "url": "https://vocably.chat/favicon.png" } },
            "datePublished": "2025-10-30T00:00:00Z",
            "dateModified": "2025-10-30T00:00:00Z"
          }) }}
        />
        <div className="post-content" style={{ maxWidth: 980, margin: '28px auto 0', display: 'flex', flexDirection: 'column', gap: 22 }}>  


          <div style={{ padding: '8px 0' }}>
            <h2 style={{ marginTop: 12, marginBottom: 8, color: '#071025', fontWeight: 800 }}>1. Topic-Based Voice &amp; Video Chat Rooms</h2>
            <a href="/Screenshot%202025-10-28%20175944.png" target="_blank" rel="noopener noreferrer" style={{ display: 'block', margin: '12px auto', textAlign: 'center' }}>
              <img src="/Screenshot%202025-10-28%20175944.png" alt="Vocably screenshot" style={{ width: '100%', maxWidth: 560, borderRadius: 8, display: 'block', margin: '0 auto' }} />
            </a><br></br>
            <p style={{ margin: 0, color: '#0b1220' }}>
              At the heart of Vocably are topic based rooms that group people around shared interests, from movies and music to study sessions and deep conversations. Instead of random matching, you join spaces where the topic itself sparks meaningful exchanges. Rooms can be voice or video, and creators can add context, tags, and short descriptions to help people discover the right conversations. The result is richer, more relevant interactions that feel like real-life meetups rather than fleeting chats.
            </p>
          </div>

          <div style={{ padding: '8px 0' }}>
            <h2 style={{ marginTop: 12, marginBottom: 8, color: '#071025', fontWeight: 800 }}>2. Auto-Expiry Rooms — Conversations That Stay Fresh</h2>
            <a href="/Auto-expire-room.png" target="_blank" rel="noopener noreferrer" style={{ display: 'block', margin: '12px auto', textAlign: 'center' }}>
              <img src="/Auto-expire-room.png" alt="Auto expire rooms" style={{ width: '100%', maxWidth: 560, borderRadius: 8, display: 'block', margin: '0 auto' }} loading="lazy" />
            </a><br></br>
            <p style={{ margin: 0, color: '#0b1220' }}>
              Vocably keeps conversations lively with auto expiry options: creators choose how long a room should stay active, whether it’s an hour, a few hours, or a full day. When time runs out the room gracefully removes itself from the public feed, ensuring the platform is always full of fresh, relevant discussions. This short-lived nature encourages quick, natural conversations, keeps things clean, and makes users feel that chats are fresh and relevant instead of lasting forever
            </p>
          </div>

          <div style={{ padding: '8px 0' }}>
            <h2 style={{ marginTop: 12, marginBottom: 8, color: '#071025', fontWeight: 800 }}>3. Schedule Rooms for Later</h2>
            <a href="/Schedule-room-img.png" target="_blank" rel="noopener noreferrer" style={{ display: 'block', margin: '12px auto', textAlign: 'center' }}>
              <img src="/Schedule-room-img.png" alt="Schedule rooms" style={{ width: '100%', maxWidth: 560, borderRadius: 8, display: 'block', margin: '0 auto' }} loading="lazy" />
            </a><br></br>
            <p style={{ margin: 0, color: '#0b1220' }}>
              Some conversations deserve planning, so Vocably includes scheduling tools that let hosts create rooms ahead of time. Teachers, podcasters, and community hosts can schedule sessions, add descriptions, and set a start time so participants can plan to attend. Scheduled rooms show an “Interested” button that signals potential attendance and helps hosts gauge interest and prepare content. Reminders and calendar-style visibility help make live events predictable and well-attended.
            </p>
          </div>

          <div style={{ padding: '8px 0' }}>
            <h2 style={{ marginTop: 12, marginBottom: 8, color: '#071025', fontWeight: 800 }}>4. Public and Private Rooms</h2>
            <a href="/Public-Private-img.jpg" target="_blank" rel="noopener noreferrer" style={{ display: 'block', margin: '12px auto', textAlign: 'center' }}>
              <img src="/Public-Private-img.jpg" alt="Public and private rooms" style={{ width: '100%', maxWidth: 560, borderRadius: 8, display: 'block', margin: '0 auto' }} loading="lazy" />
            </a><br></br>
            <p style={{ margin: 0, color: '#0b1220' }}>
              Not every conversation is meant for a wide audience. Vocably gives creators a simple choice between Public and Private rooms. Public rooms are discoverable and open to anyone who wants to join the topic. Private rooms are invitation only and only accessible via a direct link, which is ideal for intimate discussions, classes, or closed groups. These options let hosts strike the right balance between discoverability and privacy for every use case.
            </p>
          </div>

          <div style={{ padding: '8px 0' }}>
            <h2 style={{ marginTop: 12, marginBottom: 8, color: '#071025', fontWeight: 800 }}>5. Set Participant Limits</h2>
            <a href="/Participant-limit-img.png" target="_blank" rel="noopener noreferrer" style={{ display: 'block', margin: '12px auto', textAlign: 'center' }}>
              <img src="/Participant-limit-img.png" alt="Participant limits" style={{ width: '100%', maxWidth: 560, borderRadius: 8, display: 'block', margin: '0 auto' }} loading="lazy" />
            </a><br></br>
            <p style={{ margin: 0, color: '#0b1220' }}>
              Control how intimate or expansive your conversation should be by setting participant limits. Hosts can choose small caps for deep, focused discussions or larger limits for broader community talks. This helps maintain quality smaller rooms encourage meaningful turn taking while larger rooms foster discovery and energetic exchanges. Limits are flexible and can be adjusted depending on the topic, moderator plan, and the host’s preferred format.
            </p>
          </div>

          <div style={{ padding: '8px 0' }}>
            <h2 style={{ marginTop: 12, marginBottom: 8, color: '#071025', fontWeight: 800 }}>6. Room Sharing Made Easy</h2>
            <a href="/Room-sharing.jpg" target="_blank" rel="noopener noreferrer" style={{ display: 'block', margin: '12px auto', textAlign: 'center' }}>
              <img src="/Room-sharing.jpg" alt="Room sharing" style={{ width: '100%', maxWidth: 560, borderRadius: 8, display: 'block', margin: '0 auto' }} loading="lazy" />
            </a><br></br>
            <p style={{ margin: 0, color: '#0b1220' }}>
              Every room has a simple, shareable link so you can invite people across platforms WhatsApp, Telegram, social posts, or direct messages. A single tap opens the room and allows invited guests to join the live voice or video conversation instantly, with no app installs or complicated onboarding. Deep links and optional privacy controls make sharing frictionless while still giving hosts control over who enters and when.
            </p>
          </div>

          <div style={{ padding: '8px 0' }}>
            <h2 style={{ marginTop: 12, marginBottom: 8, color: '#071025', fontWeight: 800 }}>7. Report and Moderate Rooms</h2>
            <a href="/Report-room-img.png" target="_blank" rel="noopener noreferrer" style={{ display: 'block', margin: '12px auto', textAlign: 'center' }}>
              <img src="/Report-room-img.png" alt="Report rooms" style={{ width: '100%', maxWidth: 560, borderRadius: 8, display: 'block', margin: '0 auto' }} loading="lazy" />
            </a><br></br>
            <p style={{ margin: 0, color: '#0b1220' }}>
              Safety is central to Vocably’s design. If a room violates guidelines or feels unsafe, users can report it quickly with built in reporting tools. Moderation workflows let our team review incidents and take action warnings, temporary removals, or permanent bans when needed. The platform also provides hosts with simple moderation controls so communities can self-manage and create respectful, welcoming spaces for everyone.
            </p>
          </div>

          <div style={{ padding: '8px 0' }}>
            <h2 style={{ marginTop: 12, marginBottom: 8, color: '#071025', fontWeight: 800 }}>8. Room Levels — Choose Your Comfort Zone</h2>
            <a href="/Room-Level-img.png" target="_blank" rel="noopener noreferrer" style={{ display: 'block', margin: '12px auto', textAlign: 'center' }}>
              <img src="/Room-Level-img.png" alt="Room levels" style={{ width: '100%', maxWidth: 560, borderRadius: 8, display: 'block', margin: '0 auto' }} loading="lazy" />
            </a><br></br>
            <p style={{ margin: 0, color: '#0b1220' }}>
              People have different comfort levels when speaking Vocably’s Room Levels (Beginner, Intermediate, Advanced) help match rooms to participants’ confidence and skill. Newcomers can find gentle, supportive rooms while experienced speakers can host advanced conversations. Levels improve guidance for hosts and participants, reduce intimidation, and make it easier to find the right conversational pace, whether you’re practicing a language or leading a specialized discussion.
            </p>
          </div>

          <div style={{ padding: '8px 0' }}>
            <h2 style={{ marginTop: 12, marginBottom: 8, color: '#071025', fontWeight: 800 }}>9. Screen Sharing</h2>
            <a href="/Share-screen-img.png" target="_blank" rel="noopener noreferrer" style={{ display: 'block', margin: '12px auto', textAlign: 'center' }}>
              <img src="/Share-screen-img.png" alt="Screen sharing" style={{ width: '100%', maxWidth: 560, borderRadius: 8, display: 'block', margin: '0 auto' }} loading="lazy" />
            </a><br></br>
            <p style={{ margin: 0, color: '#0b1220' }}>
              When visual context matters, Vocably’s screen sharing lets you present slides, demo software, or co browse with participants while you talk. It’s ideal for remote teaching, code reviews, collaborative workshops, and product demos. Screen sharing is designed to be low latency and easy to start, so hosts can smoothly switch between talking and showing, keeping the conversation engaging and informative for everyone in the room.
            </p>
          </div>

          <div style={{ padding: '8px 0' }}>
            <h2 style={{ marginTop: 12, marginBottom: 8, color: '#071025', fontWeight: 800 }}>10. Watch YouTube Together</h2>
            <a href="/Youtube-img.png" target="_blank" rel="noopener noreferrer" style={{ display: 'block', margin: '12px auto', textAlign: 'center' }}>
              <img src="/Youtube-img.png" alt="Watch YouTube together" style={{ width: '100%', maxWidth: 560, borderRadius: 8, display: 'block', margin: '0 auto' }} loading="lazy" />
            </a><br></br>
            <p style={{ margin: 0, color: '#0b1220' }}>
              Vocably supports synced YouTube playback so everyone in a room can watch the same video at the same time while chatting and reacting live. It’s great for shared reactions to trailers, learning from tutorial videos together, or building a watch party around a favorite creator. Hosts keep playback control and can pause, rewind, or queue videos so the group stays in sync and conversation flows naturally.
            </p>
          </div>

          <div style={{ padding: '8px 0' }}>
            <h2 style={{ marginTop: 12, marginBottom: 8, color: '#071025', fontWeight: 800 }}>11. Share Audio and Listen to Music Together</h2>
            <a href="/Share-audio-img.png" target="_blank" rel="noopener noreferrer" style={{ display: 'block', margin: '12px auto', textAlign: 'center' }}>
              <img src="/Share-audio-img.png" alt="Share audio" style={{ width: '100%', maxWidth: 560, borderRadius: 8, display: 'block', margin: '0 auto' }} loading="lazy" />
            </a><br></br>
            <p style={{ margin: 0, color: '#0b1220' }}>
              Share audio with the room to listen to music or curated playlists together in real time. Whether it’s a chill listening session, a live DJ-style mix, or a karaoke night, audio sharing brings people closer through music. Hosts can manage playback and volume so everyone hears the same thing, creating shared moments that feel like being in the same room even when you’re miles apart.
            </p>
          </div>

          <div style={{ padding: '8px 0' }}>
            <h2 style={{ marginTop: 12, marginBottom: 8, color: '#071025', fontWeight: 800 }}>12. Watch Movies Together</h2>
            <a href="/Watch-movies-img.png" target="_blank" rel="noopener noreferrer" style={{ display: 'block', margin: '12px auto', textAlign: 'center' }}>
              <img src="/Watch-movies-img.png" alt="Watch movies together" style={{ width: '100%', maxWidth: 560, borderRadius: 8, display: 'block', margin: '0 auto' }} loading="lazy" />
            </a><br></br>
            <p style={{ margin: 0, color: '#0b1220' }}>
              Virtual movie nights are simple: share a link, sync playback for everyone, and enjoy real time voice chat while you watch. Vocably handles synchronization so reactions and commentary stay aligned, making it perfect for friends, family, or community viewing events. Hosts can manage playback and discuss scenes together, turning passive watching into an interactive shared experience.
            </p>
          </div>

          <div style={{ padding: '8px 0' }}>
            <h2 style={{ marginTop: 12, marginBottom: 8, color: '#071025', fontWeight: 800 }}>13. Enhanced Noise Suppression</h2>
            <a href="/Extra-noise-suppression-img.png" target="_blank" rel="noopener noreferrer" style={{ display: 'block', margin: '12px auto', textAlign: 'center' }}>
              <img src="/Extra-noise-suppression-img.png" alt="Noise suppression" style={{ width: '100%', maxWidth: 560, borderRadius: 8, display: 'block', margin: '0 auto' }} loading="lazy" />
            </a><br></br>
            <p style={{ margin: 0, color: '#0b1220' }}>
              Clear communication is essential, so Vocably includes enhanced noise suppression that reduces background distractions like traffic, keyboard clicks, or room noise. This feature helps voices sound crisp and intelligible even in imperfect environments, improving the listening experience for everyone. Users can benefit from improved clarity without manual audio tweaks, and hosts can moderate audio quality more effectively during live conversations.
            </p>
          </div>

          <div style={{ padding: '8px 0' }}>
            <h2 style={{ marginTop: 12, marginBottom: 8, color: '#071025', fontWeight: 800 }}>14. Talk to Anyone, Anytime, on Any Topic</h2>
            <p style={{ margin: 0, color: '#0b1220' }}>
              The core promise of Vocably is simple: talk to real people about what genuinely interests you. The platform prioritizes human connections over trend chasing algorithms, helping you discover authentic conversations across countless topics. Whether you’re exploring a new hobby, practicing a language, or meeting people with niche interests, Vocably makes meaningful connections easy and serendipitous by focusing on people and topics rather than viral metrics.
            </p>
          </div>

          <div style={{ padding: '8px 0' }}>
            <h2 style={{ marginTop: 12, marginBottom: 8, color: '#071025', fontWeight: 800 }}> More Features on the Way</h2>
            <p style={{ margin: 0, color: '#0b1220' }}>
              This is just the beginning of the Vocably journey. We’re actively developing new tools from creator programs and community features to customization options for paying creators all aimed at making voice chat more immersive and manageable. Our roadmap includes better discovery, richer moderation tools, and ways to support creators sustainably, so conversations feel natural, valuable, and safe for every participant.
              For a complete list of planned features and our roadmap, read the About section where we publish our future plans <Link href="/blog/about" style={{ color: '#066cf2ff', textDecoration: 'underline' }}>About Vocably</Link>.
            </p>
          </div>

        </div>

        <footer style={{ maxWidth: 980, margin: '28px auto 0', padding: '24px 8px', borderTop: '1px solid rgba(7,16,37,0.06)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ color: '#071025', fontWeight: 700 }}>Thanks for reading</div>
            <div style={{ color: '#0b1220' }}>If you enjoyed this post, explore more posts on the <Link href="/blog">blog</Link> or <Link href="/">get in touch</Link>.</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <Link href="/" style={{ color: '#066cf2ff' }}>Home</Link>
              <Link href="/blog" style={{ color: '#066cf2ff' }}>Blog</Link>
              <Link href="/privacy" style={{ color: '#066cf2ff' }}>Privacy</Link>
            </div>
            <div style={{ marginTop: 12, color: '#1a1a1bff', fontSize: 13 }}>&copy; {new Date().getFullYear()} Vocably — Built with care for people who love voice chat.</div>
          </div>
        </footer>
      </main>
    </div>
  );
}
