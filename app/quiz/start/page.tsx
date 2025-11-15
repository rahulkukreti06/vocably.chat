"use client"

import React, { useState, useEffect } from 'react'
import BlogHeader from '../../../components/BlogHeader'

type QuizQuestion = {
  question: string
  options: string[]
  answerIndex: number
}

const QUESTIONS: QuizQuestion[] = [
  {
    question: 'Which early channel is most repeatable and lowest-cost for acquiring the first 1,000 users for a niche B2B tool?',
    options: ['Paid social ads', 'Outbound outreach + partnerships', 'TV advertising', 'Large conference sponsorships'],
    answerIndex: 1,
  },
  {
    question: 'What pricing approach helps when there are three distinct user personas (frequent, occasional, and enterprise)?',
    options: ['Single flat price', 'Usage-based + tiered plans', 'Free trial forever', 'Pay-per-feature add-ons only'],
    answerIndex: 1,
  },
  {
    question: 'With $50k and 6 months, what experiment is highest priority to validate product-market fit?',
    options: ['Build full product MVP', 'Run landing-page + paid-acq test with pre-signups', 'Hire a large sales team', 'File patents immediately'],
    answerIndex: 1,
  },
  {
    question: 'Which is the primary trade-off when choosing VC-fueled rapid growth vs. organic profitability?',
    options: ['Speed vs. equity dilution', 'Better UX vs. worse UX', 'Open-source vs. closed-source', 'More customers vs. fewer features'],
    answerIndex: 0,
  },
  {
    question: 'Best initial tactic to build a brand with 10x smaller marketing budget?',
    options: ['Mass TV campaigns', 'Niche content + community-first strategy', 'Expensive celebrity endorsements', 'Buy competitors\' email lists'],
    answerIndex: 1,
  },
  {
    question: 'What element most convinces investors on defensibility?',
    options: ['Beautiful website', 'Network effects or proprietary data', 'Random buzz', 'Expensive logos on home page'],
    answerIndex: 1,
  },
  {
    question: 'With limited hires, which founding roles are top priority?',
    options: ['Design + HR', 'Product + Growth + Ops split across hires', 'Legal + Compliance only', 'Accounting + Reception'],
    answerIndex: 1,
  },
  {
    question: 'To increase activation for a complex regulated product, which change is highest impact?',
    options: ['Add more modals', 'Simplify first-run experience + contextual help', 'Hide advanced features', 'Require longer onboarding forms'],
    answerIndex: 1,
  },
  {
    question: 'Which is a defensible moat for a marketplace?',
    options: ['Strong brand alone', 'Network effects, data advantages, and supplier relationships', 'Copying competitors', 'Frequent rebranding'],
    answerIndex: 1,
  },
  {
    question: 'Best way to test whether customers will pay for a feature?',
    options: ['Add feature and wait 2 years', 'Charge early via pre-orders or paid beta', 'Keep feature free forever', 'Announce the feature only'],
    answerIndex: 1,
  },
  {
    question: 'If a competitor copies your core feature, what immediate action should you take?',
    options: ['Ignore entirely', 'Double-down on product differentiation and go-to-market', 'Shut down product', 'Raise prices immediately'],
    answerIndex: 1,

  },
  {
    question: 'Which metric combination best summarizes healthy subscription unit economics?',
    options: ['Low LTV, high CAC', 'High LTV, low CAC, short payback period', 'No churn, infinite CAC', 'High churn tolerated with no acquisition plan'],
    answerIndex: 1,
  },
  {
    question: 'Most effective retention tactic for mobile consumer apps?',
    options: ['Irrelevant notifications', 'Meaningful personalized re-engagement + core value timely delivered', 'Remove key features', 'Long registration flows'],
    answerIndex: 1,
  },
  {
    question: 'When to internationalize a product?',
    options: ['Immediately before product-market fit', 'After validating core market and identifying top target markets', 'Only after IPO', 'Never'],
    answerIndex: 1,
  },
  {
    question: 'When pivoting, what\'s the right first step?',
    options: ['Randomly change everything', 'Run small experiments to validate new customer or monetization hypotheses', 'Fire the team', 'Ignore data and hope for viral growth'],
    answerIndex: 1,
  },
]

