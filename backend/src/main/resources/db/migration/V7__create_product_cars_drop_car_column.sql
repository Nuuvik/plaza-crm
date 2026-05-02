CREATE TABLE IF NOT EXISTS product_cars
(
    product_id BIGINT NOT NULL REFERENCES products (id),
    car_id     BIGINT NOT NULL REFERENCES cars (id),
    PRIMARY KEY (product_id, car_id)
);

ALTER TABLE products DROP COLUMN car;