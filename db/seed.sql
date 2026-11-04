-- Insert Default Expense Categories
INSERT INTO categories (name, type) VALUES
('Food', 'expense'),
('Transport', 'expense'),
('Shopping', 'expense'),
('Bills', 'expense'),
('Education', 'expense'),
('Health', 'expense'),
('Entertainment', 'expense'),
('Rent', 'expense'),
('Utilities', 'expense'),
('Other', 'expense')
ON CONFLICT (name) DO NOTHING;

-- Insert Default Income Categories
INSERT INTO categories (name, type) VALUES
('Salary', 'income'),
('Freelance', 'income'),
('Business', 'income'),
('Investment', 'income'),
('Other Income', 'income')
ON CONFLICT (name) DO NOTHING;

-- Insert Sample Baseline Transactions (September 2026)
INSERT INTO transactions (date, description, amount, type, category_id, currency) VALUES
('2026-09-01', 'Software Engineer Monthly Salary', 150000.00, 'income', (SELECT id FROM categories WHERE name = 'Salary'), 'PKR'),
('2026-09-02', 'Monthly Apartment Rent', 45000.00, 'expense', (SELECT id FROM categories WHERE name = 'Rent'), 'PKR'),
('2026-09-03', 'Supermarket Grocery Shopping', 18500.00, 'expense', (SELECT id FROM categories WHERE name = 'Food'), 'PKR'),
('2026-09-04', 'Fuel & Fuel Refill', 8500.00, 'expense', (SELECT id FROM categories WHERE name = 'Transport'), 'PKR'),
('2026-09-05', 'Full-Stack Project Freelance Income', 450.00, 'income', (SELECT id FROM categories WHERE name = 'Freelance'), 'USD'),
('2026-09-06', 'High-Speed Fiber Internet Bill', 4500.00, 'expense', (SELECT id FROM categories WHERE name = 'Bills'), 'PKR'),
('2026-09-07', 'Mechanical Keyboard & Desk Accessories', 26000.00, 'expense', (SELECT id FROM categories WHERE name = 'Shopping'), 'PKR'),
('2026-09-08', 'Software Architecture Online Course', 15000.00, 'expense', (SELECT id FROM categories WHERE name = 'Education'), 'PKR');

-- Insert Sample Monthly Budgets (September 2026 matching dummy dataset)
INSERT INTO budgets (category_id, month, year, amount, currency) VALUES
((SELECT id FROM categories WHERE name = 'Rent'), 9, 2026, 1240000.00, 'PKR'),
((SELECT id FROM categories WHERE name = 'Shopping'), 9, 2026, 660000.00, 'PKR'),
((SELECT id FROM categories WHERE name = 'Food'), 9, 2026, 480000.00, 'PKR'),
((SELECT id FROM categories WHERE name = 'Education'), 9, 2026, 465000.00, 'PKR'),
((SELECT id FROM categories WHERE name = 'Transport'), 9, 2026, 215000.00, 'PKR'),
((SELECT id FROM categories WHERE name = 'Bills'), 9, 2026, 155000.00, 'PKR'),
((SELECT id FROM categories WHERE name = 'Entertainment'), 9, 2026, 60000.00, 'PKR'),
((SELECT id FROM categories WHERE name = 'Health'), 9, 2026, 35000.00, 'PKR'),
((SELECT id FROM categories WHERE name = 'Utilities'), 9, 2026, 30000.00, 'PKR'),
((SELECT id FROM categories WHERE name = 'Other'), 9, 2026, 25000.00, 'PKR'),
((SELECT id FROM categories WHERE name = 'Rent'), 9, 2026, 4500.00, 'USD'),
((SELECT id FROM categories WHERE name = 'Shopping'), 9, 2026, 2400.00, 'USD'),
((SELECT id FROM categories WHERE name = 'Food'), 9, 2026, 1750.00, 'USD'),
((SELECT id FROM categories WHERE name = 'Education'), 9, 2026, 1650.00, 'USD'),
((SELECT id FROM categories WHERE name = 'Transport'), 9, 2026, 800.00, 'USD'),
((SELECT id FROM categories WHERE name = 'Bills'), 9, 2026, 550.00, 'USD'),
((SELECT id FROM categories WHERE name = 'Entertainment'), 9, 2026, 250.00, 'USD'),
((SELECT id FROM categories WHERE name = 'Health'), 9, 2026, 150.00, 'USD'),
((SELECT id FROM categories WHERE name = 'Utilities'), 9, 2026, 120.00, 'USD'),
((SELECT id FROM categories WHERE name = 'Other'), 9, 2026, 100.00, 'USD')
ON CONFLICT (category_id, month, year, currency) DO UPDATE SET amount = EXCLUDED.amount;
