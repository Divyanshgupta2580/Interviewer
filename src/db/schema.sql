/*
# Integration Schema — Rituraj's exact schema (v2)
# Tables for Rituraj's automation scripts and Rewas's mock interview scoring.
#
# ⚡ Run this in your Supabase SQL Editor (supabase.com → SQL Editor → New query)
#    AFTER the previous three migrations have been applied.
#
# Tables:
#   - project_live_checks     → Rituraj's Playwright link-checker output
#   - discovered_jobs         → Rituraj's job scraper (Greenhouse/Lever/RSS)
#   - readiness_scores        → Rituraj's aggregated X/100 score per student
#   - mock_interview_results  → Rewas's voice interview transcripts & score
#
# View:
#   - latest_student_mock_interviews → Latest interview attempt per student
#
# Note on student_id:
#   Rituraj's scripts use TEXT for student_id (Supabase user ID as string).
#   Your frontend uses UUID. Both are the same value — just different types.
#   The foreign key to auth.users is omitted here so Rituraj can write freely
#   with just the service role key before a profile row even exists.
*/


-- ============================================================================
-- 1. project_live_checks
--    Populated by Rituraj's Playwright link-checker script.
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_live_checks (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id          TEXT NOT NULL,
    project_name        TEXT,
    project_url         TEXT NOT NULL,
    status_code         INTEGER,
    is_live             BOOLEAN NOT NULL DEFAULT false,
    load_time_ms        INTEGER,
    mobile_friendly     BOOLEAN DEFAULT false,
    screenshot_url      TEXT,
    console_errors      JSONB DEFAULT '[]'::jsonb,
    network_errors      JSONB DEFAULT '[]'::jsonb,
    content_evaluation  JSONB DEFAULT '{}'::jsonb,
    quality_score       NUMERIC(5, 2) DEFAULT 0.0,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_checks_student ON project_live_checks(student_id);
CREATE INDEX IF NOT EXISTS idx_live_checks_url     ON project_live_checks(project_url);


-- ============================================================================
-- 2. discovered_jobs
--    Populated by Rituraj's job scraper (Greenhouse / Lever / RSS feeds).
-- ============================================================================
CREATE TABLE IF NOT EXISTS discovered_jobs (
    id               TEXT PRIMARY KEY,
    title            TEXT NOT NULL,
    company          TEXT NOT NULL,
    location         TEXT,
    url              TEXT NOT NULL UNIQUE,
    source           TEXT NOT NULL,
    matched_skills   JSONB DEFAULT '[]'::jsonb,
    relevance_score  NUMERIC(5, 2) DEFAULT 0.0,
    match_reason     TEXT,
    is_remote        BOOLEAN DEFAULT false,
    job_type         TEXT DEFAULT 'internship/entry-level',
    posted_at        TIMESTAMPTZ DEFAULT NOW(),
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_relevance ON discovered_jobs(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_company   ON discovered_jobs(company);


-- ============================================================================
-- 3. readiness_scores
--    Written by Rituraj's scoring algorithm (aggregates resume + interview).
-- ============================================================================
CREATE TABLE IF NOT EXISTS readiness_scores (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id       TEXT NOT NULL UNIQUE,
    total_score      NUMERIC(5, 2) NOT NULL,
    readiness_level  TEXT NOT NULL CHECK (readiness_level IN ('Not ready', 'Almost ready', 'Placement ready')),
    breakdown        JSONB NOT NULL,
    top_actions      JSONB NOT NULL,
    raw_inputs       JSONB DEFAULT '{}'::jsonb,
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_readiness_level ON readiness_scores(readiness_level);


-- ============================================================================
-- 4. mock_interview_results
--    Written by Rewas's LiveKit voice agent at the end of each session.
-- ============================================================================
CREATE TABLE IF NOT EXISTS mock_interview_results (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id           TEXT NOT NULL,
    attempt_number       INTEGER NOT NULL DEFAULT 1,
    interview_score      NUMERIC(5, 2) NOT NULL CHECK (interview_score >= 0.0 AND interview_score <= 100.0),
    technical_score      NUMERIC(5, 2) DEFAULT 0.0,
    communication_score  NUMERIC(5, 2) DEFAULT 0.0,
    behavioral_score     NUMERIC(5, 2) DEFAULT 0.0,
    strengths            JSONB DEFAULT '[]'::jsonb,
    weak_areas           JSONB DEFAULT '[]'::jsonb,
    feedback_notes       TEXT,
    transcript           JSONB NOT NULL DEFAULT '[]'::jsonb,
    mode                 TEXT DEFAULT 'hosted_api' CHECK (mode IN ('hosted_api', 'ollama_local')),
    duration_minutes     INTEGER DEFAULT 15,
    created_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mock_interview_student         ON mock_interview_results(student_id);
CREATE INDEX IF NOT EXISTS idx_mock_interview_student_created ON mock_interview_results(student_id, created_at DESC);


-- ============================================================================
-- VIEW: latest_student_mock_interviews
--    Latest interview attempt per student — used by the dashboard.
-- ============================================================================
CREATE OR REPLACE VIEW latest_student_mock_interviews AS
SELECT DISTINCT ON (student_id)
    id,
    student_id,
    attempt_number,
    interview_score,
    technical_score,
    communication_score,
    behavioral_score,
    strengths,
    weak_areas,
    feedback_notes,
    transcript,
    mode,
    created_at
FROM mock_interview_results
ORDER BY student_id, created_at DESC;

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
