import BlogHeader from '../../../components/BlogHeader';
import Link from 'next/link';

export const metadata = {
  title: 'About Vocably and Its Creator — Vocably',
  description: 'Vocably is a voice-first social platform that brings real-time conversations back to the center of digital connection.',
  authors: [{ name: 'Rahul Kukreti', url: 'https://vocably.chat' }],
  openGraph: {
    title: 'About Vocably and Its Creator — Vocably',
    description: 'Vocably is a voice-first social platform that brings real-time conversations back to the center of digital connection.',
    url: 'https://vocably.chat/blog/about',
  }
};

export default function BlogAboutPage() {
  return (
    <div style={{ background: '#e7e7fd', minHeight: '100vh', color: '#e6eef8' }}>
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

        <h1 className="post-title">About Vocably and Its Creator</h1>

        <p style={{ textAlign: 'center', color: '#424b56ff', marginTop: 8 }}>Oct 25, 2025 · Written by Rahul Kukreti</p>
        <p className="post-subtitle" style={{ textAlign: 'center', color: '#6b586aff', maxWidth: 820, margin: '8px auto 0' }}>
          The internet has always been a place where voices connect where conversations shape communities, friendships, and even revolutions. Yet, somewhere along the way, social platforms became more about scrolling than speaking, more about algorithms than authenticity. That’s exactly what inspired the creation of Vocably a space designed to bring real voice conversations back to the center of digital connection.
        </p>

        {/* Article structured data for search engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://vocably.chat/blog/about"
            },
            "headline": "About Vocably and Its Creator",
            "description": "Vocably is a voice-first social platform that brings real-time conversations back to the center of digital connection.",
            "image": ["https://vocably.chat/images/vocably-touch-icon.png"],
            "author": { "@type": "Person", "name": "Rahul Kukreti", "url": "https://vocably.chat" },
            "publisher": { "@type": "Organization", "name": "Vocably", "logo": { "@type": "ImageObject", "url": "https://vocably.chat/images/vocably-touch-icon.png" } },
            "datePublished": "2025-10-22T00:00:00Z",
            "dateModified": "2025-10-22T00:00:00Z"
          }) }}
        />

        <div className="post-content" style={{ maxWidth: 980, margin: '28px auto 0', display: 'flex', flexDirection: 'column', gap: 22 }}>

          <div style={{ padding: '8px 0' }}>
            <h3 style={{ marginTop: 12, marginBottom: 8, color: '#071025', fontWeight: 800 }}>What is Vocably?</h3>
            <a href="/Screenshot%202025-10-28%20175944.png" target="_blank" rel="noopener noreferrer" style={{ display: 'block', margin: '12px auto', textAlign: 'center' }}>
              <img src="/Screenshot%202025-10-28%20175944.png" alt="Vocably screenshot" style={{ width: '100%', maxWidth: 560, borderRadius: 8, display: 'block', margin: '0 auto' }} />
            </a><br></br>
            <p style={{ margin: 0, color: '#0b1220' }}>
              Vocably.chat is a topic-based voice and video chat platform built for real conversations. You can create public or private rooms to talk about literally anything that’s on your mind from learning new languages and practicing communication skills to debating politics, geeking out about games, or just vibing with people who share your interests.
            </p>
            <p style={{ marginTop: 12, color: '#0b1220' }}>
              It’s not just about talking either you can watch YouTube videos, stream movies, or even listen to music together in real-time. Teachers can use it to teach their students, and professionals can host meetings or discussions. Basically, Vocably is a place where connection meets creativity a space to speak, learn, and grow with people from anywhere in the world.
            </p><br></br>

            <h3 style={{ marginTop: 18, marginBottom: 8, color: '#071025', fontWeight: 800 }}>About Vocably The Idea That Started With a Simple Need to Connect</h3>
            <p style={{ margin: 0, color: '#0b1220' }}>
              I built Vocably because I personally struggled to improve my communication skills. I tried many online platforms like OmeTV, Discord, and others, but almost every time, the experience felt… empty. Conversations were shallow mostly just “Hi, how are you?” or “Where are you from?” and then silence. Random matching made it awkward to actually connect, and nothing meaningful came out of it.
            </p>
            <p style={{ marginTop: 12, color: '#0b1220' }}>
              Discord, on the other hand, felt way too complex crowded servers, chaotic chats, and no real way to actually talk. It was like standing in a massive virtual hall where everyone’s shouting but no one’s really listening. I wanted something different something lightweight, simple, and personal, where people could actually talk about things that matter to them.
            </p>
            <p style={{ marginTop: 12, color: '#0b1220' }}>
              That’s where Vocably started.
            </p>
            <p style={{ marginTop: 12, color: '#0b1220' }}>
              I imagined a platform where people could instantly join or create topic based voice and video rooms a space where you don’t have to scroll endlessly or deal with cluttered interfaces. These rooms are temporary, so every conversation feels fresh, natural, and alive. It’s not about followers or likes it’s about real voices and real moments.
            </p>
            <p style={{ marginTop: 12, color: '#0b1220' }}>
              But the idea wasn’t just about convenience. It came from a real need to become better at speaking, listening, and understanding people from different parts of the world. I realized I’m not alone in this struggle. Millions of people around the world want to talk, practice languages, make friends, or just express themselves but existing platforms either feel too random or too complicated.
            </p>
            <p style={{ marginTop: 12, color: '#0b1220' }}>
              So, Vocably became my answer to that frustration a place designed for meaningful, topic driven voice conversations.
            </p><br></br>
          </div>

          <div style={{ padding: '8px 0' }}>
            <h3 style={{ marginTop: 12, marginBottom: 8, color: '#071025', fontWeight: 800 }}>The Vision for the Future</h3>

            <p style={{ margin: 0, color: '#0b1220' }}>
              When I first started building Vocably, it was just a simple idea a place where people could talk freely without the awkward silence or chaos of traditional platforms. But as I kept working on it, something bigger started taking shape in my mind. Vocably wasn’t just about fixing random chats it was about reshaping how humans connect in real time, no matter where they come from or what language they speak.
            </p>

            <p style={{ marginTop: 12, color: '#0b1220' }}>
              The future of Vocably is more than just conversations. It’s about creating an entire ecosystem of connection, learning, and entertainment all happening live, voice to voice, and heart-to-heart.
            </p><br></br>

            <a href="/Ai%20img.jpg" target="_blank" rel="noopener noreferrer" style={{ display: 'block', margin: '12px auto', textAlign: 'center' }}>
              <img src="/Ai%20img.jpg" alt="AI illustration" style={{ width: '100%', maxWidth: 560, borderRadius: 8, display: 'block', margin: '0 auto' }} />
            </a><br></br>
            <h4 style={{ marginTop: 12, color: '#071025' }}>1. AI That Breaks Barriers</h4>
            <p style={{ marginTop: 8, color: '#0b1220' }}>
              One of the biggest challenges in global communication is language. Millions of people want to talk, but language walls still stop them from truly understanding each other. That’s why one of my main goals for the future is to bring in AI powered real time translation and captions so someone from India can talk to someone from Spain or Japan without ever worrying about words.
            </p>
            <p style={{ marginTop: 8, color: '#0b1220' }}>
              Imagine entering a Vocably room and speaking naturally in your language while AI instantly translates your voice for others like having a universal translator in your pocket. That’s the kind of world I want to build with Vocably.
            </p>
            <p style={{ marginTop: 8, color: '#0b1220' }}>
              It’s not just about talking it’s about understanding. And AI will make that possible.
            </p><br></br>
            

            <a href="/new%202nd%20ai%20img.webp" target="_blank" rel="noopener noreferrer" style={{ display: 'block', margin: '12px auto', textAlign: 'center' }}>
              <img src="/new%202nd%20ai%20img.webp" alt="AI summaries illustration" style={{ width: '100%', maxWidth: 560, borderRadius: 8, display: 'block', margin: '0 auto' }} />
            </a><br></br>
            <h4 style={{ marginTop: 12, color: '#071025' }}> 2. Smarter Conversations with AI Room Summaries</h4>
            <p style={{ marginTop: 8, color: '#0b1220' }}>
              Another feature I’m planning is Room Summarizing a system where Vocably’s AI listens, learns, and generates a quick summary of the conversation once the room ends.
            </p>
            <p style={{ marginTop: 8, color: '#0b1220' }}>
              So, if you joined a long discussion about startups, or a language learning session, you can instantly see what was discussed key takeaways, opinions, and insights all neatly packed into a few lines. It’s like having meeting notes for your social life.
            </p>
            <p style={{ marginTop: 8, color: '#0b1220' }}>
              This feature will make Vocably more than just a communication platform it’ll turn it into a knowledge-sharing space.
            </p><br></br>
            

            <a href="/3rd%20point%20img.webp" target="_blank" rel="noopener noreferrer" style={{ display: 'block', margin: '12px auto', textAlign: 'center' }}>
              <img src="/3rd%20point%20img.webp" alt="Games and fun illustration" style={{ width: '100%', maxWidth: 560, borderRadius: 8, display: 'block', margin: '0 auto' }} />
            </a><br></br>
            <h4 style={{ marginTop: 12, color: '#071025' }}>3. Turning Conversations into Fun Experiences</h4>
            <p style={{ marginTop: 8, color: '#0b1220' }}>
              Vocably isn’t just about serious talks. I want it to be a place to relax, laugh, and have fun too. That’s why I’m planning to integrate mini-games inside rooms things like quiz challenges, truth or dare, word games, or icebreakers that make people more comfortable and connected.
            </p>
            <p style={{ marginTop: 8, color: '#0b1220' }}>
              The goal is simple turn awkward silences into shared laughter.
            </p>
            <p style={{ marginTop: 8, color: '#0b1220' }}>
              Because real connections often start with small fun moments, not serious introductions.
            </p><br></br>

            <a href="/4%20th%20point%20img.jpg" target="_blank" rel="noopener noreferrer" style={{ display: 'block', margin: '12px auto', textAlign: 'center' }}>
              <img src="/4%20th%20point%20img.jpg" alt="Shared movie watching illustration" style={{ width: '100%', maxWidth: 560, borderRadius: 8, display: 'block', margin: '0 auto' }} />
            </a><br></br>
            <h4 style={{ marginTop: 12, color: '#071025' }}>4. Shared Moments Movies, Music, and More</h4>
            <p style={{ marginTop: 8, color: '#0b1220' }}>
              On Vocably, you can already watch movies, stream YouTube videos, and listen to music together in real time turning ordinary moments into shared experiences. But this is just the beginning. I’m working to make these features even better smoother playback, richer audio, and more synchronized viewing so you and your friends can feel like you’re truly watching or listening together
            </p>
            <p style={{ marginTop: 8, color: '#0b1220' }}>
              No more watching alone you can grab your online friends, jump into a room, and share the same experience while talking over it. Whether it’s reacting to a trailer, streaming a song, or hosting a movie night, Vocably will make online interaction feel alive and human again.
            </p><br></br>

            <a href="/5th%20point%20img.jpg" target="_blank" rel="noopener noreferrer" style={{ display: 'block', margin: '12px auto', textAlign: 'center' }}>
              <img src="/5th%20point%20img.jpg" alt="Online teaching illustration" style={{ width: '100%', maxWidth: 560, borderRadius: 8, display: 'block', margin: '0 auto' }} />
            </a><br></br>
            <h4 style={{ marginTop: 12, color: '#071025' }}>5. Empowering Tutors, Professionals, and Creators</h4>
            <p style={{ marginTop: 8, color: '#0b1220' }}>
              Vocably will also become a powerful platform for tutors, professionals, and creators. I’m planning to add tools that let teachers host language sessions, mentors run workshops, and creators engage with their community through voice.
            </p>
            <p style={{ marginTop: 8, color: '#0b1220' }}>
              These features will include things like scheduling, paid rooms, analytics, and even certification systems for verified hosts. The idea is to give talented people the power to teach, share, and earn all through live voice sessions.
            </p>
            <p style={{ marginTop: 8, color: '#0b1220' }}>
              This transforms Vocably into more than just a social app it becomes a platform for learning and growth.
            </p>
          </div>

          <div style={{ padding: '8px 0' }}>
            <h3 style={{ marginTop: 18, marginBottom: 8, color: '#071025', fontWeight: 800 }}>About the Creator</h3>
            <p style={{ margin: 0, color: '#0b1220' }}>
              Hey, I’m Rahul Kukreti a self taught creator, tech learner, and founder of Vocably. I’m currently pursuing my Bachelors, and I love building digital products that connect people and ideas.
            </p>
            <p style={{ marginTop: 12, color: '#0b1220' }}>
              The idea for Vocably came from a very personal need I wanted to improve my English communication and connect with people through real conversations, not just texts or social media comments. But most platforms I tried felt either too random or too complicated. So instead of waiting for the perfect platform, I decided to build one myself something simple, voice first, and human.
            </p>
            <p style={{ marginTop: 12, color: '#0b1220' }}>
              I started with basic coding skills HTML, CSS, and JavaScript and learned everything step by step while building Vocably from scratch. Every line of code taught me something new about technology, design, and problem solving.
            </p>
            <p style={{ marginTop: 12, color: '#0b1220' }}>
              Over time, I realized that creating isn’t just about building apps it’s about building experiences. I want my projects to make communication more real and meaningful, especially in a world full of filters, likes, and endless scrolling. My dream is to keep building digital products that make a difference platforms that inspire people to speak, connect, and grow together.
            </p>
          </div>

            <div style={{ padding: '8px 0' }}>
              <p style={{ marginTop: 12, color: '#7a7e7dff' }}>
                Vocably is still growing, and I’m learning along the way. It’s not perfect yet, but it’s something I truly believe in. If you’re someone who loves talking, learning, or just connecting with people, Vocably is for you. I’m building this for everyone who believes good conversations still matter.
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