export default function QuizStartPage(): JSX.Element {
  // helper to shuffle options while preserving correct answer mapping
  function shuffleArray<T>(arr: T[]) {
    const a = arr.slice()
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = a[i]
      a[i] = a[j]
      a[j] = tmp
    }
    return a
  }

  function shuffleQuestion(q: QuizQuestion): QuizQuestion {
    // attach original indices so we can find the new index of the correct answer
    const indexed = q.options.map((opt, i) => ({ opt, i }))
    const shuffled = shuffleArray(indexed)
    const newAnswerIndex = shuffled.findIndex(item => item.i === q.answerIndex)
    return { question: q.question, options: shuffled.map(s => s.opt), answerIndex: newAnswerIndex }
  }

  // Initialize deterministically to match server-rendered HTML.
  const [shuffled, setShuffled] = useState<QuizQuestion[]>(QUESTIONS)

  const [index, setIndex] = useState<number>(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(QUESTIONS.length).fill(null))
  const [showResults, setShowResults] = useState(false)

  // Start state: quiz doesn't begin until the user reads instructions and clicks Start.
  const [hasStarted, setHasStarted] = useState<boolean>(false)

  function handleStart() {
    // shuffle options when the user explicitly starts the quiz (client-only)
    const newShuffled = QUESTIONS.map(shuffleQuestion)
    setShuffled(newShuffled)
    setAnswers(Array(newShuffled.length).fill(null))
    setIndex(0)
    setSelected(null)
    setShowResults(false)
    setHasStarted(true)
    window.scrollTo({ top: 0 })
  }

  function handleSelect(optIdx: number) {
    setSelected(optIdx)
  }

  function handleNext() {
    if (selected === null) return
    const nextAnswers = [...answers]
    nextAnswers[index] = selected
    setAnswers(nextAnswers)
    setSelected(null)

    if (index + 1 >= shuffled.length) {
      setShowResults(true)
    } else {
      setIndex(index + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function handleRestart() {
    // reshuffle on restart so correct answers aren't always in the same position
    const newShuffled = QUESTIONS.map(shuffleQuestion)
    setShuffled(newShuffled)
    setIndex(0)
    setSelected(null)
    setAnswers(Array(newShuffled.length).fill(null))
    setShowResults(false)
    window.scrollTo({ top: 0 })
  }

  function handleSubmit() {
    // record current selection (if any) and show results
    if (selected === null) return
    const nextAnswers = [...answers]
    nextAnswers[index] = selected
    setAnswers(nextAnswers)
    setSelected(null)
    // calculate score then submit
    let newScore = 0
    for (let i = 0; i < shuffled.length; i++) {
      if (nextAnswers[i] === shuffled[i].answerIndex) newScore += 1
    }

    setShowResults(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // send to server (fire-and-wait so user gets feedback)
    submitToServer(newScore)
  }

  // submission to server state
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submittedOnServer, setSubmittedOnServer] = useState(false)

  async function submitToServer(scoreToSend: number) {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: scoreToSend }),
      })

      if (res.status === 409) {
        const data = await res.json()
        setSubmitError(data?.error || 'Already submitted')
        setSubmittedOnServer(false)
      } else if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setSubmitError(data?.error || 'Failed to submit')
        setSubmittedOnServer(false)
      } else {
        setSubmittedOnServer(true)
      }
    } catch (e: any) {
      setSubmitError(e?.message || 'Network error')
      setSubmittedOnServer(false)
    } finally {
      setSubmitting(false)
    }
  }

  let score = 0
  for (let i = 0; i < shuffled.length; i++) {
    if (answers[i] === shuffled[i].answerIndex) score += 1
  }

  return (
    <main style={{ background: '#fff', minHeight: '100vh', color: '#071025', display: 'flex', flexDirection: 'column' }}>
      <BlogHeader />

      <div style={{ textAlign: 'center', padding: '44px 20px 8px' }}>
        <div style={{ fontSize: 32, fontWeight: 900, color: '#081426', textTransform: 'uppercase', letterSpacing: '0.06em' }}>VOCABLY QUIZ — ENTREPRENEUR EDITION</div>
      </div>

      {/* Instructions modal shown before quiz starts */}
      {!hasStarted && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 600 }}>
          <div style={{ width: 'min(880px,92%)', background: '#fff', padding: 28, borderRadius: 12, boxShadow: '0 20px 60px rgba(2,6,23,0.3)' }}>
            <h3 style={{ margin: 0, marginBottom: 12, fontSize: 20, color: '#081426' }}>Please read these instructions</h3>
            <div style={{ color: '#334155', fontSize: 15, lineHeight: 1.45 }}>
              <p style={{ marginTop: 8 }}>
                Welcome to the VOCABLY QUIZ — ENTREPRENEUR EDITION. Please read the rules below before starting.
              </p>
              <ul style={{ marginTop: 8 }}>
                <li>You may take this quiz only once. Make sure you're ready before submitting.</li>
                <li>There are 15 questions in total. Each question is multiple-choice.</li>
                <li>When you click <strong>Submit</strong> at the end, your results will be recorded in our database.</li>
                <li>If you restart the quiz before submitting, your progress will not be stored. If you have already submitted, restarting will not create a new stored submission.</li>
                <li>If you're selected after evaluation, we'll send an email to the Gmail account you used to sign in.</li>
              </ul>
              <p style={{ marginTop: 8 }}>
                By clicking <strong>Start the Quiz</strong> below you acknowledge the above and agree to proceed. Good luck!
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
              <button onClick={handleStart} style={{ background: '#0ea5a4', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>
                Start the Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {!showResults ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ width: '100%', maxWidth: 900, padding: 32, borderRadius: 14, boxShadow: '0 10px 30px rgba(7,16,37,0.08)', background: '#fff', minHeight: '62vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 14, color: '#6b7280' }}>{`Question ${index + 1} of ${QUESTIONS.length}`}</div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>{`${score} correct`}</div>
            </div>

            <h2 style={{ fontSize: 26, margin: '6px 0 18px', lineHeight: 1.25, color: '#081426' }}>{shuffled[index].question}</h2>

            <div style={{ display: 'grid', gap: 14 }}>
              {shuffled[index].options.map((opt, optIdx) => {
                const isSelected = selected === optIdx
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelect(optIdx)}
                    aria-pressed={isSelected}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      textAlign: 'left',
                      padding: '14px 16px',
                      borderRadius: 10,
                      border: isSelected ? '2px solid #0ea5a4' : '1px solid #e6eef6',
                      background: isSelected ? 'rgba(14,165,164,0.06)' : '#fff',
                      cursor: 'pointer',
                      fontSize: 16,
                      color: '#071025',
                      boxShadow: isSelected ? '0 6px 18px rgba(14,165,164,0.08)' : 'none',
                      fontWeight: 600,
                    }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: isSelected ? '#0ea5a4' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? '#fff' : '#475569', fontWeight: 700 }}>
                      {String.fromCharCode(65 + optIdx)}
                    </div>
                    <div style={{ flex: 1 }}>{opt}</div>
                  </button>
                )
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 22 }}>
              {/* Left slot: show Submit only when on last question; otherwise keep an empty spacer to maintain layout */}
              {index === shuffled.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={selected === null}
                  style={{ background: selected === null ? '#cbd5e1' : '#0ea5a4', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 8, cursor: selected === null ? 'not-allowed' : 'pointer' }}
                >
                  Submit
                </button>
              ) : (
                <div style={{ width: 110 }} />
              )}

              {/* Right slot: show Next for all but the last question; hide on last since Submit handles finish */}
              {index < shuffled.length - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={selected === null}
                  style={{
                    background: selected === null ? '#cbd5e1' : '#0b9ca8',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: 10,
                    cursor: selected === null ? 'not-allowed' : 'pointer',
                    boxShadow: selected === null ? 'none' : '0 6px 18px rgba(11,156,168,0.18)'
                  }}
                >
                  Next
                </button>
              ) : (
                <div style={{ width: 110 }} />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ width: '100%', maxWidth: 900, padding: 28, borderRadius: 12 }}>
            <h2 style={{ fontSize: 26, marginBottom: 6 }}>Your Results</h2>
            <p style={{ color: '#334155', marginTop: 0 }}>{`You answered ${score} out of ${shuffled.length} correctly.`}</p>
            {/* Submission status messages: moved to top under results summary */}
            <div style={{ marginTop: 12 }}>
              {submitting && (
                <div style={{ padding: 10, borderRadius: 8, background: '#f1f5f9', color: '#0f172a' }}>Submitting your result…</div>
              )}

              {!submitting && submittedOnServer && (
                <div style={{ marginTop: 8, padding: 12, borderRadius: 8, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)', color: '#065f46' }}>
                  Your result has been submitted. Thanks for participating!
                </div>
              )}

              {!submitting && submitError && submitError.toLowerCase().includes('already') && (
                <div style={{ marginTop: 8, padding: 12, borderRadius: 8, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)', color: '#7f1d1d' }}>
                  You have already submitted this quiz. Only the first submission is recorded.
                </div>
              )}

              {!submitting && submitError && !submitError.toLowerCase().includes('already') && (
                <div style={{ marginTop: 8, padding: 12, borderRadius: 8, background: 'rgba(254,243,199,0.6)', border: '1px solid rgba(245,158,11,0.12)', color: '#92400e' }}>
                  Submission error: {submitError}
                </div>
              )}
            </div>

            <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
                {shuffled.map((q, i) => {
                  const userAns = answers[i]
                  const correct = q.answerIndex
                  const isCorrect = userAns === correct
                return (
                  <div key={i} style={{ padding: 12, borderRadius: 8, background: isCorrect ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.04)', border: '1px solid #e6eef6' }}>
                    <div style={{ fontSize: 14, color: '#0f172a', marginBottom: 6 }}><strong>{`Q${i + 1}.`}</strong>&nbsp;{q.question}</div>
                    <div style={{ fontSize: 14 }}>
                      <div style={{ color: isCorrect ? '#065f46' : '#7f1d1d' }}>Your answer: {userAns === null ? 'No answer' : q.options[userAns]}</div>
                      {!isCorrect && <div style={{ color: '#065f46', marginTop: 6 }}>Correct: {q.options[correct]}</div>}
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                onClick={handleRestart}
                style={{ background: '#0ea5a4', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, cursor: 'pointer' }}
              >
                Restart Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

