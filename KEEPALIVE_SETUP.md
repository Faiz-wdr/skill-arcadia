# Supabase Free-Plan Keepalive Setup Guide

An automated, background keep-alive system that generates legitimate database activity in Supabase every 2 days using **GitHub Actions → Supabase Edge Function → Private PostgreSQL Table**.

---

## 1. Purpose

Supabase Free-tier projects may be paused after 7 days of inactivity (no database requests, API queries, or dashboard access). This system executes a lightweight, harmless timestamp update on an isolated private table once every 2 days to maintain project activity, ensuring zero downtime even when there is no public visitor traffic or registrations.

> [!WARNING]
> **Important Platform Limitation**: This mechanism generates regular database queries and Edge Function invocations, which reduces the likelihood of inactivity pausing under standard conditions. However, **it is not an official 100% guarantee**. Supabase reserves the right to determine project activity based on its internal platform policies.

---

## 2. Architecture Overview

```
+-------------------------------------------------------------+
| GitHub Actions Scheduled Workflow                           |
|   - File: .github/workflows/supabase-keepalive.yml           |
|   - Trigger: Cron ("17 3 */2 * *") & manual dispatch        |
|   - Secrets: SUPABASE_PROJECT_REF, SUPABASE_KEEPALIVE_TOKEN  |
+------------------------------+------------------------------+
                               | HTTPS POST
                               | Header: X-Keepalive-Token
                               v
+-------------------------------------------------------------+
| Supabase Edge Function                                      |
|   - File: supabase/functions/keepalive/index.ts             |
|   - Validates X-Keepalive-Token against KEEPALIVE_TOKEN     |
|   - Uses internal SUPABASE_SERVICE_ROLE_KEY                 |
+------------------------------+------------------------------+
                               | UPDATE private.keepalive
                               v
+-------------------------------------------------------------+
| Supabase PostgreSQL Database                                |
|   - Table: private.keepalive                                |
|   - Updates: last_checked_at = now() for id = 1             |
|   - Security: RLS enabled; REVOKE ALL from anon, authenticated |
+-------------------------------------------------------------+
```

### Complete Separation from Frontend
- **Zero Frontend Changes**: No code, UI, or client scripts have been added or altered.
- **No Client Timers**: No `setInterval`, `setTimeout`, hidden iframes, or browser keepalive requests.
- **No Fake Data**: No fake user registrations, dummy webinars, or artificial page views.

---

## 3. Database Schema & Migration

