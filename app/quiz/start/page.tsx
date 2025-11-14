import React from 'react'
import BlogHeader from '../../../components/BlogHeader'

export default function QuizStartPage(): JSX.Element {
  return (
    <main style={{ background: '#fff', minHeight: '100vh', color: '#071025' }}>
      <div className="content-wrapper">
        <BlogHeader />

        <div style={{ maxWidth: 900, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '48px', margin: '0 0 12px', fontWeight: 900 }}>VOCABLY QUIZ</h1>
          <p style={{ fontSize: '20px', color: '#334155', margin: '8px 0 24px' }}>The quiz will start on <strong>19 Nov</strong>.</p>
          <p style={{ color: '#6b7280' }}>Come back then to participate — good luck!</p>
        </div>
      </div>
    </main>
  )
}
