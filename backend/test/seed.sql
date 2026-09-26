TRUNCATE TABLE expenses RESTART IDENTITY;

INSERT INTO expenses (name, amount, category, date)
VALUES
    ('Walmart', 70.00, 'Groceries', '2026-09-10'),
    ('Internet', 100.00, 'Utilities', '2026-09-15'),
    ('Gas', 40.00, 'Transportation', '2026-09-20'),
    ('Restaurant', 50.00, 'Food', '2026-09-22');