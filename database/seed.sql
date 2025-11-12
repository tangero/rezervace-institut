-- Seed data for development and testing

-- Insert sample events
INSERT INTO events (
  id, slug, title, short_description, long_description, program,
  venue_address, venue_name, event_date, start_time, duration_minutes,
  guest_names, is_paid, price_czk, max_capacity, status
) VALUES
(
  'evt_001',
  'debata-o-budoucnosti-eu',
  'Debata o budoucnosti Evropské unie',
  'Připojte se k nám na diskusi o klíčových výzvách, kterým EU čelí v následujících letech. S hosty z akademické sféry a politiky.',
  '<p>Evropská unie čelí v následujících letech řadě výzev - od klimatické změny přes digitalizaci až po bezpečnostní hrozby. Jaké jsou možné scénáře vývoje? Co mohou členské státy udělat?</p><p>Na tato a další témata budeme diskutovat s našimi hosty z akademické sféry a politiky.</p>',
  '<ul><li>18:00 - 18:15: Úvod a představení hostů</li><li>18:15 - 19:00: Panelová diskuse</li><li>19:00 - 19:45: Otázky a odpovědi</li><li>19:45 - 20:00: Networking</li></ul>',
  'Na Moráni 360/3, Praha 2, 120 00',
  'Pirátské centrum Praha',
  '2025-12-15',
  '18:00',
  120,
  '["Dr. Jan Novák", "Prof. Marie Svobodová", "Mgr. Petr Dvořák"]',
  0,
  0,
  50,
  'published'
),
(
  'evt_002',
  'workshop-digitalizace',
  'Workshop: Digitalizace veřejné správy',
  'Praktický workshop zaměřený na možnosti digitalizace veřejné správy. Sdílení best practices a diskuse o překážkách.',
  '<p>Digitalizace veřejné správy je klíčová pro zvýšení efektivity a transparentnosti. V tomto workshopu se podíváme na konkrétní příklady úspěšné digitalizace a diskutujeme o překážkách implementace.</p><p>Workshop je určen pro úředníky, politiky, developery a všechny, kdo se zajímají o modernizaci veřejné správy.</p>',
  '<ul><li>14:00 - 14:30: Představení projektu Estonian e-Government</li><li>14:30 - 15:30: Case studies z ČR</li><li>15:30 - 16:00: Přestávka</li><li>16:00 - 17:30: Workshopové sekce</li><li>17:30 - 18:00: Závěrečná diskuse</li></ul>',
  'Drtinova 10, Praha 5, 150 00',
  'Impact Hub Praha',
  '2025-12-20',
  '14:00',
  240,
  '["Ing. Tomáš Krejčí, Ph.D.", "Bc. Anna Marková"]',
  1,
  200,
  30,
  'published'
),
(
  'evt_003',
  'klimaticka-politika-cr',
  'Klimatická politika ČR v roce 2026',
  'Jaké jsou výzvy a příležitosti české klimatické politiky? Diskutujeme s experty o realistických cestách k uhlíkové neutralitě.',
  '<p>Česká republika se zavázala k dosažení uhlíkové neutrality do roku 2050. Jaké kroky je potřeba podniknout již dnes? Jaké jsou náklady a přínosy různých scénářů?</p><p>V této diskusi se zaměříme na konkrétní návrhy a jejich dopady na českou ekonomiku a společnost.</p>',
  '<ul><li>19:00 - 19:15: Úvodní slovo</li><li>19:15 - 20:00: Prezentace klimatických scénářů</li><li>20:00 - 20:45: Diskuse s hosty</li><li>20:45 - 21:00: Závěr a networking</li></ul>',
  'Hybernská 4, Praha 1, 110 00',
  'Kampus Hybernská',
  '2026-01-10',
  '19:00',
  120,
  '["RNDr. Pavel Šťastný, CSc.", "Ing. Lucie Zemanová", "Mgr. Martin Horák"]',
  0,
  0,
  80,
  'published'
),
(
  'evt_004',
  'bezpecnost-v-kyberprostoru',
  'Bezpečnost v kyberprostoru: Hrozby a obrana',
  'Přednáška o aktuálních kybernetických hrozbách a možnostech obrany pro státy i jednotlivce.',
  '<p>Kybernetické útoky se stávají stále sofistikovanějšími. Jak se mohou státy a organizace bránit? Jakou roli hraje vzdělávání občanů?</p>',
  NULL,
  'Kaprova 42/14, Praha 1, 110 00',
  'Goethe-Institut',
  '2026-02-05',
  '17:30',
  90,
  '["Ing. David Černý", "Mgr. Kateřina Nováková"]',
  0,
  0,
  60,
  'published'
),
(
  'evt_005',
  'archiv-vzdelavani-21-stoleti',
  'Vzdělávání v 21. století',
  'Již proběhlá akce o inovacích ve vzdělávání.',
  '<p>Tato akce již proběhla. Zaměřili jsme se na inovace ve vzdělávání a přípravu mladých lidí na výzvy 21. století.</p>',
  NULL,
  'Školní 123, Praha 6, 160 00',
  'Pedagogická fakulta UK',
  '2024-11-01',
  '16:00',
  120,
  '[]',
  0,
  0,
  100,
  'completed'
);

-- Insert sample admin user
-- Password: 'institutpi2024' (hashed with bcrypt)
-- Note: In production, this should be created securely via admin setup script
INSERT INTO admin_users (id, email, password_hash, name) VALUES
(
  'admin_001',
  'patrick.zandl@institutpi.cz',
  '$2b$10$rQ8L.KjJZ9Y4oGZ8vP1.0uX8K7Z7Y9Q8L.KjJZ9Y4oGZ8vP1.0uX8K',
  'Patrick Zandl'
)
ON CONFLICT DO NOTHING;

-- Insert sample registrations (for testing)
INSERT INTO registrations (
  id, event_id, email, confirmation_token, is_confirmed, payment_status, confirmed_at
) VALUES
(
  'reg_001',
  'evt_001',
  'jan.test@example.com',
  'token_abc123',
  1,
  'pending',
  datetime('now', '-5 days')
),
(
  'reg_002',
  'evt_001',
  'marie.test@example.com',
  'token_def456',
  1,
  'pending',
  datetime('now', '-3 days')
),
(
  'reg_003',
  'evt_002',
  'petr.test@example.com',
  'token_ghi789',
  1,
  'paid',
  datetime('now', '-7 days')
)
ON CONFLICT DO NOTHING;
