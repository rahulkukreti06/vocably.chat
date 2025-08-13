'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen w-full bg-[#061018] text-gray-100 py-14 px-5 sm:px-8">
      {/* subtle pattern */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.08] [background-image:radial-gradient(circle_at_1px_1px,#ffffff_0.6px,transparent_0)] [background-size:26px_26px]" />
  <div className="relative max-w-5xl mx-auto text-left">
        <Link href="/" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors mb-10">
          <ArrowLeft size={18} className="mr-2" /> Back to Home
        </Link>
        <header className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#ffe066]">Vocably Privacy Policy</h1>
          <p className="mt-2 text-sm text-gray-400">Last updated: August 12, 2025</p>
          <div className="mt-4 h-px w-full bg-gradient-to-r from-[#ffe066] via-transparent to-transparent" />
        </header>

  <article className="text-[15.5px] leading-relaxed space-y-12 font-[450] text-left">
          <section>
            <h2 className="text-xl font-semibold text-[#ffe066] mb-2">Introduction</h2>
            <p>
              This policy explains how we collect, use and protect your information when using Vocably. It covers what we store, when we remove data and the choices you have. By using Vocably you agree to this policy.
            </p>
          </section>

            <section>
              <h2 className="text-xl font-semibold text-[#ffe066] mb-2">Information We Collect</h2>
              <ul className="list-disc pl-6 space-y-2 marker:text-[#ffe066]">
                <li><span className="font-semibold text-[#ffe066]">Account Information:</span> your name, email, profile picture (if provided), and an account identifier from your sign‑in provider.</li>
                <li><span className="font-semibold text-[#ffe066]">Room Data:</span> metadata for rooms you create (e.g., title, language, visibility, creator name/image). We track aggregate participant counts for rooms; we do not store your personal room‑join history.</li>
                <li><span className="font-semibold text-[#ffe066]">Profile Information (optional):</span> if you choose to create or edit a profile, we store the fields you submit (e.g., username, bio, avatar, native and learning languages).</li>
                <li><span className="font-semibold text-[#ffe066]">Local Preferences:</span> certain settings (e.g., mic/camera mute, theme) are saved in your browser’s local storage on your device.</li>
                <li><span className="font-semibold text-[#ffe066]">Authentication:</span> session cookies to keep you signed in securely.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#ffe066] mb-2">How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2 marker:text-[#ffe066]">
                <li>Provide and maintain the service</li>
                <li>Improve user experience and develop features</li>
                <li>Send important notices and updates</li>
                <li>Maintain security and prevent fraud</li>
                <li>Meet legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#ffe066] mb-2">Data Security</h2>
              <p>
                We apply reasonable technical and organizational measures (encryption in transit, access controls, monitoring) to protect data. No method is 100% secure; you share information at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#ffe066] mb-2">Third-Party Services</h2>
              <p className="mb-3">We rely on trusted providers to operate core functionality:</p>
              <ul className="list-disc pl-6 space-y-2 marker:text-[#ffe066]">
                <li><span className="font-semibold text-[#ffe066]">Google Authentication:</span> secure sign‑in.</li>
                <li><span className="font-semibold text-[#ffe066]">Supabase:</span> database, real‑time updates, and hosting for app data.</li>
              </ul>
              <p className="mt-3 text-sm text-gray-400">We currently do not use third‑party analytics scripts. Each provider processes data under its own privacy policy.</p>
            </section>

              <section>
                <h2 className="text-xl font-semibold text-[#ffe066] mb-2">Data Retention</h2>
                <p>
                  We keep account and room metadata while your account is active or as needed to provide the service. Sign‑in events logged to a private Google Sheet are retained for onboarding/diagnostics and may be periodically pruned. Diagnostic logs may be kept briefly for security/troubleshooting, then deleted or anonymized. We do not record meeting audio/video.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-[#ffe066] mb-2">Cookies & Local Storage</h2>
                <p className="mb-3">We use essential cookies and similar technologies to:</p>
                <ul className="list-disc pl-6 space-y-2 marker:text-[#ffe066]">
                  <li>Keep you signed in and secure</li>
                  <li>Remember preferences (e.g., mic/camera mute, theme)</li>
                </ul>
                <p className="mt-3 text-sm text-gray-400">You can control cookies in your browser settings. Disabling some may affect functionality.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-[#ffe066] mb-2">What We Don’t Collect</h2>
                <p>We don’t store meeting audio/video or your chat/meeting content on our servers. We also don’t collect precise location or payment card details.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-[#ffe066] mb-2">Data Sharing & Disclosure</h2>
                <ul className="list-disc pl-6 space-y-2 marker:text-[#ffe066]">
                  <li>We do not sell your personal data.</li>
                  <li>We share data with service providers (e.g., auth, hosting, analytics) under contracts requiring appropriate safeguards.</li>
                  <li>We may disclose information to comply with law, protect rights, or respond to lawful requests.</li>
                  <li>In a business transfer, data may be part of the transaction subject to this policy.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-[#ffe066] mb-2">Data Deletion</h2>
                <p>
                  If you want your account or personal data removed, contact us at the email below. We will delete or anonymize data that we are not required to keep for legal or security reasons.
                </p>
              </section>
              <section>
                <h2 className="text-xl font-semibold text-[#ffe066] mb-2">International Transfers</h2>
                <p>
                  Your information may be processed and stored in countries other than where you live. We take steps to ensure appropriate protections are in place consistent with applicable laws.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-[#ffe066] mb-2">Children’s Privacy</h2>
                <p>
                  Vocably is not intended for children under 13. If you believe we have collected personal information from a child, contact us and we will take appropriate steps to remove it.
                </p>
              </section>

            <section>
              <h2 className="text-xl font-semibold text-[#ffe066] mb-2">Changes to This Policy</h2>
              <p>We may update this page. Continued use after changes becomes effective means you accept the updated policy.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#ffe066] mb-2">Contact Us</h2>
              <p className="mb-3">Questions or concerns about privacy?</p>
              <a href="mailto:vocably.chat@gmail.com" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 font-medium">vocably.chat@gmail.com</a>
            </section>
        </article>

        <footer className="mt-16 pt-6 text-xs text-gray-500 border-t border-white/5">© {new Date().getFullYear()} Vocably. All rights reserved.</footer>
      </div>
    </div>
  );
}
