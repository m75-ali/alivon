# Alivon — Project Brief for Claude Code (V2: Social Layer) — Reconciled

This is the V2 brief rewritten to match what V1 actually built, with right-sized
safety/GDPR for a **first app run by one person**, not a corporation. The guiding
rule is unchanged: **when in doubt, do less, not more.**

---

## 0. Where V1 actually landed (so brief and build agree)

V1 is built and the build is clean (`tsc`, eslint, `next build` all pass). It is also
**live in production** at https://alivon.io (Vercel + GitHub Actions CI/CD — see §2), and
the §3 reconcile work below is **done**. Two things differ from how the V1 brief was
written — both are correct, just reality:

- **Tailwind v4 has no `tailwind.config.ts`.** The brand palette lives as `@theme inline`
  CSS variables in `app/globals.css`. Same colours, same `bg-alivon-*` class names.
  Ignore any instruction below to edit `tailwind.config.ts`.
- **Auth/route protection lives in `proxy.ts`, not `middleware.ts`.** Next.js 16 renamed
  the convention. New request-time logic goes in `proxy.ts`.

V1 also shipped a **quest completion lifecycle** beyond the original V1 brief. Rather than
rip it out, V2 adopts it because the social layer gives it a real job (see §5). What exists:
- `quests.status`: `active | paused | completed | archived` (post-§3; `abandoned` was
  dropped), plus `completed_at` and a completion "capstone" (`completion_note`,
  `completion_image_url`, `completion_mood`).
- A `/completed` page, a "Mark complete" flow with a 100%-progress nudge, and pause/resume.

These are **kept** and documented here. The §3 cleanups (drop the redundant `abandoned`
state, restore `archived`, soften the gamified tone) are **done**.

---

## 1. Prerequisite (unchanged, and it matters)

Do not start V2 feature work until V1 has been **live and used for a few weeks with real
logged activity**. V2 amplifies an existing habit; it can't create one. If nobody returns
to log updates, building a social layer is wasted effort.

**Status (2026-06-26):** the §3 cleanup is **done** and the app is **live** at
https://alivon.io. The clock on "live and used for a few weeks" has now started — V1 is
out for real users and feedback. The social layer stays parked until returning-usage
evidence exists; there is **no reconcile work left** to do in the meantime.

---

## 2. Stack (as built)

- Next.js 16.2.9 (App Router, Turbopack), React 19, TypeScript strict.
- Tailwind v4 (palette in `app/globals.css`).
- Supabase (Auth + Postgres + RLS + private Storage) via `@supabase/ssr`. Hosted, not local.
- Env keys in `.env.local` for local dev. Env vars are `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (both public — they compile into the client bundle).
- **Hosting/CI-CD:** deployed on **Vercel** at `alivon.io` (apex domain, Cloudflare DNS
  `A → 76.76.21.21`, DNS-only). **GitHub Actions** (`.github/workflows/ci-cd.yml`) runs
  lint + typecheck + build on every push/PR to `main`, then deploys to Vercel on push to
  `main` (gated on CI). The two `NEXT_PUBLIC_*` values are inlined into the build from
  **GitHub secrets** — not Vercel env storage, which silently stored them empty and broke
  prod. See `DEPLOYMENT.md`. Migrations are still applied **manually** in the Supabase SQL
  editor (CLI not linked); the pipeline does not run them.

---

## 3. Reconcile-first tasks — ✅ DONE (2026-06-26)

Cheap hygiene that makes the base honest. One migration plus a couple of small edits.
All four shipped in migration `20260625000004_v2_reconcile.sql` (applied) and in-place
code edits; `tsc`/eslint clean.

1. **Cleanup migration on `quests`:** ✅
   - Status enum → `active | paused | completed | archived` (drop `abandoned`).
   - Add `visibility text not null default 'private' check (visibility in ('private','public'))`.
   - Add `nudges_enabled boolean not null default true`.
2. **DB-level length limits.** ✅ `CHECK (char_length(col) <= N)` matching the frontend
   `maxLength` values (quest title 100, description 500, item title 100, item desc 500,
   note 1000).
3. **Item delete rule.** ✅ quest items with **zero** log entries can be permanently deleted
   from the backlog; items with **at least one** log entry can only be skipped, preserving
   journal history. (`getQuestItems` returns `has_logs`; Delete button + `deleteItem` action
   in the backlog page.)
4. **Soften completion tone.** ✅ kept the feature, removed the 🏆/🎉 gamified styling so it
   reads calm. *(Superseded 2026-06-26 — see §9: the direction is now tasteful gamification,
   and celebratory moments return deliberately as reward features.)*

No new abstractions for any of this. Done by editing the existing files in place.

---

## 4. Security & GDPR (right-sized for a first app)

These are non-negotiable but deliberately minimal — the floor a public social app needs,
nothing enterprise.

**Keep doing (already in place):**
- **RLS on every table**, scoped to `auth.uid()`. Confirm active before building any screen
  that queries a new table. Use the `(select auth.uid())` form.
- **Private storage bucket**, images via server-side **signed URLs** only.
- **`ON DELETE CASCADE`** on every FK to `auth.users` — applies to all new V2 tables too, so
  the existing `delete_user()` RPC keeps wiping everything on account deletion.
- **No analytics/tracking cookies.** Defer PostHog until there's a cookie-consent banner.

**New for the social layer (kept simple):**
- **Public vs private RLS:** public quests and their log entries are readable by any
  authenticated user; private quests stay owner-only exactly as in V1. Default visibility is
  **private** — going public is always a deliberate choice.
- **Store plain text, render as text.** Comments, bios, usernames are never rendered as HTML.
  React escapes by default — just don't add `dangerouslySetInnerHTML`. That's your XSS defence;
  no sanitiser library needed.
- **Length limits everywhere**, frontend + DB CHECK: username ≤ 30, display_name ≤ 50,
  bio ≤ 300, comment ≤ 500.
- **Username rules:** unique, lowercase, `[a-z0-9_]` only, 3–30 chars. Validate on the
  frontend and enforce `unique` in the DB.
- **Block a user (minimal):** a `blocks` table so a user can hide another user's reactions/
  comments and prevent them following or nudging. This is the one piece of moderation a public
  app genuinely needs on day one. Heavier moderation (reporting queues, admin tools) is **out
  of scope** — flag it if it ever becomes necessary.
- **Nudge emails:** opt-in per quest (`nudges_enabled`), never reveal private quest data in
  the email, and include a way to stop them. Don't send to paused or completed quests.

**GDPR:**
- Keep the existing `/privacy` page; **update it** to describe public profiles, social
  interactions, and nudge emails.
- "Delete my account" already exists and cascades — verify it removes profile, follows,
  reactions, comments, and blocks after the new tables exist.
- Public profile data (username, bio, avatar) is user-controlled and editable/clearable.

That's the whole list. No rate-limiting infra, no WAF, no audit logs — a first app with a
handful of users does not need them. Note them as "later if you ever get real scale," not now.

---

## 5. New / changed data model

```
profiles (extends auth.users)
- id            uuid pk, fk auth.users on delete cascade
- username      text unique not null        -- lowercase [a-z0-9_], 3–30
- display_name  text                        -- ≤ 50
- bio           text                        -- ≤ 300
- avatar_url    text                        -- path in private bucket; signed on read

