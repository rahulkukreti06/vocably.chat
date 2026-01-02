import BlogHeader from '../../../components/BlogHeader'
import Link from 'next/link'

export const metadata = {
  title: 'Vocably Community — Blog',
  description: 'Vocably Community: A Space for Thoughtful Discussions and Shared Ideas',
  authors: [{ name: 'Vocably', url: 'https://vocably.chat' }],
  keywords: ['Vocably', 'community', 'discussion', 'asynchronous', 'text community', 'blog'],
  alternates: { canonical: 'https://vocably.chat/blog/vocably-community' },
  openGraph: {
    title: 'Vocably Community — Blog',
    description: 'Vocably Community: A Space for Thoughtful Discussions and Shared Ideas',
    url: 'https://vocably.chat/blog/vocably-community',
    images: ['https://vocably.chat/favicon.png', '/favicon.png']
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vocably Community — Blog',
    description: 'Vocably Community: A Space for Thoughtful Discussions and Shared Ideas',
    images: ['https://vocably.chat/favicon.png', '/favicon.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true
    }
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png'
  },
  themeColor: '#fbd3cc'
}

export default function VocablyCommunityPage() {
  return (
    <div style={{ background: '#fbd3cfff', minHeight: '100vh', color: '#e6eef8' }}>
      <BlogHeader />

      <main style={{ padding: '40px 20px' }}>
        <style>{`
          /* ensure headings take full width and wrap naturally */
          .post-content { width: 100%; }
          .post-content h3 { display: block; max-width: 100%; font-size: 20px; margin: 0; word-break: break-word; }
          .post-content p { font-size: 16px; }

          .post-title { font-size: 42px; font-weight: 900; color: #071025; text-align: center; margin-top: 0; }

          @media (max-width: 780px) {
            /* reduce sizes on narrow screens to avoid awkward half-line wrapping */
            .post-content h3 { font-size: 20px !important; }
            .post-content p { font-size: 15px !important; }
            .post-title { font-size: 30px !important; }
          }

          @media (max-width: 420px) {
            .post-content h3 { font-size: 18px !important; }
            .post-content p { font-size: 16px !important; }
            .post-title { font-size: 26px !important; }
          }
        `}</style>

        <h1 className="post-title">The Vocably Community</h1>

        <p style={{ textAlign: 'center', color: '#424b56ff', marginTop: 8 }}>Dec 31, 2025 · Written by Rahul Kukreti</p>
        <p className="post-subtitle" style={{ textAlign: 'center', color: '#6b586aff', maxWidth: 820, margin: '8px auto 0' }}>
          Online conversations today move fast, but meaningful discussions often get lost in the noise. Many platforms focus only on real-time chats or endless content feeds, leaving little room for thoughtful exchange. The Vocably Community was created to address this gap by giving people a dedicated place to share ideas, discuss topics, and engage with others at their own pace.
        </p>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "mainEntityOfPage": { "@type": "WebPage", "@id": "https://vocably.chat/blog/vocably-community" },
            "headline": "Vocably Community: A Space for Thoughtful Discussions and Shared Ideas",
            "description": "A text-based community for thoughtful, asynchronous discussion that complements Vocably's live rooms.",
            "author": { "@type": "Organization", "name": "Vocably" },
            "publisher": { "@type": "Organization", "name": "Vocably", "logo": { "@type": "ImageObject", "url": "https://vocably.chat/images/vocably-touch-icon.png" } },
            "datePublished": "2025-12-31T00:00:00Z",
            "dateModified": "2025-12-31T00:00:00Z"
          }) }}
        />

        <div className="post-content" style={{ maxWidth: 980, margin: '28px auto 0', display: 'flex', flexDirection: 'column', gap: 22 }}>

          <div style={{ padding: '8px 0' }}>
            <h3 style={{ marginTop: 12, marginBottom: 8, color: '#071025', fontWeight: 800 }}>Understanding Vocably and Its Vision</h3>
            <p style={{ margin: 0, color: '#0b1220' }}>
              Vocably is a topic-based platform focused on meaningful communication. It allows users to join or host
              voice and video rooms around specific subjects, making conversations more intentional and relevant. Instead of random or unfocused interactions, Vocably encourages people to connect through shared interests.
            </p>
            <p style={{ marginTop: 12, color: '#0b1220' }}>
              However, not every conversation needs to begin in real time. Many users prefer to read, think, and respond before speaking. The Vocably Community exists to support this preference by offering a structured environment for written discussions.
            </p>
          </div>

          <div style={{ padding: '8px 0' }}>
            <h3 style={{ marginTop: 12, marginBottom: 8, color: '#071025', fontWeight: 800 }}>What Is the Vocably Community?</h3>
            <a href="/Vocably-community.png" target="_blank" rel="noopener noreferrer" style={{ display: 'block', margin: '12px auto', textAlign: 'center' }}>
              <img src="/Vocably-community.png" alt="Vocably community" style={{ width: '100%', maxWidth: 680, borderRadius: 8, display: 'block', margin: '0 auto' }} />
            </a><br></br>
            <p style={{ margin: 0, color: '#0b1220' }}>
              The Vocably Community is a shared discussion space where users can create posts and comment on topics that matter to them. It is a single, unified community designed to bring all discussions into one place rather than splitting them across multiple groups.
            </p>
            <p style={{ marginTop: 12, color: '#0b1220' }}>
              Here, users can express ideas, ask questions, and engage in conversations without the pressure of joining a live session. Discussions remain visible over time, allowing others to read, respond, and contribute whenever they choose.
            </p>
          </div>

          <div style={{ padding: '8px 0' }}>
            <h3 style={{ marginTop: 12, marginBottom: 8, color: '#071025', fontWeight: 800 }}>How the Vocably Community Works</h3>
            <p style={{ margin: 0, color: '#0b1220' }}>
              At its core, the Vocably Community is simple and focused. Users can write posts around topics they are interested in, and others can reply through comments. These discussions are not tied to real-time availability, which makes participation flexible and accessible.
            </p>
            <p style={{ marginTop: 12, color: '#0b1220' }}>
              The emphasis is on quality conversations rather than speed. Posts are meant to spark discussion, share perspectives, and encourage thoughtful engagement instead of quick reactions.
            </p>
          </div>

          <div style={{ padding: '8px 0' }}>
            <h3 style={{ marginTop: 12, marginBottom: 8, color: '#071025', fontWeight: 800 }}>Why a Text-Based Community Matters</h3>
            <p style={{ margin: 0, color: '#0b1220' }}>
              Live voice and video conversations are powerful, but they are not always convenient. Time zones, schedules, and personal comfort levels can make it difficult for everyone to participate in real time. A text-based community solves this by allowing conversations to happen asynchronously.
            </p>
            <p style={{ marginTop: 12, color: '#0b1220' }}>
              The Vocably Community gives users the freedom to engage when it suits them. They can take time to read existing discussions, think about their responses, and contribute meaningfully. This often leads to more thoughtful and well-structured conversations.
            </p>
          </div>

          <div style={{ padding: '8px 0' }}>
            <h3 style={{ marginTop: 12, marginBottom: 8, color: '#071025', fontWeight: 800 }}>The Role of Vocably Community Within Vocably</h3>
            <p style={{ margin: 0, color: '#0b1220' }}>
              The Vocably Community does not replace voice and video rooms. Instead, it complements them by providing a space for discussion outside of live conversations.
            </p>
            <p style={{ marginTop: 12, color: '#0b1220' }}>
              Users may use the community to explore topics, understand different viewpoints, or simply engage in discussions through text. This creates a more complete communication ecosystem where both written and spoken conversations coexist on the platform.
            </p>
          </div>

          <div style={{ padding: '8px 0' }}>
            <h3 style={{ marginTop: 12, marginBottom: 8, color: '#071025', fontWeight: 800 }}>Who the Vocably Community Is For</h3>
            <p style={{ margin: 0, color: '#0b1220' }}>
              The Vocably Community is designed for people who value meaningful discussions and structured conversations. It is suitable for learners, professionals, creators, and anyone who enjoys exchanging ideas with others.
            </p>
            <p style={{ marginTop: 12, color: '#0b1220' }}>
              Some users prefer starting with written discussions before speaking, while others may only want to participate through text. The community supports both preferences without forcing a specific way to engage.
            </p>
          </div>

          <div style={{ padding: '8px 0' }}>
            <h3 style={{ marginTop: 12, marginBottom: 8, color: '#071025', fontWeight: 800 }}>Building Better Conversations</h3>
            <p style={{ margin: 0, color: '#0b1220' }}>
              One of the main goals of the Vocably Community is to improve the quality of online conversations. By slowing things down and encouraging thoughtful participation, it helps reduce noise and promotes clarity.
            </p>
            <p style={{ marginTop: 12, color: '#0b1220' }}>
              Discussions are centered around topics, which keeps conversations focused and relevant. Over time, this approach helps build a stronger sense of community and mutual respect among users.
            </p>
          </div>

          <div style={{ padding: '8px 0' }}>
            <h3 style={{ marginTop: 12, marginBottom: 8, color: '#071025', fontWeight: 800 }}>A Platform Designed to Grow</h3>
            <p style={{ margin: 0, color: '#0b1220' }}>
              The Vocably Community is still evolving. Its foundation is intentionally simple, focusing on posts and comments that encourage discussion. As the platform grows, improvements will continue to enhance usability, discovery, and engagement while keeping the experience clean and easy to use.
            </p>
            <p style={{ marginTop: 12, color: '#0b1220' }}>
              Transparency is an important part of Vocably’s approach. Features are clearly defined, and the community is built around what users can do today, not promises of future functionality.
            </p>
          </div>

          <div style={{ padding: '8px 0' }}>
            <h3 style={{ marginTop: 12, marginBottom: 8, color: '#071025', fontWeight: 800 }}>Getting Started with the Vocably Community</h3>
            <p style={{ margin: 0, color: '#0b1220' }}>
              Joining the Vocably Community is straightforward. Users can explore existing discussions, read posts, and start contributing by sharing their own thoughts or responding to others. There is no requirement to participate in live conversations, making the community welcoming to all communication styles.
            </p>
            <p style={{ marginTop: 12, color: '#0b1220' }}>
              Participation can be as light or as involved as the user prefers. Whether reading quietly or actively engaging, every interaction contributes to the overall discussion environment.
            </p>
          </div>

        </div>

        <footer style={{ maxWidth: 980, margin: '28px auto 0', padding: '24px 8px', borderTop: '1px solid rgba(7,16,37,0.06)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ color: '#071025', fontWeight: 700 }}>Thanks for reading</div>
            <div style={{ color: '#0b1220' }}>If you enjoyed this post, explore more posts on the <Link href="/blog">blog</Link>.</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <Link href="/" style={{ color: '#066cf2ff' }}>Home</Link>
              <Link href="/blog" style={{ color: '#066cf2ff' }}>Blog</Link>
              <Link href="/privacy" style={{ color: '#066cf2ff' }}>Privacy</Link>
            </div>
            <div style={{ marginTop: 12, color: '#1a1a1bff', fontSize: 13 }}>&copy; {new Date().getFullYear()} Vocably — All rights reserved.</div>
          </div>
        </footer>
      </main>
    </div>
  )
}
