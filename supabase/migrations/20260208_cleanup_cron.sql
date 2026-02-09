-- Migration: Schedule stale tenants cleanup
-- Requires pg_cron extension to be enabled in Supabase

-- 1. Enable pg_cron (if not enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Schedule the HTTP POST to the cleanup Edge Function
-- Runs every day at 3 AM UTC
SELECT cron.schedule(
    'cleanup-stale-tenants-daily',
    '0 3 * * *',
    $$
    SELECT
      net.http_post(
        url := 'https://pndqofpghpntrxhryqbe.supabase.co/functions/v1/cleanup-stale-tenants',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb,
        body := '{}'::jsonb
      ) as request_id;
    $$
);

-- Note: In production, the SERVICE_ROLE_KEY should be set during deployment or injection.
-- The URL is specific to the project ID.