follows
- id            uuid pk
- follower_id   uuid fk auth.users on delete cascade
- following_id  uuid fk auth.users on delete cascade
- created_at    timestamptz default now()
- unique (follower_id, following_id)         -- no duplicate follows; no self-follow (CHECK)

reactions
- id            uuid pk
- log_entry_id  uuid fk log_entries on delete cascade
- user_id       uuid fk auth.users on delete cascade
- type          text default 'like'         -- one type for now
- created_at    timestamptz default now()
- unique (log_entry_id, user_id)             -- one reaction per user per entry

comments
- id            uuid pk
- log_entry_id  uuid fk log_entries on delete cascade
- user_id       uuid fk auth.users on delete cascade
- body          text not null               -- ≤ 500, stored/rendered as plain text
- created_at    timestamptz default now()

blocks
- id            uuid pk
- blocker_id    uuid fk auth.users on delete cascade
- blocked_id    uuid fk auth.users on delete cascade
- created_at    timestamptz default now()
- unique (blocker_id, blocked_id)

quests (additions in §3)
- visibility       'private' | 'public'  default 'private'
- nudges_enabled   boolean default true
```

**Profile creation:** create the profile row at signup (a Supabase trigger on `auth.users`
insert is the simplest, or a one-time step right after sign-up). This touches a V1 flow — it's
additive and required, so it's fine, but keep it minimal.

---

## 6. Screens to build, in priority order

Reuse V1 patterns and components. Each item notes where existing build slots in.

1. **Profile page** — username, display name, bio, avatar, and the user's **public quests
   (including completed ones)**. Editable for own profile, read-only for others.
   *This absorbs the V1 `/completed` shelf — completed public quests live here, not on a
   separate trophy page.*

2. **Quest visibility toggle** — on Create Quest and a new **quest-settings screen** (edit
   title/description/category/visibility). Default private.
   *The settings screen also closes V1's "can't edit a quest after creation" gap.*

3. **Follow / unfollow** — follow button on profiles, follower/following counts. Plain counts,
   no leaderboards.

4. **Feed** — reverse-chronological feed of **log entries and quest completions** from people
   you follow. **Reuse the V1 `Timeline`/`EntryCard`**, don't build a parallel system.
   *Extract V1's completion "capstone" card into a shared `CompletionCard` so a completed quest
   appears as a feed event with its closing note/photo. This is the job that makes the V1
   completion work worth keeping.*

5. **Reactions and comments** — like + comment on individual log entries. One reaction type,
   no nested replies, no comment notifications yet.

6. **Accountability nudge** — a follower can tap to send a lightweight email to someone who
   hasn't logged in N days on a **public** quest. Respects `nudges_enabled`; skips paused and
   completed quests; easy to disable.
   *This is the job that makes V1's pause/resume worth keeping — pause = "don't nudge me."*

---

## 7. V1 features V2 formally adopts (now documented, not accidental)

So the build and the brief agree:
- **Quest completion** (`completed` status + `completed_at`) → powers "quest completions" in
  the Feed.
- **Completion capstone** (note/photo/mood) → the content of a completion feed card.
- **Pause/resume** → nudge exemption + an honest "not active right now" signal.
- **"Done ✓" on backlog items, navbar links, timeline↔backlog cross-links** → kept as-is.

---

## 8. Explicitly OUT of scope for V2

- AI content generation
- Shared/group challenges
- Direct messaging
- Full notification inbox beyond nudges and follow alerts
- Moderation tooling beyond block (reporting queues, admin panels)
- Rate limiting, audit logs, anti-abuse infra — revisit only at real scale
- Public like/follower counts styled as competitive metrics
- Native mobile app
- Anything not listed above — flag it and wait, even if it seems obvious

---

## 9. Design direction — *updated 2026-06-26: tasteful gamification*

**Direction change (owner decision).** The original "calm, no gamification" stance is
superseded. The app felt too plain, and the goal now is a **rewarding, dopamine-positive
feel that brings people back** — *tastefully*. The line we hold:

- **Reward progress, not performance.** Celebrate the user's own milestones (streaks,
  completion moments, "win logged" beats). Still **no leaderboards** and no public
  like/follower counts styled as competitive metrics (§8 unchanged) — the dopamine comes
  from *your* progress, not from beating others.
- **Alive, not loud.** Ambient motion and earned celebration, never clutter. Background
  delight (e.g. faint floating "quest objects" drifting in the whitespace) must **never take
  focus from the user's intent** — low opacity, slow motion, `pointer-events-none`, and it
  honours `prefers-reduced-motion`.
- **Earned, not constant.** Celebratory beats (confetti, cheers) fire on real achievements
  (logging a win, completing a quest), not on every tap.
- Still **clean, mobile-first, accessible**. Gamification is a layer on top, not a rewrite.

This **supersedes §3.4** (which had stripped the 🏆/🎉). Those were removed during the calm
phase; celebratory moments now return deliberately as reward features. The "win logged" 🎉 in
`LogForm` is on-brand again under this direction.

**Build order for the gamified layer (each on its own branch + PR — see §11/CI):**
1. *Ambient background objects* — floating decorative quest objects (Tailwind/CSS + lucide
   SVGs). Pure polish, no data model. **(in progress)**
2. *Reward moments* — streak tracking (a small amount of new DB state) and completion
   confetti / win-logged celebration beats.
3. Anything beyond that (XP, levels, badges, point economy) stays **out of scope** until
   feedback proves demand — flag and wait, per §8.

---

## 10. AI coding guardrails (read before every session)

When in doubt, do less, not more.

**Scope**
- Build only what is listed here. Flag extras as suggestions; don't add them unilaterally.
- **V1 code stays unchanged unless a V2 feature explicitly needs it.** If a V1 change seems
  necessary, flag it and confirm first.
- **If a feature needs more than 3 new files, stop and ask for a simpler approach first** —
  and when asked, recommend the *simpler* option, not the fancier one. (This is exactly where
  V1 over-built.)
- No abstractions unless used in at least two places.

**File structure**
- Extend the V1 structure, don't reorganise it. New Supabase queries go in `lib/supabase/`,
  one file per table, beside the existing ones.
- Name files after what they display (`ProfileCard.tsx`, not `UserProfileDisplayWithState.tsx`).
- After every session, check the file tree. If a simple feature added more than 3–4 files,
  consolidate before moving on.

**Data fetching**
- Page/route level only, passed down as props. No `useEffect` + fetch in nested components.

**Schema first**
- New tables and RLS confirmed before any UI for that feature. Never alter V1 tables without an
  explicit migration file.

**Backwards compatibility**
- Every V1 flow must keep working unchanged. After each session, test the core V1 loop:
  create quest → log entry → view timeline.

**Code ownership**
- After every session, read the new code and be able to explain every file and function in
  plain English. If you can't, simplify or annotate before moving on. Unexplained AI code is
  debt, not progress.

---

## 11. Definition of done for V2

A user can: make a quest public, follow another user, see their public activity (log entries
and quest completions) in a feed, react to and comment on a log entry, block someone, and view
any public profile. **All V1 private-journal behaviour works unchanged** for users who never go
public.
