-- Mini AI SDR Database Setup Script
-- Run this in PostgreSQL to create the database and tables

-- Create Database (run as superuser)
-- CREATE DATABASE mini_sdr_db;

-- Connect to the database first: \c mini_sdr_db

-- Enable UUID extension (optional)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Lead status enum
CREATE TYPE lead_status AS ENUM ('new', 'qualified', 'unqualified', 'contacted', 'converted');

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(200),
    job_title VARCHAR(200),
    industry VARCHAR(100),
    company_size VARCHAR(50),
    website VARCHAR(255),
    linkedin_url VARCHAR(255),
    notes TEXT,
    status lead_status DEFAULT 'new',
    qualification_score INTEGER DEFAULT 0,
    qualification_reason TEXT,
    generated_email_subject TEXT,
    generated_email_body TEXT,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_owner_id ON leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data (optional)
-- INSERT INTO users (email, username, hashed_password, full_name) VALUES 
-- ('demo@example.com', 'demo', '$2b$12$...bcrypt_hash...', 'Demo User');

COMMENT ON TABLE users IS 'Stores SDR user accounts';
COMMENT ON TABLE leads IS 'Stores sales leads with AI qualification data';

-- View for lead summary
CREATE OR REPLACE VIEW lead_summary AS
SELECT 
    u.username,
    COUNT(l.id) as total_leads,
    COUNT(CASE WHEN l.status = 'new' THEN 1 END) as new_leads,
    COUNT(CASE WHEN l.status = 'qualified' THEN 1 END) as qualified_leads,
    COUNT(CASE WHEN l.status = 'contacted' THEN 1 END) as contacted_leads,
    COUNT(CASE WHEN l.status = 'converted' THEN 1 END) as converted_leads,
    ROUND(AVG(l.qualification_score), 1) as avg_qualification_score
FROM users u
LEFT JOIN leads l ON u.id = l.owner_id
GROUP BY u.id, u.username;
