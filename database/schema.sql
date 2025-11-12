-- Institut Pí Event Management System
-- D1 Database Schema

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT,
  program TEXT,
  image_url TEXT,
  image_alt TEXT,
  venue_address TEXT NOT NULL,
  venue_name TEXT,
  event_date TEXT NOT NULL, -- ISO 8601 format (YYYY-MM-DD)
  start_time TEXT NOT NULL, -- HH:MM format
  duration_minutes INTEGER NOT NULL,
  guest_names TEXT, -- JSON array of guest names
  is_paid BOOLEAN DEFAULT 0,
  price_czk INTEGER DEFAULT 0,
  payment_qr_data TEXT, -- QR code data for payment
  payment_account TEXT, -- Bank account number
  payment_variable_symbol TEXT,
  max_capacity INTEGER,
  current_registrations INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft', -- draft, published, cancelled, completed
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);

-- Registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  email TEXT NOT NULL,
  confirmation_token TEXT UNIQUE NOT NULL,
  is_confirmed BOOLEAN DEFAULT 0,
  payment_status TEXT DEFAULT 'pending', -- pending, paid, cancelled
  payment_confirmed_at TEXT,
  registered_at TEXT DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TEXT,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  UNIQUE(event_id, email)
);

-- Indexes for registrations
CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_token ON registrations(confirmation_token);

-- Reminder settings table
CREATE TABLE IF NOT EXISTS reminder_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  days_before INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT 1
);

-- Default reminder settings
INSERT INTO reminder_settings (name, days_before, is_active) VALUES
  ('Měsíc před akcí', 30, 1),
  ('Týden před akcí', 7, 1),
  ('Den před akcí', 1, 1)
ON CONFLICT DO NOTHING;

-- Sent reminders table (to track which reminders have been sent)
CREATE TABLE IF NOT EXISTS sent_reminders (
  id TEXT PRIMARY KEY,
  registration_id TEXT NOT NULL,
  reminder_type TEXT NOT NULL, -- e.g., '30_days', '7_days', '1_day'
  sent_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE
);

-- Index for sent reminders
CREATE INDEX IF NOT EXISTS idx_sent_reminders_registration ON sent_reminders(registration_id);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_events_timestamp
AFTER UPDATE ON events
FOR EACH ROW
BEGIN
  UPDATE events SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger to increment current_registrations when a registration is confirmed
CREATE TRIGGER IF NOT EXISTS increment_registrations
AFTER UPDATE OF is_confirmed ON registrations
FOR EACH ROW
WHEN NEW.is_confirmed = 1 AND OLD.is_confirmed = 0
BEGIN
  UPDATE events
  SET current_registrations = current_registrations + 1
  WHERE id = NEW.event_id;
END;

-- Trigger to decrement current_registrations when a registration is cancelled
CREATE TRIGGER IF NOT EXISTS decrement_registrations
AFTER UPDATE OF payment_status ON registrations
FOR EACH ROW
WHEN NEW.payment_status = 'cancelled' AND OLD.payment_status != 'cancelled' AND NEW.is_confirmed = 1
BEGIN
  UPDATE events
  SET current_registrations = current_registrations - 1
  WHERE id = NEW.event_id;
END;
