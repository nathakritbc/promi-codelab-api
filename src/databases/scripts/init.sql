-- Database initialization script for Catalog Promotions API
-- This script runs when the PostgreSQL container starts for the first time

-- Create database if it doesn't exist (this is handled by POSTGRES_DB environment variable)
-- The database will be created automatically by PostgreSQL

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'Asia/Bangkok';

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE promi_codelab TO postgres;

GRANT ALL PRIVILEGES ON DATABASE promi_codelab_dev TO postgres;

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed successfully';
END $$;