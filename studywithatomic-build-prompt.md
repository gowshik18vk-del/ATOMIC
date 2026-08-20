# Build Prompt: StudyWithAtomic

Paste this into Lovable (or Antigravity / whatever AI builder you're using). I've filled in sensible defaults where your instructions were open-ended — flag anything you want changed.

---

## App Overview

Build a study platform called **StudyWithAtomic** where students search for a chapter/topic by name and get curated YouTube videos (tagged Easy or Hard) that play **inside the app** — never redirecting to youtube.com. Only an admin can upload/manage videos. Auth is via Google Sign-In.

## 1. Authentication

- Google OAuth sign-up/sign-in only (no email/password).
- On successful sign-in, create a `users` record: `id, email, name, avatar_url, role, created_at`.
- **First user ever to sign up automatically gets `role = "admin"`.** Every user after that gets `role = "student"` by default.
- Store role server-side (not just in the frontend) so it can't be spoofed.

## 2. Data Model

**`users`**
- id, email, name, avatar_url, role (`admin` | `student`), created_at

**`videos`**
- id, youtube_video_id (the 11-char YouTube ID, not a full URL), title, chapter_name, difficulty (`easy` | `hard`), uploaded_by (FK → users.id), created_at

Index `chapter_name` for fast search/autocomplete.

## 3. Admin Features (role = admin only)

- An "Upload Video" screen, hidden/blocked for non-admins (enforce this on the backend, not just by hiding the UI button).
- Form fields: YouTube URL or video ID, Title, Chapter Name, Difficulty (Easy/Hard toggle).
- On submit: parse the YouTube ID out of the URL if a full link is pasted, validate it, save to `videos`.
- A simple video management list: edit chapter/difficulty, delete a video.

## 4. Student Features

- Search bar: type a chapter name → live-search/autocomplete against `chapter_name`.
- Results grouped into two sections: **Easy** and **Hard**.
- Clicking a video opens the **in-app player** (see below) — it must never open or redirect to youtube.com.

## 5. In-App Video Player (no redirect to YouTube)

Use the **YouTube IFrame Player API** embedded inside the app's own UI, with a custom control bar built on top (hide YouTube's native controls, use the API to drive playback). Controls to include — **only these**:
- Play / Pause
- Skip forward / back (e.g. ±10s)
- Playback speed (0.5x / 1x / 1.25x / 1.5x / 2x)
- Quality selector (Auto / 1080p / 720p / 480p / 360p, using `setPlaybackQuality`)

**Important technical note (please read before building):** The YouTube IFrame API is the only supported way to embed playback without sending users to youtube.com, and it keeps playback fully in-app. However, YouTube's Terms of Service require the player to remain a genuine YouTube embed — you can hide the default control bar and build your own, but you can't strip the YouTube logo entirely or download/rehost the video files. That constraint doesn't affect any of the controls you listed above; it just means there'll be a small YouTube watermark on the embed itself, which is expected and compliant.

## 6. Tech Notes for the Builder

- Backend/auth/DB: use your project's existing backend (e.g. Supabase, if that's what your Lovable project is already wired to) — reuse the existing users table if one exists rather than creating a duplicate.
- Enforce the admin-only upload restriction with a database rule/policy (e.g. row-level security), not just client-side checks.
- Mobile-responsive layout for both the search/browse view and the player view.

---

**Assumptions I made that you should double check:** difficulty is binary (Easy/Hard only, no "medium"), skip is ±10 seconds, and the app reuses your existing Lovable/Supabase project rather than starting fresh. Say the word if any of those should change.
