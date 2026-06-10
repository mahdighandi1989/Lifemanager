import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Loads the Google Identity Services script once and resolves when ready.
let gsiPromise = null;
function loadGsi() {
  if (gsiPromise) return gsiPromise;
  gsiPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('failed to load Google script'));
    document.head.appendChild(s);
  });
  return gsiPromise;
}

/**
 * "Sign in with Google" button backed by Google Identity Services.
 *
 * The OAuth client id is fetched at runtime from the backend's /auth/config
 * (no build-time env var needed). On a successful credential the component
 * exchanges it for our session via AuthContext.loginWithGoogle and routes the
 * user to "/" (or the pending screen, handled by ProtectedRoute).
 */
function GoogleLoginButton({ onError }) {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const btnRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/auth/config');
        if (!res.ok) return; // router not mounted (no GOOGLE_CLIENT_ID) → hide
        const cfg = await res.json();
        if (cancelled || !cfg.google_enabled || !cfg.google_client_id) return;
        await loadGsi();
        if (cancelled) return;
        window.google.accounts.id.initialize({
          client_id: cfg.google_client_id,
          callback: async (resp) => {
            try {
              await loginWithGoogle(resp.credential);
              navigate('/');
            } catch (e) {
              onError?.(e.message || 'ورود با گوگل ناموفق بود');
            }
          },
        });
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'pill',
          width: 320,
        });
        setEnabled(true);
      } catch {
        // Google sign-in unavailable — stay silent, the password form remains.
      }
    })();
    return () => { cancelled = true; };
  }, [loginWithGoogle, navigate, onError]);

  // IMPORTANT: the button container (btnRef) is ALWAYS rendered — never gated
  // behind `enabled`. The effect calls google.accounts.id.renderButton(btnRef
  // .current, …) on mount, so the node MUST already be in the DOM at that
  // point; if we returned null until `enabled`, btnRef.current would be null
  // when renderButton runs and Google would paint nothing (the symptom: an
  // empty space with only the "یا" divider showing). Only the divider is
  // gated on `enabled`, so a deploy without Google configured shows nothing.
  return (
    <div className="mt-2">
      {enabled && (
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">یا</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
      )}
      <div className="flex justify-center" ref={btnRef} />
    </div>
  );
}

export default GoogleLoginButton;
