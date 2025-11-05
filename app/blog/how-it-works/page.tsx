import React from 'react';
import BlogHeader from '../../../components/BlogHeader';
import Link from 'next/link';

export const metadata = {
  title: 'How Vocably Works — Vocably',
  description: 'How Vocably works: clear steps for joining, hosting, scheduling, and staying safe in voice rooms.',
  keywords: ['voice chat', 'how it works', 'hosting rooms', 'schedule rooms', 'Vocably', 'moderation', 'privacy'],
  authors: [{ name: 'Rahul Kukreti', url: 'https://vocably.chat' }],
  alternates: { canonical: 'https://vocably.chat/blog/how-it-works' },
  openGraph: {
    title: 'How Vocably Works — Vocably',
    description: 'How Vocably works: clear steps for joining, hosting, scheduling, and staying safe in voice rooms.',
    url: 'https://vocably.chat/blog/how-it-works',
    type: 'article',
    siteName: 'Vocably',
    locale: 'en_US',
    images: [
      { url: 'https://vocably.chat/Schedule-room-img.png', width: 1200, height: 628, alt: 'Schedule rooms on Vocably' },
      { url: 'https://vocably.chat/Room-sharing.jpg', width: 1200, height: 628, alt: 'Share a room on Vocably' }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How Vocably Works — Vocably',
    description: 'Clear, practical steps for joining, hosting, and scheduling rooms on Vocably.',
    creator: '@vocably',
    images: ['https://vocably.chat/favicon.png']
  }
};

export default function HowItWorksPage() {
  return (
    <div style={{ background: '#E8D4D0', minHeight: '100vh', color: '#e6eef8' }}>
      <BlogHeader />
      <main style={{ padding: '40px 20px' }}>
        <style>{`
          .post-content h3 { font-size: 20px; }
          .post-content p { font-size: 16px; }

          /* desktop: modest title */
          .post-title { font-size: 42px; font-weight: 900; color: #071025; text-align: center; margin-top: 0; }

          @media (max-width: 580px) {
            .post-content h3 { font-size: 24px !important; }
            .post-content p { font-size: 18px !important; }
            /* increase title only on small screens */
            .post-title { font-size: 30px !important; }
          }
        `}</style>

        <h1 className="post-title">How Vocably Works</h1>

        <p style={{ textAlign: 'center', color: '#424b56ff', marginTop: 8 }}>Nov 3, 2025 · Written by Rahul Kukreti</p>
        <p className="post-subtitle" style={{ textAlign: 'center', color: '#6b586aff', maxWidth: 820, margin: '8px auto 0' }}>
          A practical, numbered guide that walks you through every action: signing up, discovering rooms, joining safely, participating with confidence, hosting clean sessions, scheduling, and using privacy & moderation tools.
        </p>

        {/* Article structured data for search engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://vocably.chat/blog/how-it-works"
            },
            "headline": "How Vocably Works — Step-by-Step: Joining, Participating, and Hosting Rooms",
            "description": "A step-by-step, practical guide describing how to sign up, discover rooms, join, host, schedule, and keep conversations safe on Vocably.",
            "image": ["https://vocably.chat/favicon.png", "https://vocably.chat/Room-sharing.jpg"],
            "keywords": "voice chat, hosting, scheduling, moderation, privacy",
            "articleSection": "How-To / Guides",
            "author": { "@type": "Person", "name": "Rahul Kukreti", "url": "https://vocably.chat" },
            "publisher": { "@type": "Organization", "name": "Vocably", "logo": { "@type": "ImageObject", "url": "https://vocably.chat/favicon.png" } },
            "datePublished": "2025-11-03T00:00:00Z",
            "dateModified": "2025-11-03T00:00:00Z"
          }) }}
        />

        {/* Breadcrumb structured data for better search results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://vocably.chat/" },
              { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://vocably.chat/blog" },
              { "@type": "ListItem", "position": 3, "name": "How It Works", "item": "https://vocably.chat/blog/how-it-works" }
            ]
          }) }}
        />

  <div className="post-content" style={{ maxWidth: 980, margin: '28px auto 0', display: 'flex', flexDirection: 'column', gap: 22 }}>

          <article>
            <p style={{ color: '#0b1220', lineHeight: 1.8, maxWidth: 'none' }}>
              Below is a clear, numbered walkthrough of how to use Vocably. Each step includes practical actions and small tips so you can join, participate, host, and manage sessions with confidence.
            </p>

            <h3 style={{ marginTop: 18, color: '#071025' }}>Step 1 — Create an account quickly</h3>
            <p style={{ color: '#0b1220', lineHeight: 1.8 }}>
              Getting started on Vocably is super easy just sign up using your Google account. Make sure you use an email you check often, so you don’t miss out on updates or reminders for scheduled rooms.
            </p>

            <p style={{ color: '#0b1220', lineHeight: 1.8 }}>Once you're in, Vocably will ask for microphone access. This is required to join voice or video conversations, so go ahead and allow it. Not sure if your mic is working? You can quickly test it in your device settings before joining your first room. That way, you’ll be ready to jump right into the conversation without any hiccups.</p>

            <h3 style={{ marginTop: 18, color: '#071025' }}>Step 2 — Browse and filter rooms</h3>
            <p style={{ color: '#0b1220', lineHeight: 1.8 }}>
              Once you're signed in, it’s time to dive into the heart of Vocably the rooms. Rooms are organized by topic, language, and activity type, so you can easily find exactly what you're looking for. Whether you're practicing English, joining a debate, or just chilling in a casual chat, filters are your best friend.
            </p>

            <p style={{ color: '#0b1220', lineHeight: 1.8 }}>
             Use them to zero in on rooms that match your vibe like beginner friendly spaces, serious discussions, or fun hangouts. Look out for helpful tags like “Beginner”, "Intermediate", or “Advance”. You’ll also see how many people are already in the room. Smaller rooms are perfect if you want more chances to speak, while bigger rooms work great for listening, learning, or panel-style chats.
            </p>

            <h3 style={{ marginTop: 18, color: '#071025' }}>Step 3 — Join safely: listen first</h3>
            <p style={{ color: '#0b1220', lineHeight: 1.8 }}>
              When you enter a room on Vocably, it’s a good idea to start by staying on mute and just listening for a bit. This helps you understand the room’s style how fast people are talking, how they take turns, and what the overall mood is like.
            </p>
            <p style={{ color: '#0b1220', lineHeight: 1.8 }}>
              Some rooms might use tools like hand-raise or speaking queues. In that case, just follow the flow. If it’s a more open, free form conversation, wait for a natural pause before jumping in. When you're ready to speak, unmute and introduce yourself briefly it’s a simple way to join the conversation smoothly and respectfully.
            </p>

            <h3 style={{ marginTop: 18, color: '#071025' }}>Step 4 — Basic in-room controls</h3>
            <div style={{ color: '#0b1220', lineHeight: 1.8 }}>
              <p>Once you're comfortably inside a room, take a moment to get familiar with the basic controls they help you enjoy the experience your way.</p>
              <ul style={{ marginTop: 8, paddingLeft: 18, fontSize: '14px', color: '#0b1220' }}>
                <li><strong>Mute / Unmute</strong>: toggle your mic when you want to speak or when you want to listen quietly.</li>
                <li><strong>Pin & volume</strong>: pin a speaker to keep them visible, and adjust volume to a comfortable level.</li>
                <li><strong>Mobile tip</strong>: use a headset or earphones for clearer audio and less background noise.</li>
                <li><strong>Report or leave</strong>: if someone is disruptive, use the report button or leave and join another room.</li>
              </ul>
            </div>

            <h3 style={{ marginTop: 18, color: '#071025' }}>Step 5 — Host Your Own Room: Set Up and Lead with Clarity</h3>
            <p style={{ color: '#0b1220', lineHeight: 1.8 }}>
              Ready to start your own conversation? Hosting a room on Vocably is quick and straightforward. Start by choosing a clear, catchy title and writing a short one line description so people immediately know what the session is about.
            </p>

            <p style={{ color: '#0b1220', lineHeight: 1.8 }}>
              Next, customize your room settings:
            </p>

            <ul style={{ marginTop: 8, paddingLeft: 18, lineHeight: 1.6, fontSize: '14px', color: '#0b1220' }}>
              <li><strong>Public or Private?</strong> Decide whether you want anyone to join, or just a select group.</li>
              <li><strong>Participant Limit</strong> Set a maximum number of attendees smaller groups are great for deeper discussions, while larger rooms can attract diverse opinions.</li>
              <li><strong>Tags & Language</strong> Add the right topic and language tags so your room is easier to find.</li>
            </ul>

            <h3 style={{ marginTop: 18, color: '#071025' }}>Step 6 — Schedule Your Room and Keep Everyone in the Loop</h3>
            <p style={{ color: '#0b1220', lineHeight: 1.8 }}>
              Want to host a focused, well-attended conversation? Scheduling a room in advance is the way to go. Scheduled rooms appear in the discovery section, giving people time to notice, plan, and actually show up no more random drop ins or empty rooms.
            </p>

            <p style={{ color: '#0b1220', lineHeight: 1.8 }}>
              When creating a scheduled session:
            </p>

            <ul style={{ marginTop: 8, paddingLeft: 18, lineHeight: 1.6, fontSize: '14px', color: '#0b1220' }}>
              <li><strong>Set the right start time</strong>: Make sure it matches your own time zone and gives others a chance to join.</li>
              <li><strong>Choose a realistic duration</strong>: Whether it’s a 30-minute chat or a 2-hour deep dive, set expectations early.</li>
              <li><strong>Enable reminders</strong>: Turn on notifications so interested members get a heads-up before the room starts.</li>
            </ul>

            <p style={{ color: '#0b1220', lineHeight: 1.8 }}>
              By scheduling your rooms, you attract more engaged listeners and create a smoother, more prepared environment for everyone involved.
            </p>

            <h3 style={{ marginTop: 18, color: '#071025' }}>Step 7 — Privacy, invite links, and expiry</h3>
            <p style={{ color: '#0b1220', lineHeight: 1.8 }}>
              Sometimes, you want a room that feels more exclusive whether it's for a small practice group, a class session, or a private discussion. With Vocably, you can easily make a room private and share access through a unique invite link. This way, only the people you choose can join. You can also set an expiry time for the room, so it doesn't stay open after you're done. If you’re running recurring sessions, it’s a good idea to share the invite through a calendar event or private message. That makes it easy for people to join on time and understand what’s expected, whether it’s behavior rules, language level, or just a simple reminder of the start time. Keeping things organized helps everyone feel comfortable and stay focused.
            </p>

            <h3 style={{ marginTop: 18, color: '#071025' }}>Step 8 — Moderation and safety</h3>
            <p style={{ color: '#0b1220', lineHeight: 1.8 }}>
              A great conversation depends on a safe and respectful environment, and Vocably gives hosts the tools to make that happen. As a host, you can mute or remove anyone who’s being disruptive, and you can assign co-hosts to help you manage the flow especially in larger or more active rooms. If you're a participant and notice any abusive or inappropriate behavior, don’t just ignore it report it. Reporting helps keep the community healthy and shows that bad behavior isn’t tolerated. And if you're hosting a recurring room and keep running into the same issues, you might want to switch it to invite-only or add stricter entry controls. A little moderation goes a long way in creating a space where everyone feels welcome and heard.
            </p>

            <h3 style={{ marginTop: 18, color: '#071025' }}>Step 9 — Improve audio and sharing</h3>
            <p style={{ color: '#0b1220', lineHeight: 1.8 }}>
              For the best experience, use a headset with a microphone, enable noise suppression if available, and test audio before speaking. If you’re sharing slides or media, use screen-share or synced media features so everyone can follow along. Label your media clearly in the room description so attendees know when to expect visual content.
            </p>

            <h3 style={{ marginTop: 18, color: '#071025' }}>Step 10 — Extras and integrations</h3>
            <p style={{ color: '#0b1220', lineHeight: 1.8 }}>
              Vocably supports extras like synced YouTube, screen share, and basic recording options (when enabled). Use these sparingly: add a short clip or slide to illustrate a point, then return to conversation. For language practice, drop links in chat after sessions for resources and corrections.
            </p>

            <h3 style={{ marginTop: 18, color: '#071025' }}>Step 11 — What to do next</h3>
            <p style={{ color: '#0b1220', lineHeight: 1.8 }}>
              Start with a scheduled small room to get comfortable, then try a public live room once you feel ready. If you plan to host regularly, make a short checklist (agenda, co-host, participant limit, scheduled time) and reuse it each session.
            </p>

            <div style={{ marginTop: 24 }}>
              <Link href="/" style={{ padding: '10px 14px', background: '#10b981', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 700 }}>Try Vocably</Link>
            </div>
          </article>

        </div>

        <footer style={{ maxWidth: 980, margin: '28px auto 0', padding: '24px 8px', borderTop: '1px solid rgba(7,16,37,0.06)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ color: '#071025', fontWeight: 700 }}>Thanks for reading</div>
            <div style={{ color: '#0b1220' }}>If you enjoyed this guide, explore more posts on the <Link href="/blog">blog</Link> or <Link href="/">get in touch</Link>.</div>
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
