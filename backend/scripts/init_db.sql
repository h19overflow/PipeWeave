-- PostgreSQL initialization script
-- Creates extensions needed for PipeWeave

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for additional crypto functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable pg_trgm for text search performance
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create schema for application
CREATE SCHEMA IF NOT EXISTS pipeweave;

-- Set default search path
ALTER DATABASE pipeweave_db SET search_path TO pipeweave, public;
