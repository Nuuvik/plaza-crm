-- Удаляем старый глобальный unique constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_sku_key;

-- Создаём частичный уникальный индекс только для активных записей
CREATE UNIQUE INDEX products_sku_active_unique
    ON products(sku)
    WHERE deleted = false;