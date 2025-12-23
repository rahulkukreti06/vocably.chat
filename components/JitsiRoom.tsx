import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function JitsiRoom({ roomName, subject, roomId }: { roomName: string, subject: string, roomId?: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const hasJoinedRef = useRef(false);
  const hasLeftRef = useRef(false);
  const leaveInFlightRef = useRef<Promise<void> | null>(null);
  const resizeCleanupRef = useRef<(() => void) | null>(null);
  const pendingSyncTimeoutRef = useRef<any>(null);
  const [participantCount, setParticipantCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const participantSyncRef = useRef<NodeJS.Timeout | null>(null);
  const syncingRef = useRef(false);
  const loadingObserverRef = useRef<MutationObserver | null>(null);
  const loadingTimeoutRef = useRef<number | null>(null);

  // Decrement count once, only if actually joined
  const leaveOnce = React.useCallback(() => {
    if (!roomId) return;
    if (hasLeftRef.current) return;
  hasLeftRef.current = true;
  // Cancel any pending syncs immediately to avoid stale 'set' requests after leave
  clearSyncs();
    try {
      const payload = JSON.stringify({ roomId, action: 'leave' });
      if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
        try {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon('/api/room-participants', blob);
        } catch {}
        // Always schedule a fallback fetch in case the beacon is dropped.
        setTimeout(() => {
          if (!leaveInFlightRef.current) {
            leaveInFlightRef.current = fetch('/api/room-participants', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: payload,
              keepalive: true as any,
            })
              .catch(() => {})
              .then(() => { leaveInFlightRef.current = null; })
              .finally(async () => {
                // After ensuring the leave reached the server, fetch authoritative counts and broadcast locally
                try {
                  const res = await fetch('/api/room-participants');
                  if (res.ok) {
                    const data = await res.json();
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('vocably:participantCounts', { detail: data.rooms || {} }));
                    }
                  }
                } catch (e) {}
              });
          }
        }, 700);
        return;
      }
    } catch {}
    if (!leaveInFlightRef.current) {
      leaveInFlightRef.current = fetch('/api/room-participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, action: 'leave' }),
        // keepalive helps when navigating away
        keepalive: true as any,
      })
        .catch(() => {})
        .then(() => { leaveInFlightRef.current = null; });
    }
  }, [roomId]);

  // Clear scheduled syncs and polling when user leaves to avoid stale writes
  const clearSyncs = () => {
    if (participantSyncRef.current) {
      clearInterval(participantSyncRef.current as any);
      participantSyncRef.current = null;
    }
    if (pendingSyncTimeoutRef.current) {
      clearTimeout(pendingSyncTimeoutRef.current);
      pendingSyncTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    // Helper to sanitize the meeting name used by Jitsi.
    // Keep the original `subject`/`roomName` for display in the UI, but
    // transform the value passed to Jitsi to remove/replace characters
    // that break room creation (e.g. apostrophes).
    function sanitizeForJitsi(name: string | undefined | null) {
      if (!name) return '';
      try {
        return name
          .normalize('NFKD')
          .replace(/['"`]/g, '') // remove quotes/apostrophes
          .replace(/[^A-Za-z0-9-_]/g, '-') // replace other chars with hyphen
          .replace(/-+/g, '-') // collapse multiple hyphens
          .replace(/^-|-$/g, ''); // trim leading/trailing hyphens
      } catch (e) {
        return name.replace(/['"`]/g, '').replace(/[^A-Za-z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      }
    }
    // Aggressively auto-click "Join in browser" on mobile pre-join screen
    let joinObserver: MutationObserver | null = null;

    function tryClickJoinInBrowser() {
      // Look for the join in browser link/button
      const joinInBrowserBtn = document.querySelector('a[href*="browser"], [data-testid="join-in-browser"], #join-in-browser');
      if (joinInBrowserBtn) {
        (joinInBrowserBtn as HTMLElement).click();
        return true;
      }
      // Fallback: search by text
      const allElements = document.querySelectorAll('a, button, div[role="button"]');
      for (const element of allElements) {
        const text = element.textContent?.toLowerCase() || '';
        if (text.includes('join in browser')) {
          (element as HTMLElement).click();
          return true;
        }
      }
      return false;
    }

    // Only run this on mobile devices
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      // Try immediately
      setTimeout(tryClickJoinInBrowser, 500);
      // Try again after a second
      setTimeout(tryClickJoinInBrowser, 1500);
      // Use MutationObserver to catch late loads
      joinObserver = new MutationObserver(() => {
        tryClickJoinInBrowser();
      });
      joinObserver.observe(document.body, { childList: true, subtree: true });
    }
    // (Removed aggressive user agent and screen spoofing to restore mobile responsiveness)

    // Get saved audio/video preferences from localStorage
    const savedAudioMuted = localStorage.getItem('vocably-audio-muted') === 'true';
    const savedVideoMuted = localStorage.getItem('vocably-video-muted') === 'true';
    
    // If no preference saved yet, default to muted (privacy-first approach)
    const audioMuted = localStorage.getItem('vocably-audio-muted') === null ? true : savedAudioMuted;
    const videoMuted = localStorage.getItem('vocably-video-muted') === null ? true : savedVideoMuted;

    const domain = 'api.vocably.chat'; // Use domain without port (nginx will proxy)
    const options = {
      // Use a sanitized name for the Jitsi meeting id. Keep original `subject`
      ///`roomName` untouched for display elsewhere.
      roomName: sanitizeForJitsi(subject || roomName) || sanitizeForJitsi(roomName),
      parentNode: jitsiContainerRef.current,
      width: '100%',
      // Use container-driven sizing; we'll manage height dynamically for mobile correctness
      height: '100%',
      userInfo: {
        displayName: session?.user?.name || 'Guest'
      },
      configOverwrite: {
        prejoinPageEnabled: false, // Skip the mobile pre-join screen
        startWithAudioMuted: audioMuted,
        startWithVideoMuted: videoMuted,
        // Force disable mobile app prompts
        disableMobileApp: true,
        // Additional mobile bypasses
        enableWelcomePage: false,
        requireDisplayName: false,
        // Disable mobile detection entirely
        isMobile: false,
        // Force desktop mode
        forceDesktop: true,
        // Disable mobile-specific features
        disableMobileAppPromo: true,
        enableMobileMode: false
      },
      interfaceConfigOverwrite: {
        // Disable mobile app promotion
        MOBILE_APP_PROMO: false,
        // Hide deep linking
        SHOW_DEEP_LINKING_IMAGE: false,
        // Disable welcome page content
        DISPLAY_WELCOME_PAGE_CONTENT: false,
        // Force disable mobile detection
        MOBILE_DETECTION_ENABLED: false,
        // Hide mobile browser redirect
        SHOW_PROMOTIONAL_CLOSE_PAGE: false,
        // Disable mobile app banner
        SHOW_CHROME_EXTENSION_BANNER: false
      }
    };

    // Load the Jitsi Meet API script if not already loaded
    const createJitsi = () => {
      const api = new window.JitsiMeetExternalAPI(domain, options);
      apiRef.current = api;

      // Show loading overlay until Jitsi injects content into our container.
      try {
        if (jitsiContainerRef.current) {
          // More robust detection: wait for known prejoin DOM markers
          const PREJOIN_SELECTORS = [
            '.prejoin-screen', '.prejoin', '.prejoin-box', '[data-testid="prejoin"]',
            'button[data-testid="prejoin-start-button"]', '[data-testid="join-in-browser"]',
            '#join-in-browser', 'button[aria-label*="Join"]', '.welcome-page', 'iframe'
          ];

          const hasPrejoin = () => {
            try {
              return PREJOIN_SELECTORS.some(sel => !!jitsiContainerRef.current?.querySelector(sel));
            } catch { return false; }
          };

       if (hasPrejoin()) {
            // When prejoin DOM is already present, keep the loader visible
            // for 3 seconds before hiding so users see the transition.
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current);
              loadingTimeoutRef.current = null;
            }
            loadingTimeoutRef.current = window.setTimeout(() => {
              setIsLoading(false);
              loadingTimeoutRef.current = null;
            }, 3000);
          } else {
            const obs = new MutationObserver(() => {
              if (!jitsiContainerRef.current) return;
              if (hasPrejoin() || jitsiContainerRef.current.childElementCount > 0) {
                // schedule hiding the loader after 3s so prejoin UI is visible briefly
                if (loadingObserverRef.current) {
                  loadingObserverRef.current.disconnect();
                  loadingObserverRef.current = null;
                }
                if (loadingTimeoutRef.current) {
                  clearTimeout(loadingTimeoutRef.current);
                  loadingTimeoutRef.current = null;
                }
                loadingTimeoutRef.current = window.setTimeout(() => {
                  setIsLoading(false);
                  loadingTimeoutRef.current = null;
                }, 3000);
              }
            });
            obs.observe(jitsiContainerRef.current, { childList: true, subtree: true });
            loadingObserverRef.current = obs;

            // Fallback: don't stay loading forever — hide after 15s
            loadingTimeoutRef.current = window.setTimeout(() => {
              setIsLoading(false);
              if (loadingObserverRef.current) {
                loadingObserverRef.current.disconnect();
                loadingObserverRef.current = null;
              }
              loadingTimeoutRef.current = null;
            }, 15000);
          }
        }
      } catch (e) {
        setIsLoading(false);
      }

      // Dynamic height adjustment to avoid bottom being cut on mobile
      const setSize = () => {
        try {
          const vh = Math.round((window as any).visualViewport?.height || window.innerHeight);
          if (jitsiContainerRef.current) {
            jitsiContainerRef.current.style.height = `${vh}px`;
          }
          if (apiRef.current && typeof apiRef.current.resize === 'function') {
            apiRef.current.resize('100%', vh);
          }
        } catch {}
      };
      // Initial and delayed adjustments (address bar collapse etc.)
      setSize();
      setTimeout(setSize, 300);
      setTimeout(setSize, 1200);

      const onResize = () => setSize();
      const onOrientation = () => setTimeout(setSize, 150);
      window.addEventListener('resize', onResize);
      window.addEventListener('orientationchange', onOrientation);
      if ((window as any).visualViewport) {
        (window as any).visualViewport.addEventListener('resize', onResize);
      }
      resizeCleanupRef.current = () => {
        window.removeEventListener('resize', onResize);
        window.removeEventListener('orientationchange', onOrientation);
        if ((window as any).visualViewport) {
          (window as any).visualViewport.removeEventListener('resize', onResize);
        }
      };

      // Auto-click "Join in browser" on mobile devices
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        // Wait a bit for the prejoin screen to load, then auto-click "Join in browser"
        setTimeout(() => {
          // Method 1: Look for specific data attributes or IDs
          const joinInBrowserBtn = document.querySelector('a[href*="browser"]') ||
                                  document.querySelector('[data-testid="join-in-browser"]') ||
                                  document.querySelector('#join-in-browser');
          
          if (joinInBrowserBtn) {
            console.log('Auto-clicking "Join in browser" for mobile');
            (joinInBrowserBtn as HTMLElement).click();
            return;
          }

          // Method 2: Search through all links and buttons by text content
          const allElements = document.querySelectorAll('a, button');
          for (const element of allElements) {
            const text = element.textContent?.toLowerCase() || '';
            if (text.includes('join in browser') || text.includes('browser')) {
              console.log('Found "Join in browser" element, clicking...');
              (element as HTMLElement).click();
              return;
            }
          }
        }, 1000);

        // Backup method - try again after more time
        setTimeout(() => {
          const allElements = document.querySelectorAll('a, button, div[role="button"]');
          for (const element of allElements) {
            const text = element.textContent?.toLowerCase() || '';
            if (text.includes('join in browser')) {
              console.log('Backup: Found "Join in browser" element, clicking...');
              (element as HTMLElement).click();
              break;
            }
          }
        }, 3000);
      }
      
      // Track actual Jitsi meeting participants (not just page visits)
      if (roomId) {
        // Track actual meeting join/leave events
        api.addEventListener('videoConferenceJoined', () => {
          if (!hasJoinedRef.current) {
            hasJoinedRef.current = true;
            console.log('User actually joined Jitsi meeting');
            // Notify server that local user joined (existing behavior)
            fetch('/api/room-participants', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ roomId, action: 'join' }),
            }).catch(err => console.error('Failed to update participant count on join:', err));
            // After joining, do an immediate sync to get authoritative count from Jitsi
            scheduleDebouncedSync(200);
            // Start periodic syncs once joined
            startParticipantSync();
          }
        });

        // Save audio/video mute preferences to localStorage
        api.addEventListener('audioMuteStatusChanged', (event: any) => {
          localStorage.setItem('vocably-audio-muted', event.muted.toString());
          console.log('Audio mute status saved:', event.muted);
        });

        api.addEventListener('videoMuteStatusChanged', (event: any) => {
          localStorage.setItem('vocably-video-muted', event.muted.toString());
          console.log('Video mute status saved:', event.muted);
        });

        api.addEventListener('videoConferenceLeft', () => {
          console.log('User actually left Jitsi meeting');
          leaveOnce();
          // After leaving, clear local count
          setParticipantCount(null);
          // Stop any pending syncs to avoid stale writes
          clearSyncs();
        });
        // Listen for participant join/leave events to keep an accurate in-room count
        api.addEventListener('participantJoined', () => {
          // Debounce/coalesce frequent events
          scheduleDebouncedSync(300);
        });
        api.addEventListener('participantLeft', () => {
          scheduleDebouncedSync(300);
        });
        
        // Also handle window/tab close events (only if not already left)
        const handleBeforeUnload = () => {
          leaveOnce();
        };
        const handlePageHide = () => { // iOS Safari back/gesture
          leaveOnce();
        };
        const handlePopState = () => { // SPA back navigation / trackpad gesture
          leaveOnce();
        };
        const handleUnload = () => { // last-resort fallback
          leaveOnce();
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('pagehide', handlePageHide);
        window.addEventListener('popstate', handlePopState);
        window.addEventListener('unload', handleUnload);

        // Cleanup function to remove the event listener
        const cleanupBeforeUnload = () => {
          window.removeEventListener('beforeunload', handleBeforeUnload);
          window.removeEventListener('pagehide', handlePageHide);
          window.removeEventListener('popstate', handlePopState);
          window.removeEventListener('unload', handleUnload);
        };
        
        // Store cleanup function for later use
        (api as any)._cleanupBeforeUnload = cleanupBeforeUnload;
      }
      
      // Inject CSS to customize the close page with Vocably branding
      const style = document.createElement('style');
      style.innerHTML = `
        .closePage, .close-page, .thankyou-container { 
          background: linear-gradient(135deg, #1a1c23 0%, #2a2d35 100%) !important;
          color: #fff !important;
        }
        .closePage h1, .close-page h1, .thankyou-container h1 {
          background: linear-gradient(90deg, #ffe066 0%, #10b981 100%) !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          background-clip: text !important;
          font-weight: 900 !important;
          font-size: 2.5rem !important;
        }
        .closePage::before, .close-page::before, .thankyou-container::before {
          content: "Thank you for using Vocably! 🎉" !important;
          display: block !important;
          font-size: 2rem !important;
          font-weight: bold !important;
          margin-bottom: 1rem !important;
          background: linear-gradient(90deg, #ffe066 0%, #10b981 100%) !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          background-clip: text !important;
        }
      `;
      document.head.appendChild(style);
      
      // Remove the MutationObserver that was hiding the close page
      // Now we want to show our custom Vocably thank you message
      
      // Single readyToClose listener that handles both participant tracking and navigation
      api.addListener('readyToClose', () => {
        // Ensure decrement on Jitsi close
        leaveOnce();
        
        // Clean up participant tracking
        if (roomId && apiRef.current?._cleanupBeforeUnload) {
          apiRef.current._cleanupBeforeUnload();
        }
        
        // Allow Jitsi's thank you page to show for 2 seconds before redirecting
        setTimeout(() => {
          if (jitsiContainerRef.current) {
            jitsiContainerRef.current.style.display = 'none';
            jitsiContainerRef.current.innerHTML = '';
          }
          router.push('/');
        }, 2000); // Show thank you message for 2 seconds
      });
    };

    // Helper: attempt to read Jitsi participant count using API and send it to the server
    function readJitsiParticipantCount(): number | null {
      try {
        if (!apiRef.current) return null;
        // Prefer getNumberOfParticipants if available (returns integer)
        if (typeof apiRef.current.getNumberOfParticipants === 'function') {
          const n = apiRef.current.getNumberOfParticipants();
          if (typeof n === 'number') return Math.max(0, Math.floor(n));
        }
        // Fallback: getParticipantsInfo (may return array)
        if (typeof apiRef.current.getParticipantsInfo === 'function') {
          const info = apiRef.current.getParticipantsInfo();
          if (Array.isArray(info)) return Math.max(0, info.length);
        }
      } catch (err) {
        // ignore
      }
      return null;
    }

    // Debounced scheduler to coalesce multiple Jitsi events into a single authoritative sync.
    function scheduleDebouncedSync(delay = 500) {
      // If the user has left, don't schedule
      if (hasLeftRef.current) return;
      if (pendingSyncTimeoutRef.current) {
        clearTimeout(pendingSyncTimeoutRef.current);
        pendingSyncTimeoutRef.current = null;
      }
      pendingSyncTimeoutRef.current = setTimeout(() => {
        pendingSyncTimeoutRef.current = null;
        if (!hasLeftRef.current) syncAndSendCount();
      }, delay);
    }

    async function syncAndSendCount() {
      if (hasLeftRef.current) return;
      if (syncingRef.current) return; // avoid concurrent sync calls
      syncingRef.current = true;
      try {
        const n = readJitsiParticipantCount();
        if (n === null) return;
        // Update local UI
        setParticipantCount(n);
        // If the local user left while we were reading the count, skip sending to avoid races
        if (hasLeftRef.current) return;
        // Send authoritative count to server (use 'set' action)
        try {
          await fetch('/api/room-participants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId, action: 'set', count: n }),
            keepalive: true as any,
          });
        } catch (err) {
          console.error('Failed to sync participant count:', err);
        }
      } finally {
        syncingRef.current = false;
      }
    }

    // Start a periodic sync to keep server and UI consistent (every 10s)
    function startParticipantSync() {
      if (participantSyncRef.current) clearInterval(participantSyncRef.current);
      participantSyncRef.current = setInterval(() => {
        if (apiRef.current) syncAndSendCount();
      }, 10000);
    }

    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = `https://${domain}/external_api.js`; // Back to HTTPS
      script.async = true;
      script.onload = createJitsi;
      document.body.appendChild(script);
    } else {
      createJitsi();
    }

    return () => {
      // Clean up MutationObserver
      if (joinObserver) {
        joinObserver.disconnect();
      }
      if (loadingObserverRef.current) {
        loadingObserverRef.current.disconnect();
        loadingObserverRef.current = null;
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
  // Reset joined flag; leave flag stays true if we already left
  hasJoinedRef.current = false;
      
      // Clean up participant tracking when component unmounts
      if (roomId && apiRef.current?._cleanupBeforeUnload) {
        apiRef.current._cleanupBeforeUnload();
      }
      // Clear sync intervals/timeouts
      clearSyncs();
      // If unmount happens without explicit leave event, attempt once
      leaveOnce();
      
      if (jitsiContainerRef.current) {
        jitsiContainerRef.current.innerHTML = '';
      }
      if (resizeCleanupRef.current) {
        resizeCleanupRef.current();
        resizeCleanupRef.current = null;
      }
    };
  }, [roomName, subject, roomId, session?.user?.name, router]);

  const LoadingOverlay = () => (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, rgba(16,16,20,0.9), rgba(16,16,20,0.7))', zIndex: 9999 }}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <svg width="48" height="48" viewBox="0 0 50 50" style={{ marginBottom: 12 }}>
          <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="4" />
          <path fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" d="M45 25a20 20 0 0 1-20 20" >
            <animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
          </path>
        </svg>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Loading meeting…</div>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative', width: '100%', height: '100dvh' }}>
      <div
        ref={jitsiContainerRef}
        id="jitsi-container"
        style={{ width: '100%', maxWidth: '100%', height: '100dvh', margin: 0, padding: 0, overflow: 'hidden', background: '#101014' }}
      />
      {isLoading && <LoadingOverlay />}
    </div>
  );
}
