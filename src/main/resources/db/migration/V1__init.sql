CREATE TABLE IF NOT EXISTS users
(
    id         BIGSERIAL PRIMARY KEY,
    username   VARCHAR(50)  NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       VARCHAR(20)  NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted    BOOLEAN      NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS customers
(
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(150),
    email      VARCHAR(255),
    phone      VARCHAR(20),
    telegram   VARCHAR(20),
    address    TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted    BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS products
(
    id             BIGSERIAL PRIMARY KEY,
    sku            VARCHAR(50) UNIQUE,
    name           VARCHAR(255),
    price          NUMERIC(19, 2),
    car            VARCHAR(255),
    stock_quantity INT,
    created_at     TIMESTAMP,
    updated_at     TIMESTAMP,
    deleted        BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS orders
(
    id           BIGSERIAL PRIMARY KEY,
    version      BIGINT,
    customer_id  BIGINT REFERENCES customers (id),
    status       VARCHAR(20),
    total_amount NUMERIC(19, 2),
    notes        VARCHAR(1000),
    created_at   TIMESTAMP,
    updated_at   TIMESTAMP,
    deleted      BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS order_items
(
    id         BIGSERIAL PRIMARY KEY,
    order_id   BIGINT REFERENCES orders (id),
    product_id BIGINT REFERENCES products (id),
    quantity   INT,
    unit_price NUMERIC(19, 2),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted    BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS audit_logs
(
    id          BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(50),
    entity_id   BIGINT,
    action      VARCHAR(50),
    username    VARCHAR(50),
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP,
    deleted     BOOLEAN NOT NULL DEFAULT FALSE
);