The migration has already been created in [`supabase/migrations/20260913194500_create_keepalive.sql`](file:///Users/faiz/Websites/Webinar%20Landing%20Page/supabase/migrations/20260913194500_create_keepalive.sql) and executed on the database:

```sql
-- 1. Create dedicated private schema
CREATE SCHEMA IF NOT EXISTS private;

-- 2. Create private.keepalive table
CREATE TABLE IF NOT EXISTS private.keepalive (
  id integer PRIMARY KEY,
  last_checked_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Seed initial row
INSERT INTO private.keepalive (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE private.keepalive ENABLE ROW LEVEL SECURITY;

-- 5. Revoke all access from public client roles
REVOKE ALL ON SCHEMA private FROM anon, authenticated;
REVOKE ALL ON TABLE private.keepalive FROM anon, authenticated;
```

---

## 4. Edge Function

The Edge Function is located at [`supabase/functions/keepalive/index.ts`](file:///Users/faiz/Websites/Webinar%20Landing%20Page/supabase/functions/keepalive/index.ts).

- **Method**: `POST` only (returns `405 Method Not Allowed` for `GET`, `PUT`, `DELETE`).
- **Authentication**: Requires matching `X-Keepalive-Token` header (returns `401 Unauthorized` on mismatch).
- **Service Role**: Utilizes the runtime `SUPABASE_SERVICE_ROLE_KEY` internally to access `private.keepalive`.

---

## 5. Required Configuration & Secrets

### A. Generated Secret Token
A cryptographically secure token has been generated for this setup:

```text
f0f793a331cf997155f2d766dd2dd3cea15b7df85ea32fd622daa52a9313d9ef
```

*(You may also generate a new token at any time using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)*

### B. Supabase Edge Function Secrets
Set the secret in your Supabase project using either the Supabase CLI or the Web Dashboard:

#### Option 1: Supabase Dashboard
1. Go to **Supabase Dashboard** → **Project Settings** → **Edge Functions** (or **Edge Functions** tab in the sidebar).
2. Click **Manage Secrets** → **Add new secret**.
3. Name: `KEEPALIVE_TOKEN`
4. Value: `f0f793a331cf997155f2d766dd2dd3cea15b7df85ea32fd622daa52a9313d9ef`
5. Save.

#### Option 2: Supabase CLI
```bash
npx supabase secrets set KEEPALIVE_TOKEN="f0f793a331cf997155f2d766dd2dd3cea15b7df85ea32fd622daa52a9313d9ef" --project-ref pgrqqrvuasaouskmssap
```

*(Note: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically provided by the Supabase Edge Function runtime; you do not need to enter them manually).*

---

### C. GitHub Repository Secrets
Add the following 2 repository secrets in GitHub:

1. Go to your repository on GitHub: [`https://github.com/Faiz-wdr/skill-arcadia`](https://github.com/Faiz-wdr/skill-arcadia)
2. Click **Settings** → **Secrets and variables** → **Actions**.
3. Click **New repository secret**:
   - **Secret 1**:
     - Name: `SUPABASE_PROJECT_REF`
     - Value: `pgrqqrvuasaouskmssap`
   - **Secret 2**:
     - Name: `SUPABASE_KEEPALIVE_TOKEN`
     - Value: `f0f793a331cf997155f2d766dd2dd3cea15b7df85ea32fd622daa52a9313d9ef`

---

## 6. Edge Function Deployment Command

Deploy the Edge Function to Supabase:

```bash
# 1. Login to Supabase CLI (one-time)
npx supabase login

# 2. Deploy the keepalive function
npx supabase functions deploy keepalive --project-ref pgrqqrvuasaouskmssap
```

Once deployed, the function endpoint will be live at:
```text
https://pgrqqrvuasaouskmssap.supabase.co/functions/v1/keepalive
```

---

## 7. How to Test Manually

### Test 1: Test with Incorrect Token (Expected: HTTP 401)
```bash
curl -i -X POST https://pgrqqrvuasaouskmssap.supabase.co/functions/v1/keepalive \
  -H "Content-Type: application/json" \
  -H "X-Keepalive-Token: wrong-token"
```
**Expected Output**:
```json
HTTP/1.1 401 Unauthorized
{"error":"Unauthorized"}
```

### Test 2: Test with Correct Token (Expected: HTTP 200)
```bash
curl -i -X POST https://pgrqqrvuasaouskmssap.supabase.co/functions/v1/keepalive \
  -H "Content-Type: application/json" \
  -H "X-Keepalive-Token: f0f793a331cf997155f2d766dd2dd3cea15b7df85ea32fd622daa52a9313d9ef"
```
**Expected Output**:
```json
HTTP/1.1 200 OK
{"ok":true,"timestamp":"2026-09-13T..."}
```

### Test 3: Run the GitHub Actions Workflow Manually
1. Go to [`https://github.com/Faiz-wdr/skill-arcadia/actions`](https://github.com/Faiz-wdr/skill-arcadia/actions)
2. Select **Supabase Keepalive** in the left sidebar.
3. Click **Run workflow** → select branch `main` → click **Run workflow**.
4. Observe the green checkmark showing successful execution.

---

## 8. Verifying Database Activity in Supabase

You can verify that the timestamp is updating at any time by running the following SQL query in the **Supabase SQL Editor**:

```sql
SELECT * FROM private.keepalive;
```

**Expected Result**:
| id | last_checked_at |
| :--- | :--- |
| `1` | `2026-09-13 19:46:54.267+00` |

Every time the GitHub Action or curl command runs, `last_checked_at` updates to the current timestamp.

---

## 9. Security Considerations

1. **`SERVICE_ROLE_KEY` Protection**:
   - The service role key is NEVER stored in Git, GitHub Actions, or client-side bundles.
   - It only lives in the Supabase Edge Function isolated sandbox.
2. **Strict RLS & Schema Revocation**:
   - `private.keepalive` cannot be accessed by `anon` or `authenticated` users via the client SDK.
   - Attempting to query `private.keepalive` with the anon key yields `406 Invalid schema: private`.
3. **Dedicated Table**:
   - Does not touch, lock, or read attendee data in `public.registrations` or `public.webinars`.
