-- Migration: Advanced Whitelabeling Fields
-- Date: 2026-02-07

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS terminology JSONB DEFAULT '{
  "training": "Treino",
  "nutrition": "Dieta",
  "protocols": "Protocolos",
  "progress": "Evolução",
  "appointments": "Agenda",
  "messages": "Chat"
}'::JSONB,
ADD COLUMN IF NOT EXISTS marketing_config JSONB DEFAULT '{
  "instagram": "",
  "website": "",
  "social_template_colors": []
}'::JSONB,
ADD COLUMN IF NOT EXISTS landing_page_config JSONB DEFAULT '{
  "hero_title": "",
  "hero_subtitle": "",
  "about_text": "",
  "custom_benefits": []
}'::JSONB,
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create an index for the slug to speed up public page lookups
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
