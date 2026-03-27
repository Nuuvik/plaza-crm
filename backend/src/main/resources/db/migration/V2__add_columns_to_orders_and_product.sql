
-- 1. Добавляем колонку source как nullable (временно)
ALTER TABLE orders
    ADD COLUMN source VARCHAR(255);

-- 2. Заполняем существующие записи (обязательно, иначе NOT NULL не применится)
UPDATE orders
SET source = 'unknown'
WHERE source IS NULL;

-- 3. Делаем колонку NOT NULL
ALTER TABLE orders
    ALTER COLUMN source SET NOT NULL;

-- 4. Добавляем остальные поля
ALTER TABLE orders
    ADD COLUMN payment_date TIMESTAMP,
    ADD COLUMN payment_method VARCHAR(255);

-- 5. Добавляем поле в product
ALTER TABLE products
    ADD COLUMN additions VARCHAR(255);