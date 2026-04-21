-- SQLite schema for Property Calculator

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    state TEXT NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('tier1', 'tier2', 'tier3')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create construction costs table
CREATE TABLE IF NOT EXISTS construction_costs (
    id TEXT PRIMARY KEY,
    city_id TEXT NOT NULL,
    quality_level TEXT NOT NULL CHECK (quality_level IN ('basic', 'standard', 'luxury')),
    base_rate DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id)
);

-- Create land costs table
CREATE TABLE IF NOT EXISTS land_costs (
    id TEXT PRIMARY KEY,
    city_id TEXT NOT NULL,
    location_type TEXT NOT NULL CHECK (location_type IN ('cityCore', 'suburb')),
    rate_per_sqft DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id)
);

-- Create labor costs table
CREATE TABLE IF NOT EXISTS labor_costs (
    id TEXT PRIMARY KEY,
    city_id TEXT NOT NULL,
    labor_type TEXT NOT NULL CHECK (labor_type IN ('skilled', 'unskilled')),
    daily_rate DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id)
);

-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    unit TEXT NOT NULL,
    base_cost DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create material quality multipliers table
CREATE TABLE IF NOT EXISTS material_quality_multipliers (
    id TEXT PRIMARY KEY,
    material_id TEXT NOT NULL,
    quality_level TEXT NOT NULL CHECK (quality_level IN ('basic', 'standard', 'luxury')),
    multiplier DECIMAL(4,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES materials(id)
);

-- Create stamp duty table
CREATE TABLE IF NOT EXISTS stamp_duty (
    id TEXT PRIMARY KEY,
    state TEXT NOT NULL,
    property_type TEXT NOT NULL CHECK (property_type IN ('residential', 'commercial')),
    base_rate DECIMAL(4,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create additional charges table
CREATE TABLE IF NOT EXISTS additional_charges (
    id TEXT PRIMARY KEY,
    stamp_duty_id TEXT NOT NULL,
    charge_type TEXT NOT NULL,
    rate DECIMAL(4,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stamp_duty_id) REFERENCES stamp_duty(id)
);

-- Create property calculations table
CREATE TABLE IF NOT EXISTS property_calculations (
    id TEXT PRIMARY KEY,
    city_id TEXT NOT NULL,
    property_type TEXT NOT NULL CHECK (property_type IN ('residential', 'commercial')),
    quality_level TEXT NOT NULL CHECK (quality_level IN ('basic', 'standard', 'luxury')),
    land_area DECIMAL(10,2) NOT NULL,
    built_up_area DECIMAL(10,2) NOT NULL,
    location_type TEXT NOT NULL CHECK (location_type IN ('cityCore', 'suburb')),
    construction_cost DECIMAL(12,2) NOT NULL,
    land_cost DECIMAL(12,2) NOT NULL,
    labor_cost DECIMAL(12,2) NOT NULL,
    material_cost DECIMAL(12,2) NOT NULL,
    stamp_duty DECIMAL(12,2) NOT NULL,
    total_cost DECIMAL(12,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id)
);

-- Create data refresh log table
CREATE TABLE IF NOT EXISTS data_refresh_log (
    id TEXT PRIMARY KEY,
    data_type TEXT NOT NULL,
    refresh_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
    error_message TEXT
); 