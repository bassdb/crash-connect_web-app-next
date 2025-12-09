-- Migration: Add color defaults and bindings to design_templates
-- Created: 2025-10-16
-- Purpose:
--  - Add jsonb column color_defaults to store primary/secondary/tertiary default colors
--  - Add jsonb column color_bindings to map canvas layer tags to color roles
--  - Add integer column color_schema_version for forward compatibility

begin;

-- Ensure table exists before altering (no-op if it doesn't; will error otherwise)
-- You can wrap with DO block if you need conditional existence checks across schemas.

alter table if exists public.design_templates
  add column if not exists color_defaults jsonb not null default '{"primary":"#000000","secondary":"#FFFFFF","tertiary":"#808080"}'::jsonb,
  add column if not exists color_bindings jsonb not null default '{"primary_color":"user.primary","secondary_color":"user.secondary","tertiary_color":"user.tertiary"}'::jsonb,
  add column if not exists color_schema_version integer not null default 1;

-- Backfill: make sure no NULLs remain if existing rows had explicit NULLs
update public.design_templates
set 
  color_defaults = coalesce(color_defaults, '{"primary":"#000000","secondary":"#FFFFFF","tertiary":"#808080"}'::jsonb),
  color_bindings = coalesce(color_bindings, '{"primary_color":"user.primary","secondary_color":"user.secondary","tertiary_color":"user.tertiary"}'::jsonb),
  color_schema_version = coalesce(color_schema_version, 1);

-- Optional: comments for documentation
comment on column public.design_templates.color_defaults is 'Default color palette for templates: {primary, secondary, tertiary}';
comment on column public.design_templates.color_bindings is 'Mapping from canvas layer dynamic tags to color roles, e.g. {"primary_color":"user.primary"}';
comment on column public.design_templates.color_schema_version is 'Schema version for color related structure to allow future migrations.';

commit;

-- Down migration (manual):
-- alter table if exists public.design_templates drop column if exists color_schema_version;
-- alter table if exists public.design_templates drop column if exists color_bindings;
-- alter table if exists public.design_templates drop column if exists color_defaults;


