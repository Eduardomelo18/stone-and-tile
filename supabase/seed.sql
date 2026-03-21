-- Sample data for Stone & Tile Care app
-- Run AFTER schema.sql

-- Sample staff
insert into staff (name, role, hourly_rate, phone, email) values
  ('Marco (Owner)', 'Owner / Operator', 85.00, '0412 000 001', 'marco@stoneandtile.com.au'),
  ('Jake Thompson', 'Technician', 40.00, '0412 000 002', 'jake@stoneandtile.com.au');

-- Sample clients
insert into clients (name, phone, email, address, suburb, notes) values
  ('Sarah Johnson', '0411 111 001', 'sarah@email.com', '14 Rose St', 'Mosman', 'Referral from Mike D'),
  ('David Chen', '0411 111 002', 'david@email.com', '8 Harbor Rd', 'Manly', null),
  ('Emma Williams', '0411 111 003', 'emma@email.com', '22 Palm Ave', 'Bondi', 'Repeat customer'),
  ('Tom Murray', '0411 111 004', null, '55 Hill St', 'Chatswood', null),
  ('Lisa Park', '0411 111 005', 'lisa@email.com', '3 Ocean Dr', 'Cronulla', 'Large property');

-- Sample company expenses
insert into company_expenses (category, description, amount, frequency, expense_date, notes) values
  ('Insurance', 'Public liability insurance', 250.00, 'monthly', '2026-03-01', 'Annual policy paid monthly'),
  ('Vehicle', 'Van repayment', 650.00, 'monthly', '2026-03-01', 'Sprinter van loan'),
  ('Vehicle', 'Van registration', 900.00, 'yearly', '2026-01-01', null),
  ('Fuel', 'Company fuel (non-job)', 200.00, 'monthly', '2026-03-01', null),
  ('Marketing', 'Google Ads', 300.00, 'monthly', '2026-03-01', null),
  ('Software', 'Business apps (QuickBooks, etc)', 80.00, 'monthly', '2026-03-01', null),
  ('Phone', 'Phone & internet plan', 120.00, 'monthly', '2026-03-01', null),
  ('Accounting', 'Bookkeeper', 400.00, 'monthly', '2026-03-01', 'Monthly BAS + bookkeeping'),
  ('Storage', 'Warehouse/storage unit', 350.00, 'monthly', '2026-03-01', null),
  ('Tools', 'Tool maintenance & replacement', 150.00, 'monthly', '2026-03-01', null);
