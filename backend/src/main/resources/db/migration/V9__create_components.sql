CREATE TABLE IF NOT EXISTS components
(
    id             BIGSERIAL PRIMARY KEY,
    sku            VARCHAR(50),
    name           VARCHAR(255) NOT NULL,
    stock_quantity INT          NOT NULL DEFAULT 0,
    created_at     TIMESTAMP,
    updated_at     TIMESTAMP,
    deleted        BOOLEAN      NOT NULL DEFAULT FALSE
);

CREATE UNIQUE INDEX components_sku_active_unique
    ON components (sku)
    WHERE deleted = false;