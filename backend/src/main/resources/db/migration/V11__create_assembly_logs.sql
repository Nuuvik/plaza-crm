CREATE TABLE IF NOT EXISTS assembly_logs
(
    id         BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products (id),
    quantity   INT    NOT NULL CHECK (quantity > 0),
    username   VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted    BOOLEAN NOT NULL DEFAULT FALSE
);