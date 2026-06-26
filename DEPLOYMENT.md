# Deployment & CI/CD

Alivon ships through a GitHub Actions pipeline ([`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml))
that deploys to **Vercel**.

## Pipeline

```
push / PR to main
  └─ ci      : npm ci → lint → tsc --noEmit → next build
push to main (only, and only if ci passed)
  └─ deploy  : vercel pull → vercel build --prod → vercel deploy --prebuilt --prod
```

- **PRs** run `ci` only — nothing deploys until it merges to `main`.
- **Pushes to `main`** run `ci`, then `deploy`. The deploy is gated on `ci` via `needs: ci`.

## One-time setup

You only do this once. After that, every push to `main` deploys automatically.

### 1. Create the Vercel project

1. Sign in at [vercel.com](https://vercel.com) and import `m75-ali/alivon`.
2. Framework preset: **Next.js** (auto-detected). Accept defaults.
3. **Turn off Vercel's automatic Git deployments** so the pipeline is the only
   thing that deploys: Project → Settings → Git → disable "Production Branch"
   auto-deploy (or set the Ignored Build Step to exit 0). Optional but keeps the
   "CD is owned by GitHub Actions" story clean.

### 2. Set production env vars in Vercel

Project → Settings → Environment Variables, scope **Production**:

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | your Supabase publishable key |

`vercel pull` reads these at deploy time, so they live in Vercel, not in CI.

### 3. Get the Vercel IDs and token

```sh
npm i -g vercel
vercel login
vercel link            # run in the repo root; creates .vercel/project.json
cat .vercel/project.json   # → projectId and orgId
```

Create a token at Vercel → Account Settings → Tokens.

### 4. Add GitHub repository secrets

Repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Where it comes from |
| --- | --- |
| `VERCEL_TOKEN` | the token from step 3 |
| `VERCEL_ORG_ID` | `orgId` in `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | `projectId` in `.vercel/project.json` |
| `NEXT_PUBLIC_SUPABASE_URL` | same as Vercel (used by the `ci` build job) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | same as Vercel |

### 5. Supabase auth redirect URLs

Once you have the Vercel production URL, add it in Supabase → Authentication →
URL Configuration (Site URL + Redirect URLs), or email confirmation / OAuth
links will point at localhost.

## Database migrations

Migrations in [`supabase/migrations/`](supabase/migrations/) are **not** run by this
pipeline. Apply them manually in the Supabase dashboard SQL editor (the CLI isn't
linked). The latest unapplied one is `20260625000004_v2_reconcile.sql`.
