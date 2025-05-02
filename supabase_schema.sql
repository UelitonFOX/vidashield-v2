-- SQL para criação das tabelas no Supabase (PostgreSQL)

CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(200),
    name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user',
    oauth_provider VARCHAR(20),
    oauth_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    reset_token VARCHAR(100) UNIQUE,
    reset_token_expires TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alert (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    details JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_time TIMESTAMP,
    resolved_by INTEGER REFERENCES "user"(id),
    user_id INTEGER REFERENCES "user"(id)
);
