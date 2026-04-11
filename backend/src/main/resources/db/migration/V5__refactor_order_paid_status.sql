ALTER TABLE orders ADD COLUMN is_paid BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE orders SET is_paid = true, status = 'CONFIRMED' WHERE status = 'PAID';