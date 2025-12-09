-- Migration: Add columns to incidents table for public incident flow
-- Date: 2024-12-09
-- Description: Adds reporter_ip, verified_at, and incident_date columns to incidents table

-- Add reporter_ip column for rate limiting tracking
ALTER TABLE incidents 
ADD COLUMN IF NOT EXISTS reporter_ip VARCHAR(45);

-- Add verified_at timestamp for phone verification
ALTER TABLE incidents 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Add incident_date for when the incident occurred
ALTER TABLE incidents 
ADD COLUMN IF NOT EXISTS incident_date TIMESTAMPTZ;

-- Add index on reporter_ip for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_incidents_reporter_ip ON incidents(reporter_ip);

-- Add index on verified_at for filtering verified incidents
CREATE INDEX IF NOT EXISTS idx_incidents_verified_at ON incidents(verified_at);

-- Add index on incident_date for date-based queries
CREATE INDEX IF NOT EXISTS idx_incidents_incident_date ON incidents(incident_date);

-- Add comment to columns for documentation
COMMENT ON COLUMN incidents.reporter_ip IS 'IP address of the reporter (for rate limiting)';
COMMENT ON COLUMN incidents.verified_at IS 'Timestamp when phone verification was completed';
COMMENT ON COLUMN incidents.incident_date IS 'Date and time when the incident occurred';

