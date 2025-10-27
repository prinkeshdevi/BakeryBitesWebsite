-- Postgres schema for Bakery Bites
-- Run this once to create all necessary tables

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Admin users
CREATE TABLE IF NOT EXISTS admins (
  id varchar PRIMARY KEY,
  username text UNIQUE NOT NULL,
  password text NOT NULL
);

-- Slideshow images
CREATE TABLE IF NOT EXISTS slideshow_images (
  id varchar PRIMARY KEY,
  image_url text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp DEFAULT now()
);

-- Products (photos and items displayed on the site)
CREATE TABLE IF NOT EXISTS products (
  id varchar PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  price integer NOT NULL,
  category text NOT NULL,
  image_url text NOT NULL,
  is_chef_choice boolean NOT NULL DEFAULT false,
  is_signature boolean NOT NULL DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- Custom cake orders (messages with order details)
CREATE TABLE IF NOT EXISTS custom_orders (
  id varchar PRIMARY KEY,
  cake_type text NOT NULL,
  size text NOT NULL,
  flavor text NOT NULL,
  custom_message text,
  delivery_date text NOT NULL,
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  created_at timestamp DEFAULT now()
);

-- Contact messages
CREATE TABLE IF NOT EXISTS contacts (
  id varchar PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamp DEFAULT now()
);

-- Uploads (images/videos and any other files)
CREATE TABLE IF NOT EXISTS uploads (
  id varchar PRIMARY KEY,
  filename text NOT NULL,
  url text NOT NULL,
  mimetype text NOT NULL,
  size integer NOT NULL,
  is_video boolean NOT NULL DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_custom_orders_created ON custom_orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_uploads_created ON uploads (created_at DESC);

-- Seed default admins
INSERT INTO admins (id, username, password)
VALUES ('default-apurva', 'apurva', 'bakerybites2025')
ON CONFLICT (username) DO NOTHING;

INSERT INTO admins (id, username, password)
VALUES ('default-admin', 'admin', 'admin123')
ON CONFLICT (username) DO NOTHING;