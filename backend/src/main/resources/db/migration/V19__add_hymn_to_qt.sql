-- V19__add_hymn_to_qt.sql
ALTER TABLE qt_daily_contents ADD COLUMN IF NOT EXISTS hymn TEXT;

