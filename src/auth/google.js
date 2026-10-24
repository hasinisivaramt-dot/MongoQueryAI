// Google Sign-In helper (Google Identity Services, OAuth 2.0 popup flow).
// No npm package needed — the GIS script is loaded on demand.
//
// Setup: create an OAuth 2.0 "Web application" client ID in Google Cloud Console,
// add your origins (e.g. http://localhost:5173) under "Authorised JavaScript origins",
// then put the client ID in .env as VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const GIS_SRC = 'https://accounts.google.com/gsi/client';
let gisPromise = null;

function loadGis() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (gisPromise) return gisPromise;
  gisPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = GIS_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => { gisPromise = null; reject(new Error('Could not load Google Sign-In. Check your connection.')); };
    document.head.appendChild(s);
  });
  return gisPromise;
}

/**
 * Opens the Google account chooser popup and resolves with the profile:
 * { sub, name, email, emailVerified, picture }
 */
export async function signInWithGoogle() {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Google Sign-In is not configured. Add VITE_GOOGLE_CLIENT_ID to your .env file.');
  }
  await loadGis();

  const accessToken = await new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'openid email profile',
      callback: (resp) => {
        if (resp.error) reject(new Error(resp.error_description || 'Google sign-in was cancelled.'));
        else resolve(resp.access_token);
      },
      error_callback: (err) => {
        reject(new Error(err?.type === 'popup_closed' ? 'Google sign-in was cancelled.' : 'Google sign-in failed. Please try again.'));
      },
    });
    client.requestAccessToken({ prompt: 'select_account' });
  });

  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Could not fetch your Google profile.');
  const p = await res.json();
  return {
    sub: p.sub,
    name: p.name || p.email?.split('@')[0] || 'User',
    email: p.email,
    emailVerified: !!p.email_verified,
    picture: p.picture || null,
  };
}
