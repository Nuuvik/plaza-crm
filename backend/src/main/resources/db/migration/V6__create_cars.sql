CREATE TABLE IF NOT EXISTS cars
(
    id         BIGSERIAL PRIMARY KEY,
    brand      VARCHAR(100) NOT NULL,
    model      VARCHAR(100) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted    BOOLEAN NOT NULL DEFAULT FALSE
);