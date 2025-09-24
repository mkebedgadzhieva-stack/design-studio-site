// src/features/auth/GoogleButton.jsx
import { loginWithGoogle } from "./googleLogin";

export default function GoogleButton({ className = "" }) {
  return (
    <button
      onClick={loginWithGoogle}
      className={
        "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 " +
        className
      }
      type="button"
    >
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.1 29.2 35 24 35c-7 0-12.7-5.7-12.7-12.7S17 9.7 24 9.7c3.2 0 6.1 1.2 8.3 3.2l5.7-5.7C34.6 3.5 29.6 1.5 24 1.5 11.6 1.5 1.5 11.6 1.5 24S11.6 46.5 24 46.5 46.5 36.4 46.5 24c0-1.2-.1-2.3-.4-3.5z"/>
        <path fill="#FF3D00" d="M6.3 14.6l6.6 4.8C14.7 15.9 19 13 24 13c3.2 0 6.1 1.2 8.3 3.2l5.7-5.7C34.6 6.5 29.6 4.5 24 4.5 16 4.5 9.1 8.9 6.3 14.6z"/>
        <path fill="#4CAF50" d="M24 43.5c5.1 0 9.8-1.9 13.3-5l-6.1-5c-2 1.4-4.6 2.2-7.2 2.2-5.2 0-9.6-3.4-11.2-8l-6.6 5.1C9 38.9 15.9 43.5 24 43.5z"/>
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.8-6.6 7.3l6.1 5C38.7 38.9 42 32.4 42 24c0-1.2-.1-2.3-.4-3.5z"/>
      </svg>
      Войти через Google
    </button>
  );
}
