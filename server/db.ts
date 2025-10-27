import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return null;
  }
  const client = neon(url);
  const db = drizzle(client);
  return db;
}

/**
 * Run minimal bootstrap to ensure tables exist when using a fresh database.
 * Safe to call multiple times.
 */
export async function bootstrapDb() {
  const db = getDb();
  if (!db) return;

  // Create tables if they do not exist (matching shared/schema.ts)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS admins (
      id varchar PRIMARY KEY,
      username text UNIQUE NOT NULL,
      password text NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS slideshow_images (
      id varchar PRIMARY KEY,
      image_url text NOT NULL,
      "order" integer NOT NULL DEFAULT 0,
      is_active boolean NOT NULL DEFAULT true,
      created_at timestamp DEFAULT now()
    );
  `);

  await db.execute(sql`
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
  `);

  await db.execute(sql`
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
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS contacts (
      id varchar PRIMARY KEY,
      name text NOT NULL,
      email text NOT NULL,
      message text NOT NULL,
      created_at timestamp DEFAULT now()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS uploads (
      id varchar PRIMARY KEY,
      filename text NOT NULL,
      url text NOT NULL,
      mimetype text NOT NULL,
      size integer NOT NULL,
      is_video boolean NOT NULL DEFAULT false,
      created_at timestamp DEFAULT now()
    );
  `);

  // Seed a default admin to guarantee access (id can be any stable string)
  await db.execute(sql`
    INSERT INTO admins (id, username, password)
    VALUES ('default-apurva', 'apurva', 'bakerybites2025')
    ON CONFLICT (username) DO NOTHING;
  `);

  // Optional backup admin
  await db.execute(sql`
    INSERT INTO admins (id, username, password)
    VALUES ('default-admin', 'admin', 'admin123')
    ON CONFLICT (username) DO NOTHING;
  `);
}