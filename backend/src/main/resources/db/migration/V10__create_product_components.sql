CREATE TABLE IF NOT EXISTS product_components
(
    id           BIGSERIAL PRIMARY KEY,
    product_id   BIGINT NOT NULL REFERENCES products (id),
    component_id BIGINT NOT NULL REFERENCES components (id),
    quantity     INT    NOT NULL CHECK (quantity > 0),
    UNIQUE (product_id, component_id)
);